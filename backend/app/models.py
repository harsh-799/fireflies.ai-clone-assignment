import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    date = Column(DateTime, nullable=False)
    duration = Column(Integer, nullable=False)  # Duration in minutes or seconds
    summary = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    participants = relationship(
        "Participant", 
        back_populates="meeting", 
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    transcript_segments = relationship(
        "TranscriptSegment", 
        back_populates="meeting", 
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    topics = relationship(
        "Topic", 
        back_populates="meeting", 
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    action_items = relationship(
        "ActionItem", 
        back_populates="meeting", 
        cascade="all, delete-orphan",
        passive_deletes=True
    )


class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(
        Integer, 
        ForeignKey("meetings.id", ondelete="CASCADE"), 
        nullable=False,
        index=True
    )
    name = Column(String, nullable=False, index=True)
    email = Column(String, nullable=False)

    # Relationships
    meeting = relationship("Meeting", back_populates="participants")


class TranscriptSegment(Base):
    __tablename__ = "transcript_segments"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(
        Integer, 
        ForeignKey("meetings.id", ondelete="CASCADE"), 
        nullable=False,
        index=True
    )
    speaker_name = Column(String, nullable=False)
    start_time = Column(Float, nullable=False)  # in seconds
    end_time = Column(Float, nullable=False)    # in seconds
    text = Column(String, nullable=False)
    is_highlighted = Column(Boolean, default=False, nullable=False)
    comment = Column(String, nullable=True)

    # Relationships
    meeting = relationship("Meeting", back_populates="transcript_segments")


class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(
        Integer, 
        ForeignKey("meetings.id", ondelete="CASCADE"), 
        nullable=False,
        index=True
    )
    name = Column(String, nullable=False)
    start_time = Column(Float, nullable=False)  # in seconds

    # Relationships
    meeting = relationship("Meeting", back_populates="topics")


class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(
        Integer, 
        ForeignKey("meetings.id", ondelete="CASCADE"), 
        nullable=False,
        index=True
    )
    description = Column(String, nullable=False)
    assignee = Column(String, nullable=True)
    completed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    # Relationships
    meeting = relationship("Meeting", back_populates="action_items")
