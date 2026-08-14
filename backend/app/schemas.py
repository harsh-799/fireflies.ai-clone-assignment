from datetime import datetime
from typing import List, Optional, Union
from pydantic import BaseModel, ConfigDict, Field, EmailStr, model_validator

# Participant Schemas
class ParticipantBase(BaseModel):
    name: str = Field(..., min_length=1, description="Participant name cannot be empty")
    email: EmailStr = Field(..., description="Participant email must be valid")

class ParticipantCreate(ParticipantBase):
    pass

class Participant(ParticipantBase):
    id: int
    meeting_id: int

    model_config = ConfigDict(from_attributes=True)


# TranscriptSegment Schemas
class TranscriptSegmentBase(BaseModel):
    speaker_name: str = Field(..., min_length=1, description="Speaker name cannot be empty")
    start_time: float = Field(..., ge=0, description="Start time must be non-negative")
    end_time: float = Field(..., ge=0, description="End time must be non-negative")
    text: str = Field(..., min_length=1, description="Segment text cannot be empty")

    @model_validator(mode="after")
    def validate_times(self) -> "TranscriptSegmentBase":
        if self.end_time < self.start_time:
            raise ValueError("end_time cannot be less than start_time")
        return self

class TranscriptSegmentCreate(TranscriptSegmentBase):
    pass

class TranscriptSegment(BaseModel):
    id: int
    meeting_id: int
    speaker_name: str
    start_time: float
    end_time: float
    text: str
    is_highlighted: bool = False
    comment: Optional[str] = None
    timestamp_seconds: float = 0.0

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def map_fields(cls, data):
        if hasattr(data, "start_time") or (isinstance(data, dict) and "start_time" in data):
            start = getattr(data, "start_time", None)
            if start is None and isinstance(data, dict):
                start = data.get("start_time")
            
            end = getattr(data, "end_time", None)
            if end is None and isinstance(data, dict):
                end = data.get("end_time")

            is_hl = getattr(data, "is_highlighted", False)
            if is_hl is None and isinstance(data, dict):
                is_hl = data.get("is_highlighted", False)
                
            comm = getattr(data, "comment", None)
            if comm is None and isinstance(data, dict):
                comm = data.get("comment")

            speaker = getattr(data, "speaker_name", "")
            if not speaker and isinstance(data, dict):
                speaker = data.get("speaker_name", "")

            txt = getattr(data, "text", "")
            if not txt and isinstance(data, dict):
                txt = data.get("text", "")

            m_id = getattr(data, "meeting_id", 0)
            if not m_id and isinstance(data, dict):
                m_id = data.get("meeting_id", 0)

            id_val = getattr(data, "id", 0)
            if not id_val and isinstance(data, dict):
                id_val = data.get("id", 0)

            return {
                "id": id_val,
                "meeting_id": m_id,
                "speaker_name": speaker,
                "start_time": start,
                "end_time": end,
                "text": txt,
                "is_highlighted": bool(is_hl),
                "comment": comm,
                "timestamp_seconds": float(start) if start is not None else 0.0
            }
        return data


# Topic Schemas
class TopicBase(BaseModel):
    name: str = Field(..., min_length=1, description="Topic name cannot be empty")
    start_time: float = Field(..., ge=0, description="Start time must be non-negative")

class TopicCreate(TopicBase):
    pass

class Topic(TopicBase):
    id: int
    meeting_id: int

    model_config = ConfigDict(from_attributes=True)


# ActionItem Schemas
class ActionItemBase(BaseModel):
    description: Optional[str] = Field(None, min_length=1, description="Description cannot be empty")
    text: Optional[str] = Field(None, min_length=1, description="Text cannot be empty")
    assignee: Optional[str] = Field(None, min_length=1, description="Assignee cannot be empty if specified")
    completed: bool = False
    is_completed: bool = False

class ActionItemCreate(ActionItemBase):
    pass

class ActionItemUpdate(BaseModel):
    description: Optional[str] = Field(None, min_length=1, description="Description cannot be empty if specified")
    text: Optional[str] = Field(None, min_length=1, description="Text cannot be empty if specified")
    assignee: Optional[str] = Field(None, min_length=1, description="Assignee cannot be empty if specified")
    completed: Optional[bool] = None
    is_completed: Optional[bool] = None

class ActionItem(BaseModel):
    id: int
    meeting_id: int
    description: str
    text: str
    assignee: Optional[str] = None
    completed: bool
    is_completed: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def map_fields(cls, data):
        desc = getattr(data, "description", None)
        if desc is None and isinstance(data, dict):
            desc = data.get("description")
        if desc is None:
            desc = getattr(data, "text", "") or (data.get("text", "") if isinstance(data, dict) else "")

        comp = getattr(data, "completed", None)
        if comp is None and isinstance(data, dict):
            comp = data.get("completed")
        if comp is None:
            comp = getattr(data, "is_completed", False) or (data.get("is_completed", False) if isinstance(data, dict) else False)

        m_id = getattr(data, "meeting_id", 0)
        if not m_id and isinstance(data, dict):
            m_id = data.get("meeting_id", 0)

        id_val = getattr(data, "id", 0)
        if not id_val and isinstance(data, dict):
            id_val = data.get("id", 0)

        assignee_val = getattr(data, "assignee", None)
        if assignee_val is None and isinstance(data, dict):
            assignee_val = data.get("assignee")

        created = getattr(data, "created_at", None)
        if created is None and isinstance(data, dict):
            created = data.get("created_at")

        return {
            "id": id_val,
            "meeting_id": m_id,
            "description": desc or "",
            "text": desc or "",
            "assignee": assignee_val,
            "completed": bool(comp),
            "is_completed": bool(comp),
            "created_at": created or datetime.now()
        }


# Meeting Schemas
class MeetingBase(BaseModel):
    title: str = Field(..., min_length=1, description="Meeting title cannot be empty")
    date: datetime
    duration: int = Field(..., gt=0, description="Duration in seconds must be positive")
    summary: Optional[str] = None

class MeetingCreate(MeetingBase):
    participants: Optional[List[Union[ParticipantCreate, str]]] = []
    transcript_segments: Optional[List[TranscriptSegmentCreate]] = []
    topics: Optional[List[TopicCreate]] = []
    action_items: Optional[List[ActionItemCreate]] = []
    transcript_text: Optional[str] = None

class MeetingUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, description="Meeting title cannot be empty if specified")
    date: Optional[datetime] = None
    duration: Optional[int] = Field(None, gt=0, description="Duration must be positive if specified")
    summary: Optional[str] = None
    participants: Optional[List[str]] = None

class MeetingListItem(MeetingBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MeetingSummary(BaseModel):
    id: int
    meeting_id: int
    overview_text: str
    key_topics: List[str] = []

    model_config = ConfigDict(from_attributes=True)

class MeetingDetail(BaseModel):
    id: int
    title: str
    date: datetime
    duration: int
    created_at: datetime
    updated_at: datetime
    participants: List[Participant] = []
    transcript_segments: List[TranscriptSegment] = []
    topics: List[Topic] = []
    action_items: List[ActionItem] = []
    summary: Optional[MeetingSummary] = None

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def resolve_summary(cls, data):
        if hasattr(data, "summary") or (isinstance(data, dict) and "summary" in data):
            overview = getattr(data, "summary", "")
            if isinstance(data, dict):
                overview = data.get("summary", "")

            if isinstance(overview, dict) and "overview_text" in overview:
                return data

            key_topics = []
            topics_list = getattr(data, "topics", [])
            if isinstance(data, dict):
                topics_list = data.get("topics", [])
            for t in topics_list:
                name_val = getattr(t, "name", None) or (t.get("name") if isinstance(t, dict) else None)
                if name_val:
                    key_topics.append(name_val)

            id_val = getattr(data, "id", 0) or (data.get("id", 0) if isinstance(data, dict) else 0)
            title_val = getattr(data, "title", "") or (data.get("title", "") if isinstance(data, dict) else "")
            date_val = getattr(data, "date", None) or (data.get("date") if isinstance(data, dict) else None)
            dur_val = getattr(data, "duration", 0) or (data.get("duration", 0) if isinstance(data, dict) else 0)
            created_val = getattr(data, "created_at", None) or (data.get("created_at") if isinstance(data, dict) else None)
            updated_val = getattr(data, "updated_at", None) or (data.get("updated_at") if isinstance(data, dict) else None)
            parts_val = getattr(data, "participants", []) or (data.get("participants", []) if isinstance(data, dict) else [])
            segs_val = getattr(data, "transcript_segments", []) or (data.get("transcript_segments", []) if isinstance(data, dict) else [])
            items_val = getattr(data, "action_items", []) or (data.get("action_items", []) if isinstance(data, dict) else [])

            summary_obj = {
                "id": id_val,
                "meeting_id": id_val,
                "overview_text": overview or "",
                "key_topics": key_topics
            } if overview else None

            return {
                "id": id_val,
                "title": title_val,
                "date": date_val,
                "duration": dur_val,
                "created_at": created_val or datetime.now(),
                "updated_at": updated_val or datetime.now(),
                "participants": parts_val,
                "transcript_segments": segs_val,
                "topics": topics_list,
                "action_items": items_val,
                "summary": summary_obj
            }
        return data


class MeetingFromTranscriptRequest(BaseModel):
    title: str = Field(..., min_length=1, description="Meeting title cannot be empty")
    date: datetime
    transcript: str = Field(..., min_length=1, description="Transcript content cannot be empty")
