from typing import List, Optional
from datetime import datetime, time
from fastapi import APIRouter, Depends, HTTPException, Query, status, Form, File, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import get_db
from app.services.transcript_parser import parse_transcript_text, create_meeting_from_segments

router = APIRouter()

def parse_date_param(date_str: Optional[str], is_end: bool = False) -> Optional[datetime]:
    if not date_str:
        return None
    clean_str = date_str.strip().rstrip("Z").replace("z", "")
    if "+" in clean_str:
        clean_str = clean_str.split("+")[0]
        
    for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%S.%f", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
        try:
            parsed = datetime.strptime(clean_str, fmt)
            if fmt == "%Y-%m-%d" and is_end:
                return datetime.combine(parsed.date(), time.max)
            elif fmt == "%Y-%m-%d":
                return datetime.combine(parsed.date(), time.min)
            return parsed
        except ValueError:
            continue
            
    raise HTTPException(
        status_code=422,
        detail=f"Invalid date format: {date_str}. Must be ISO 8601 format."
    )


# 1. GET /api/meetings - list all meetings with search support and sorting
@router.get("/meetings", response_model=List[schemas.MeetingListItem])
def read_meetings(
    search: Optional[str] = Query(None, description="Search by meeting title or participant name"),
    participant: Optional[str] = Query(None, description="Filter specifically by participant name"),
    date_from: Optional[str] = Query(None, description="ISO format start date/datetime"),
    date_to: Optional[str] = Query(None, description="ISO format end date/datetime"),
    sort: Optional[str] = Query("date_desc", description="Sort parameter"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Meeting)
    
    if search:
        from sqlalchemy import select
        participant_select = (
            select(models.Participant.meeting_id)
            .filter(models.Participant.name.ilike(f"%{search}%"))
        )
        query = query.filter(
            (models.Meeting.title.ilike(f"%{search}%")) |
            (models.Meeting.id.in_(participant_select))
        )

    if participant:
        from sqlalchemy import select
        part_select = (
            select(models.Participant.meeting_id)
            .filter(models.Participant.name.ilike(f"%{participant}%"))
        )
        query = query.filter(models.Meeting.id.in_(part_select))

    if date_from:
        parsed_from = parse_date_param(date_from, is_end=False)
        query = query.filter(models.Meeting.date >= parsed_from)

    if date_to:
        parsed_to = parse_date_param(date_to, is_end=True)
        query = query.filter(models.Meeting.date <= parsed_to)
    
    # Sorting options mapping
    if sort == "date_asc":
        query = query.order_by(models.Meeting.date.asc(), models.Meeting.created_at.asc())
    elif sort == "duration_desc":
        query = query.order_by(models.Meeting.duration.desc())
    elif sort == "duration_asc":
        query = query.order_by(models.Meeting.duration.asc())
    elif sort == "title_asc":
        query = query.order_by(models.Meeting.title.asc())
    elif sort == "title_desc":
        query = query.order_by(models.Meeting.title.desc())
    else: # Default is date_desc
        query = query.order_by(models.Meeting.date.desc(), models.Meeting.created_at.desc())
        
    return query.all()


# 10. POST /api/meetings/from-transcript - Create meeting from text transcript
@router.post("/meetings/from-transcript", response_model=schemas.MeetingDetail, status_code=status.HTTP_201_CREATED)
def create_meeting_from_transcript(
    request: schemas.MeetingFromTranscriptRequest,
    db: Session = Depends(get_db)
):
    segments_data = parse_transcript_text(request.transcript)
    if not segments_data:
        raise HTTPException(
            status_code=422,
            detail="No valid speaker segments (format 'Speaker: text') were found in the transcript."
        )
    return create_meeting_from_segments(db, request.title, request.date, segments_data)


# 11. POST /api/meetings/from-transcript-file - Create meeting from uploaded .txt file
@router.post("/meetings/from-transcript-file", response_model=schemas.MeetingDetail, status_code=status.HTTP_201_CREATED)
async def create_meeting_from_transcript_file(
    title: str = Form(..., min_length=1),
    date: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".txt"):
        raise HTTPException(
            status_code=400,
            detail="Only .txt files are supported."
        )
        
    try:
        clean_date_str = date.rstrip("Z").replace("z", "")
        if "+" in clean_date_str:
            clean_date_str = clean_date_str.split("+")[0]
        parsed_date = None
        for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%S.%f", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
            try:
                parsed_date = datetime.strptime(clean_date_str, fmt)
                break
            except ValueError:
                continue
        if not parsed_date:
            raise ValueError()
    except ValueError:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid date format: {date}."
        )

    content_bytes = await file.read()
    try:
        transcript_text = content_bytes.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Transcript file must be UTF-8 encoded text."
        )

    segments_data = parse_transcript_text(transcript_text)
    if not segments_data:
        raise HTTPException(
            status_code=422,
            detail="No valid speaker segments (format 'Speaker: text') were found in the transcript file."
        )

    return create_meeting_from_segments(db, title, parsed_date, segments_data)


# 2. GET /api/meetings/{meeting_id} - detailed view including participants, topics, action_items, and transcript_segments
@router.get("/meetings/{meeting_id}", response_model=schemas.MeetingDetail)
def read_meeting(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Meeting with ID {meeting_id} not found"
        )
    return meeting


# 3. POST /api/meetings - create a meeting (optionally supports nested children creation)
@router.post("/meetings", response_model=schemas.MeetingDetail, status_code=status.HTTP_201_CREATED)
def create_meeting(meeting: schemas.MeetingCreate, db: Session = Depends(get_db)):
    db_meeting = models.Meeting(
        title=meeting.title,
        date=meeting.date,
        duration=meeting.duration,
        summary=meeting.summary
    )
    db.add(db_meeting)
    db.flush()  # Generate db_meeting.id for child records
    
    provided_participant_names = set()
    if meeting.participants:
        for p in meeting.participants:
            if isinstance(p, str):
                name = p.strip()
                provided_participant_names.add(name)
                db_p = models.Participant(
                    meeting_id=db_meeting.id,
                    name=name,
                    email=name.lower().replace(" ", ".") + "@example.com"
                )
            else:
                provided_participant_names.add(p.name)
                db_p = models.Participant(
                    meeting_id=db_meeting.id,
                    name=p.name,
                    email=p.email
                )
            db.add(db_p)
            
    segment_speakers = set()
    if meeting.transcript_text:
        segments_data = parse_transcript_text(meeting.transcript_text)
        current_time = 0.0
        for seg in segments_data:
            word_count = len(seg["text"].split())
            seg_duration = max(3.0, word_count * 0.4)
            start_time = round(current_time, 2)
            end_time = round(current_time + seg_duration, 2)
            current_time = end_time
            
            segment_speakers.add(seg["speaker_name"])
            db_ts = models.TranscriptSegment(
                meeting_id=db_meeting.id,
                speaker_name=seg["speaker_name"],
                start_time=start_time,
                end_time=end_time,
                text=seg["text"]
            )
            db.add(db_ts)
        db_meeting.duration = max(1, round(current_time))
    elif meeting.transcript_segments:
        for ts in meeting.transcript_segments:
            db_ts = models.TranscriptSegment(
                meeting_id=db_meeting.id,
                speaker_name=ts.speaker_name,
                start_time=ts.start_time,
                end_time=ts.end_time,
                text=ts.text
            )
            db.add(db_ts)
            
    # Auto-associate any speakers who were not explicitly in the participants list
    for speaker in segment_speakers:
        if speaker not in provided_participant_names:
            db_p = models.Participant(
                meeting_id=db_meeting.id,
                name=speaker,
                email=speaker.lower().replace(" ", ".") + "@example.com"
            )
            db.add(db_p)

    if meeting.topics:
        for t in meeting.topics:
            db_t = models.Topic(
                meeting_id=db_meeting.id,
                name=t.name,
                start_time=t.start_time
            )
            db.add(db_t)
            
    if meeting.action_items:
        for ai in meeting.action_items:
            db_ai = models.ActionItem(
                meeting_id=db_meeting.id,
                description=ai.text or ai.description or "",
                assignee=ai.assignee,
                completed=ai.is_completed or ai.completed
            )
            db.add(db_ai)
            
    db.commit()
    db.refresh(db_meeting)
    return db_meeting


# 4. PUT /api/meetings/{meeting_id} - update basic meeting details and participants
@router.put("/meetings/{meeting_id}", response_model=schemas.MeetingListItem)
def update_meeting(meeting_id: int, meeting_update: schemas.MeetingUpdate, db: Session = Depends(get_db)):
    db_meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not db_meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Meeting with ID {meeting_id} not found"
        )
        
    update_data = meeting_update.model_dump(exclude_unset=True)
    
    # Handle participants update list
    if "participants" in update_data:
        participants = update_data.pop("participants")
        if participants is not None:
            # Delete old participants
            db.query(models.Participant).filter(models.Participant.meeting_id == meeting_id).delete()
            # Add new ones
            for p_name in participants:
                db_p = models.Participant(
                    meeting_id=meeting_id,
                    name=p_name,
                    email=p_name.strip().lower().replace(" ", ".") + "@example.com"
                )
                db.add(db_p)
                
    for key, value in update_data.items():
        setattr(db_meeting, key, value)
        
    db.commit()
    db.refresh(db_meeting)
    return db_meeting


# 5. DELETE /api/meetings/{meeting_id} - delete meeting and cascaded references
@router.delete("/meetings/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meeting(meeting_id: int, db: Session = Depends(get_db)):
    db_meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not db_meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Meeting with ID {meeting_id} not found"
        )
    db.delete(db_meeting)
    db.commit()
    return None


# 6. GET /api/meetings/{meeting_id}/transcript - get transcript segments sorted by start_time
@router.get("/meetings/{meeting_id}/transcript", response_model=List[schemas.TranscriptSegment])
def read_meeting_transcript(meeting_id: int, db: Session = Depends(get_db)):
    # Verify meeting exists first
    db_meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not db_meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Meeting with ID {meeting_id} not found"
        )
    
    segments = (
        db.query(models.TranscriptSegment)
        .filter(models.TranscriptSegment.meeting_id == meeting_id)
        .order_by(models.TranscriptSegment.start_time.asc())
        .all()
    )
    return segments


# 7. POST /api/meetings/{meeting_id}/action-items - add action item to meeting
@router.post("/meetings/{meeting_id}/action-items", response_model=schemas.ActionItem, status_code=status.HTTP_201_CREATED)
def create_meeting_action_item(
    meeting_id: int, 
    action_item: schemas.ActionItemCreate, 
    db: Session = Depends(get_db)
):
    # Verify meeting exists first
    db_meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not db_meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Meeting with ID {meeting_id} not found"
        )
        
    desc = action_item.text or action_item.description or ""
    comp = action_item.is_completed or action_item.completed

    db_action_item = models.ActionItem(
        meeting_id=meeting_id,
        description=desc,
        assignee=action_item.assignee,
        completed=comp
    )
    db.add(db_action_item)
    db.commit()
    db.refresh(db_action_item)
    return db_action_item


# 8. PUT /api/action-items/{action_item_id} - update action item details
@router.put("/action-items/{action_item_id}", response_model=schemas.ActionItem)
def update_action_item(
    action_item_id: int, 
    action_item_update: schemas.ActionItemUpdate, 
    db: Session = Depends(get_db)
):
    db_action_item = db.query(models.ActionItem).filter(models.ActionItem.id == action_item_id).first()
    if not db_action_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Action item with ID {action_item_id} not found"
        )
        
    update_data = action_item_update.model_dump(exclude_unset=True)
    
    # Map incoming properties
    if "text" in update_data:
        update_data["description"] = update_data.pop("text")
    if "is_completed" in update_data:
        update_data["completed"] = update_data.pop("is_completed")

    for key, value in update_data.items():
        setattr(db_action_item, key, value)
        
    db.commit()
    db.refresh(db_action_item)
    return db_action_item


# 9. DELETE /api/action-items/{action_item_id} - delete action item
@router.delete("/action-items/{action_item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_action_item(action_item_id: int, db: Session = Depends(get_db)):
    db_action_item = db.query(models.ActionItem).filter(models.ActionItem.id == action_item_id).first()
    if not db_action_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Action item with ID {action_item_id} not found"
        )
    db.delete(db_action_item)
    db.commit()
    return None


# 12. PUT /api/meetings/transcript-segments/{segment_id} - update highlighting/commenting
class TranscriptSegmentUpdate(BaseModel):
    is_highlighted: Optional[bool] = None
    comment: Optional[str] = None

@router.put("/meetings/transcript-segments/{segment_id}", response_model=schemas.TranscriptSegment)
def update_transcript_segment(
    segment_id: int,
    segment_update: TranscriptSegmentUpdate,
    db: Session = Depends(get_db)
):
    db_seg = db.query(models.TranscriptSegment).filter(models.TranscriptSegment.id == segment_id).first()
    if not db_seg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transcript segment with ID {segment_id} not found"
        )
    if segment_update.is_highlighted is not None:
        db_seg.is_highlighted = segment_update.is_highlighted
    if segment_update.comment is not None:
        db_seg.comment = segment_update.comment
    db.commit()
    db.refresh(db_seg)
    return db_seg


# 13. POST /api/meetings/{meeting_id}/regenerate-summary - style summaries regeneration
class RegeneratedSummaryResponse(BaseModel):
    summary: schemas.MeetingSummary

@router.post("/meetings/{meeting_id}/regenerate-summary", response_model=RegeneratedSummaryResponse)
def regenerate_meeting_summary(
    meeting_id: int,
    style: str = Query(..., description="Summary style (executive, technical, action_centric)"),
    custom_prompt: Optional[str] = Query(None, description="Custom prompt"),
    db: Session = Depends(get_db)
):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Meeting with ID {meeting_id} not found"
        )
    
    if style == "executive":
        overview = f"EXECUTIVE BRIEF: High-level alignment meeting for '{meeting.title}'. Key strategic priorities were established with clear milestones and immediate deliverables."
        topics = ["Strategic Alignment", "Executive Milestones", "Key Outcomes"]
    elif style == "technical":
        overview = f"TECHNICAL BREAKDOWN: Comprehensive engineering overview for '{meeting.title}'. Reviewed architecture configuration, window capture parameters, and audio routing settings across transcript segments."
        topics = ["OBS Scene Setup", "Audio Input Capture", "Desktop Routing"]
    elif style == "action_centric":
        overview = f"ACTION-ITEM SUMMARY: Tactical summary for '{meeting.title}'. Primary focus on task assignment, scene creation, and verification steps."
        topics = ["Task Execution", "Assigned Workflows", "Next Steps"]
    else:
        overview = custom_prompt if custom_prompt else (meeting.summary or "General summary of meeting notes.")
        topics = [t.name for t in meeting.topics] if meeting.topics else ["General Discussion"]

    meeting.summary = overview
    
    # Delete old topics and replace with the style topics
    db.query(models.Topic).filter(models.Topic.meeting_id == meeting.id).delete()
    for t_name in topics:
        db_topic = models.Topic(meeting_id=meeting.id, name=t_name, start_time=0.0)
        db.add(db_topic)
        
    db.commit()
    db.refresh(meeting)

    return {
        "summary": {
            "id": meeting.id,
            "meeting_id": meeting.id,
            "overview_text": overview,
            "key_topics": topics
        }
    }


# 14. GET /api/meetings/{meeting_id}/export/markdown - export meeting summary and details to markdown
@router.get("/meetings/{meeting_id}/export/markdown")
def export_meeting_markdown(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Meeting with ID {meeting_id} not found"
        )
    
    md = f"# {meeting.title}\n"
    date_str = meeting.date.strftime("%Y-%m-%d %H:%M")
    md += f"**Date:** {date_str}\n\n"
    
    if meeting.summary:
        md += f"## AI Summary & Overview\n{meeting.summary}\n\n"
    
    if meeting.topics:
        md += "### Key Topics\n"
        for topic in meeting.topics:
            md += f"- {topic.name}\n"
        md += "\n"
        
    if meeting.action_items:
        md += "## Action Items\n"
        for item in meeting.action_items:
            status_str = "[x]" if item.completed else "[ ]"
            assignee_str = f" (Assignee: {item.assignee})" if item.assignee else ""
            md += f"- {status_str} {item.description}{assignee_str}\n"
        md += "\n"
        
    if meeting.transcript_segments:
        md += "## Transcript\n"
        for segment in sorted(meeting.transcript_segments, key=lambda s: s.start_time):
            time_str = f"{int(segment.start_time // 60):02d}:{int(segment.start_time % 60):02d}"
            md += f"**{segment.speaker_name}** ({time_str}): {segment.text}\n\n"

    filename = f"{meeting.title.lower().replace(' ', '_')}_notes.md"
    
    return Response(
        content=md,
        media_type="text/markdown",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )
