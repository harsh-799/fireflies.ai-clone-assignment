from datetime import datetime
from typing import List
from sqlalchemy.orm import Session
from app import models

def parse_transcript_text(transcript: str) -> List[dict]:
    """
    Parses transcripts in format 'Speaker: text' line-by-line.
    Supports multi-line dialogue under the same speaker.
    """
    segments = []
    if not transcript:
        return segments

    lines = transcript.strip().splitlines()
    current_speaker = None
    current_text = []
    import re

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Skip lines that look like URL links
        if any(scheme in line.lower() for scheme in ("http://", "https://")):
            if current_speaker:
                current_text.append(line)
            continue

        # Match: Speaker Name (optional timestamp): text
        match = re.match(r"^([^:]*?\s*(?:\(\d{1,2}:\d{2}(?::\d{2})?\))?)\s*:\s*(.*)$", line)
        if match:
            speaker = match.group(1).strip()
            text = match.group(2).strip()

            # Clean timestamp pattern from speaker name
            speaker = re.sub(r'\s*\(\d{1,2}:\d{2}(?::\d{2})?\)\s*$', '', speaker).strip()

            # Ensure speaker name is reasonable
            if 0 < len(speaker) < 50:
                if current_speaker and current_text:
                    segments.append({
                        "speaker_name": current_speaker,
                        "text": " ".join(current_text)
                    })
                current_speaker = speaker
                current_text = [text]
                continue

        # If it's a continuation line, append to current speaker
        if current_speaker:
            current_text.append(line)

    # Append the final segment
    if current_speaker and current_text:
        segments.append({
            "speaker_name": current_speaker,
            "text": " ".join(current_text)
        })

    return segments


def create_meeting_from_segments(
    db: Session, 
    title: str, 
    date: datetime, 
    segments_data: List[dict]
) -> models.Meeting:
    """
    Given parsed speaker segment dictionary objects, assigns sequential start/end
    timestamps, calculates the meeting duration, and persists everything to SQLite.
    """
    current_time = 0.0
    calculated_segments = []
    
    for seg in segments_data:
        # 0.4 seconds per word, minimum 3.0 seconds
        word_count = len(seg["text"].split())
        duration = max(3.0, word_count * 0.4)
        
        start_time = round(current_time, 2)
        end_time = round(current_time + duration, 2)
        current_time = end_time
        
        calculated_segments.append({
            "speaker_name": seg["speaker_name"],
            "start_time": start_time,
            "end_time": end_time,
            "text": seg["text"]
        })
        
    # Duration in seconds, ensuring it is a positive integer >= 1
    meeting_duration_seconds = max(1, round(current_time))
    
    db_meeting = models.Meeting(
        title=title,
        date=date,
        duration=meeting_duration_seconds,
        summary=f"Meeting generated from transcript containing {len(segments_data)} segments."
    )
    db.add(db_meeting)
    db.flush()  # Generate db_meeting.id
    
    for seg in calculated_segments:
        db_seg = models.TranscriptSegment(
            meeting_id=db_meeting.id,
            speaker_name=seg["speaker_name"],
            start_time=seg["start_time"],
            end_time=seg["end_time"],
            text=seg["text"]
        )
        db.add(db_seg)
        
    db.commit()
    db.refresh(db_meeting)
    return db_meeting
