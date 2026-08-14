import datetime
from app.database import SessionLocal, engine
from app import models

def seed_data():
    # Make sure tables exist (just in case main hasn't run yet)
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Project Kickoff & Q3 Goals
        m1_title = "Project Kickoff & Q3 Goals"
        existing_m1 = db.query(models.Meeting).filter(models.Meeting.title == m1_title).first()
        
        if not existing_m1:
            m1 = models.Meeting(
                title=m1_title,
                date=datetime.datetime(2026, 8, 10, 10, 0, 0),
                duration=1800,
                summary="Kickoff meeting for Project Alpha's Q3 goals. The team aligned on timelines, defined individual ownership for design, frontend, and backend implementation, and scheduled weekly syncs."
            )
            db.add(m1)
            db.flush() # Populate m1.id
            
            # Participants
            p_m1 = [
                models.Participant(meeting_id=m1.id, name="Alice Smith", email="alice@example.com"),
                models.Participant(meeting_id=m1.id, name="Bob Jones", email="bob@example.com"),
                models.Participant(meeting_id=m1.id, name="Charlie Brown", email="charlie@example.com"),
            ]
            db.add_all(p_m1)
            
            # Topics
            t_m1 = [
                models.Topic(meeting_id=m1.id, name="Introduction & Welcome", start_time=0.0),
                models.Topic(meeting_id=m1.id, name="Project Overview", start_time=120.0),
                models.Topic(meeting_id=m1.id, name="Timeline & Milestones", start_time=600.0),
                models.Topic(meeting_id=m1.id, name="Action Items & Next Steps", start_time=1500.0),
            ]
            db.add_all(t_m1)
            
            # Action Items
            ai_m1 = [
                models.ActionItem(meeting_id=m1.id, description="Draft React components and initial CSS layout", assignee="Bob Jones", completed=False),
                models.ActionItem(meeting_id=m1.id, description="Define Pydantic schemas and SQLAlchemy models", assignee="Charlie Brown", completed=True),
                models.ActionItem(meeting_id=m1.id, description="Schedule weekly Friday sync meetings", assignee="Alice Smith", completed=False),
            ]
            db.add_all(ai_m1)
            
            # Transcript Segments
            ts_m1 = [
                models.TranscriptSegment(meeting_id=m1.id, speaker_name="Alice Smith", start_time=0.0, end_time=45.0, text="Good morning everyone. Welcome to the Project Alpha Q3 Kickoff. I'm really excited to get started on this."),
                models.TranscriptSegment(meeting_id=m1.id, speaker_name="Bob Jones", start_time=45.0, end_time=90.0, text="Hey Alice, excited to be here. We have a lot of grounds to cover today, especially around the frontend layout and design."),
                models.TranscriptSegment(meeting_id=m1.id, speaker_name="Charlie Brown", start_time=90.0, end_time=120.0, text="Hi all! I will be leading the backend database structure and APIs. Looking forward to working together."),
                models.TranscriptSegment(meeting_id=m1.id, speaker_name="Alice Smith", start_time=120.0, end_time=300.0, text="Great. Let's start with the project overview. The goal of Project Alpha is to build a high-performance clone of the meeting assistant. We need robust data synchronization and a clean visual presentation."),
                models.TranscriptSegment(meeting_id=m1.id, speaker_name="Bob Jones", start_time=300.0, end_time=600.0, text="For the frontend, we are aiming to create a premium dark mode UI with glassmorphism aesthetics. I'll need the API schemas as soon as possible so I can build the mock views."),
                models.TranscriptSegment(meeting_id=m1.id, speaker_name="Charlie Brown", start_time=600.0, end_time=900.0, text="I can define the Pydantic schemas and database models by tomorrow. I will set up SQLite and SQLAlchemy, with cascade deletes enabled."),
                models.TranscriptSegment(meeting_id=m1.id, speaker_name="Alice Smith", start_time=900.0, end_time=1500.0, text="Excellent. Let's make sure our timeline aligns. We want to finish the backend API and database by the end of this week, and the frontend integrations by next week."),
                models.TranscriptSegment(meeting_id=m1.id, speaker_name="Bob Jones", start_time=1500.0, end_time=1650.0, text="Sounds doable. I will start drafting the React components and css layout tomorrow."),
                models.TranscriptSegment(meeting_id=m1.id, speaker_name="Charlie Brown", start_time=1650.0, end_time=1750.0, text="Sounds perfect. I'll document the API endpoints using FastAPI's Swagger UI."),
                models.TranscriptSegment(meeting_id=m1.id, speaker_name="Alice Smith", start_time=1750.0, end_time=1800.0, text="Sounds like a solid plan. Let's wrap up this meeting and sync again on Friday. Thank you guys!"),
            ]
            db.add_all(ts_m1)
            print(f"Meeting '{m1_title}' seeded successfully.")
        else:
            print(f"Meeting '{m1_title}' already exists. Skipping.")

        # 2. API Design Review
        m2_title = "API Design Review"
        existing_m2 = db.query(models.Meeting).filter(models.Meeting.title == m2_title).first()
        
        if not existing_m2:
            m2 = models.Meeting(
                title=m2_title,
                date=datetime.datetime(2026, 8, 11, 14, 0, 0),
                duration=1500,
                summary="Review of proposed endpoints for the meeting assistant backend. Discussed search implementation, detailed response format, and foreign key cascades."
            )
            db.add(m2)
            db.flush()
            
            p_m2 = [
                models.Participant(meeting_id=m2.id, name="Charlie Brown", email="charlie@example.com"),
                models.Participant(meeting_id=m2.id, name="Bob Jones", email="bob@example.com"),
            ]
            db.add_all(p_m2)
            
            t_m2 = [
                models.Topic(meeting_id=m2.id, name="API Endpoint Review", start_time=0.0),
                models.Topic(meeting_id=m2.id, name="Search Query discussion", start_time=300.0),
                models.Topic(meeting_id=m2.id, name="Cascade Delete & DB constraints", start_time=900.0),
            ]
            db.add_all(t_m2)
            
            ai_m2 = [
                models.ActionItem(meeting_id=m2.id, description="Update MeetingDetail schema to include transcript_segments", assignee="Charlie Brown", completed=True),
                models.ActionItem(meeting_id=m2.id, description="Implement general search query matching title and participant names", assignee="Charlie Brown", completed=True),
            ]
            db.add_all(ai_m2)
            
            ts_m2 = [
                models.TranscriptSegment(meeting_id=m2.id, speaker_name="Charlie Brown", start_time=0.0, end_time=120.0, text="Thanks for joining, Bob. I wanted to walk you through the endpoint design for meetings and action items. Here is the draft."),
                models.TranscriptSegment(meeting_id=m2.id, speaker_name="Bob Jones", start_time=120.0, end_time=300.0, text="This looks clean. I see you have endpoints for meetings and transcripts. Can we make sure the meeting details endpoint /api/meetings/{id} returns the transcript segments too?"),
                models.TranscriptSegment(meeting_id=m2.id, speaker_name="Charlie Brown", start_time=300.0, end_time=500.0, text="Yes, I can modify the MeetingDetail schema to include transcript_segments. This will make the detail page load much simpler."),
                models.TranscriptSegment(meeting_id=m2.id, speaker_name="Bob Jones", start_time=500.0, end_time=750.0, text="Perfect. Also, how does the search work? We need a search parameter on /api/meetings that filters meetings."),
                models.TranscriptSegment(meeting_id=m2.id, speaker_name="Charlie Brown", start_time=750.0, end_time=900.0, text="I'll support a search query parameter. It will match against the meeting title and also participant names, so you can search for a meeting by who was in it."),
                models.TranscriptSegment(meeting_id=m2.id, speaker_name="Bob Jones", start_time=900.0, end_time=1100.0, text="That is brilliant. What about when a meeting is deleted? Do its action items and transcript segments get cleaned up automatically?"),
                models.TranscriptSegment(meeting_id=m2.id, speaker_name="Charlie Brown", start_time=1100.0, end_time=1300.0, text="Yes, I'm setting up database-level CASCADE deletes with SQLite foreign keys, and matching SQLAlchemy relationships so that delete-orphan cascades are triggered."),
                models.TranscriptSegment(meeting_id=m2.id, speaker_name="Bob Jones", start_time=1300.0, end_time=1500.0, text="Sounds perfect. Let's proceed with this plan."),
            ]
            db.add_all(ts_m2)
            print(f"Meeting '{m2_title}' seeded successfully.")
        else:
            print(f"Meeting '{m2_title}' already exists. Skipping.")

        # 3. UI Layout & Aesthetics Sync
        m3_title = "UI Layout & Aesthetics Sync"
        existing_m3 = db.query(models.Meeting).filter(models.Meeting.title == m3_title).first()
        
        if not existing_m3:
            m3 = models.Meeting(
                title=m3_title,
                date=datetime.datetime(2026, 8, 12, 11, 0, 0),
                duration=2400,
                summary="Discussion on front-end aesthetics, dark mode design system, glassmorphism components, and responsiveness."
            )
            db.add(m3)
            db.flush()
            
            p_m3 = [
                models.Participant(meeting_id=m3.id, name="Bob Jones", email="bob@example.com"),
                models.Participant(meeting_id=m3.id, name="Alice Smith", email="alice@example.com"),
                models.Participant(meeting_id=m3.id, name="Dave Green", email="dave@example.com"),
            ]
            db.add_all(p_m3)
            
            t_m3 = [
                models.Topic(meeting_id=m3.id, name="Design System & Theme Selection", start_time=0.0),
                models.Topic(meeting_id=m3.id, name="Glassmorphism Card styling", start_time=600.0),
                models.Topic(meeting_id=m3.id, name="Mobile Responsiveness", start_time=1500.0),
            ]
            db.add_all(t_m3)
            
            ai_m3 = [
                models.ActionItem(meeting_id=m3.id, description="Design and implement glassmorphism hover animations", assignee="Bob Jones", completed=False),
                models.ActionItem(meeting_id=m3.id, description="Optimize mobile viewport breakpoints for the sidebar navigation", assignee="Bob Jones", completed=False),
                models.ActionItem(meeting_id=m3.id, description="Prepare color tokens for tags and badges", assignee="Dave Green", completed=True),
            ]
            db.add_all(ai_m3)
            
            ts_m3 = [
                models.TranscriptSegment(meeting_id=m3.id, speaker_name="Bob Jones", start_time=0.0, end_time=180.0, text="Hey Alice and Dave. Let's look at the UI layout. I have generated a design with a deep charcoal background, neon accents, and smooth card borders."),
                models.TranscriptSegment(meeting_id=m3.id, speaker_name="Dave Green", start_time=180.0, end_time=360.0, text="I love the dark mode. What colors are we using for the tags? Like action items vs topics?"),
                models.TranscriptSegment(meeting_id=m3.id, speaker_name="Bob Jones", start_time=360.0, end_time=600.0, text="I'm thinking of using a subtle lavender for topics, and a sleek emerald or warm amber for action items, depending on their completion status."),
                models.TranscriptSegment(meeting_id=m3.id, speaker_name="Alice Smith", start_time=600.0, end_time=900.0, text="Let's also add some micro-animations on hover for the cards. A small scale-up or border glow would make the UI feel super premium."),
                models.TranscriptSegment(meeting_id=m3.id, speaker_name="Bob Jones", start_time=900.0, end_time=1200.0, text="Good idea. I'll write some CSS transitions for the hover states. For glassmorphism, I'm using backdrop-filter: blur(12px) with semi-transparent background."),
                models.TranscriptSegment(meeting_id=m3.id, speaker_name="Dave Green", start_time=1200.0, end_time=1500.0, text="Make sure that backdrop blur doesn't lag on mobile devices. We should keep the layers minimal."),
                models.TranscriptSegment(meeting_id=m3.id, speaker_name="Bob Jones", start_time=1500.0, end_time=2000.0, text="Definitely. I'm testing with responsive viewport breakpoints. The sidebar will collapse into a bottom navigation bar on mobile screen sizes."),
                models.TranscriptSegment(meeting_id=m3.id, speaker_name="Alice Smith", start_time=2000.0, end_time=2400.0, text="Perfect. Looking forward to seeing the mockup in our next demo."),
            ]
            db.add_all(ts_m3)
            print(f"Meeting '{m3_title}' seeded successfully.")
        else:
            print(f"Meeting '{m3_title}' already exists. Skipping.")

        # 4. Post-Launch Feedback & Next Steps
        m4_title = "Post-Launch Feedback & Next Steps"
        existing_m4 = db.query(models.Meeting).filter(models.Meeting.title == m4_title).first()
        
        if not existing_m4:
            m4 = models.Meeting(
                title=m4_title,
                date=datetime.datetime(2026, 8, 13, 9, 30, 0),
                duration=1200,
                summary="Brief post-launch sync. Reviewing active database persistence, confirming search speed, and discussing upcoming feature requests."
            )
            db.add(m4)
            db.flush()
            
            p_m4 = [
                models.Participant(meeting_id=m4.id, name="Alice Smith", email="alice@example.com"),
                models.Participant(meeting_id=m4.id, name="Charlie Brown", email="charlie@example.com"),
            ]
            db.add_all(p_m4)
            
            t_m4 = [
                models.Topic(meeting_id=m4.id, name="Launch Status Update", start_time=0.0),
                models.Topic(meeting_id=m4.id, name="Performance & Search Metrics", start_time=400.0),
                models.Topic(meeting_id=m4.id, name="Phase 2 Features Planning", start_time=900.0),
            ]
            db.add_all(t_m4)
            
            ai_m4 = [
                models.ActionItem(meeting_id=m4.id, description="Monitor database size and query times", assignee="Charlie Brown", completed=False),
                models.ActionItem(meeting_id=m4.id, description="Draft a technical RFC for OpenAI Whisper integration", assignee="Charlie Brown", completed=False),
            ]
            db.add_all(ai_m4)
            
            ts_m4 = [
                models.TranscriptSegment(meeting_id=m4.id, speaker_name="Alice Smith", start_time=0.0, end_time=180.0, text="Congrats everyone, the backend is officially up and running. I just verified the health checks and they are green."),
                models.TranscriptSegment(meeting_id=m4.id, speaker_name="Charlie Brown", start_time=180.0, end_time=400.0, text="That is great news. I verified that SQLite is persisting data correctly across container restarts, and the cascade delete rules are performing perfectly."),
                models.TranscriptSegment(meeting_id=m4.id, speaker_name="Alice Smith", start_time=400.0, end_time=600.0, text="How is the search performance? When we have hundreds of meetings, does the search by participant name slow down?"),
                models.TranscriptSegment(meeting_id=m4.id, speaker_name="Charlie Brown", start_time=600.0, end_time=900.0, text="I added database indexes on meetings.title and participants.name. The search subquery is extremely quick and execution time is under 5 milliseconds."),
                models.TranscriptSegment(meeting_id=m4.id, speaker_name="Alice Smith", start_time=900.0, end_time=1100.0, text="Awesome. For phase 2, we might want to add audio recording upload and automated transcript generation using whisper."),
                models.TranscriptSegment(meeting_id=m4.id, speaker_name="Charlie Brown", start_time=1100.0, end_time=1200.0, text="Yes, that would be an amazing extension. We can create an upload endpoint that handles audio files in the future."),
            ]
            db.add_all(ts_m4)
            print(f"Meeting '{m4_title}' seeded successfully.")
        else:
            print(f"Meeting '{m4_title}' already exists. Skipping.")

        db.commit()
        print("Idempotent database seeding process finished.")
    except Exception as e:
        db.rollback()
        print(f"Error occurred during seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
