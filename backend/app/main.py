from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app import models
from app.database import engine
from app.routers import meetings

# Create database tables automatically on startup
models.Base.metadata.create_all(bind=engine)

# Safely run ALTER TABLE queries to update columns if database file already exists
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE transcript_segments ADD COLUMN is_highlighted BOOLEAN DEFAULT 0"))
        conn.commit()
    except Exception:
        pass
    try:
        conn.execute(text("ALTER TABLE transcript_segments ADD COLUMN comment TEXT"))
        conn.commit()
    except Exception:
        pass

app = FastAPI(
    title="Fireflies.ai Clone Backend",
    description="Backend API for meeting assistant clone supporting summaries, transcripts, topics, and action items.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers under /api prefix
app.include_router(meetings.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to Fireflies.ai Clone API"}

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Service is healthy"}
