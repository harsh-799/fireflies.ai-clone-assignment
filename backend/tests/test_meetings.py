import pytest
from app import models

# 1. Meeting CRUD
def test_meeting_crud(client):
    # Create Meeting
    meeting_data = {
        "title": "Initial Implementation Review",
        "date": "2026-08-14T10:00:00",
        "duration": 45,
        "summary": "Review the initial backend implementation."
    }
    response = client.post("/api/meetings", json=meeting_data)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Initial Implementation Review"
    assert data["duration"] == 45
    meeting_id = data["id"]

    # Read Meetings List
    response = client.get("/api/meetings")
    assert response.status_code == 200
    meetings = response.json()
    assert len(meetings) == 1
    assert meetings[0]["id"] == meeting_id

    # Read Meeting Detail
    response = client.get(f"/api/meetings/{meeting_id}")
    assert response.status_code == 200
    detail = response.json()
    assert detail["title"] == "Initial Implementation Review"
    assert "participants" in detail

    # Update Meeting
    update_data = {
        "title": "Updated Review Title",
        "duration": 60
    }
    response = client.put(f"/api/meetings/{meeting_id}", json=update_data)
    assert response.status_code == 200
    updated = response.json()
    assert updated["title"] == "Updated Review Title"
    assert updated["duration"] == 60

    # Delete Meeting
    response = client.delete(f"/api/meetings/{meeting_id}")
    assert response.status_code == 204

    # Verify Delete
    response = client.get(f"/api/meetings/{meeting_id}")
    assert response.status_code == 404


# 2. Search by Meeting Title and Participant Name
def test_meetings_search(client):
    # Create Meeting A
    meeting_a = {
        "title": "Weekly Standup with Charlie",
        "date": "2026-08-14T09:00:00",
        "duration": 15,
        "participants": [{"name": "Charlie Brown", "email": "charlie@example.com"}]
    }
    client.post("/api/meetings", json=meeting_a)

    # Create Meeting B
    meeting_b = {
        "title": "Design Sync with Alice",
        "date": "2026-08-14T10:00:00",
        "duration": 30,
        "participants": [{"name": "Alice Cooper", "email": "alice@example.com"}]
    }
    client.post("/api/meetings", json=meeting_b)

    # Search by Title
    response = client.get("/api/meetings?search=Standup")
    assert response.status_code == 200
    results = response.json()
    assert len(results) == 1
    assert "Standup" in results[0]["title"]

    # Search by Participant Name
    response = client.get("/api/meetings?search=Alice")
    assert response.status_code == 200
    results = response.json()
    assert len(results) == 1
    assert "Design Sync" in results[0]["title"]

    # Search matching both or none
    response = client.get("/api/meetings?search=with")
    assert len(response.json()) == 2

    response = client.get("/api/meetings?search=NotExist")
    assert len(response.json()) == 0


# 3. Transcript Ordering
def test_transcript_ordering(client):
    meeting_data = {
        "title": "Transcript Sorting Test",
        "date": "2026-08-14T11:00:00",
        "duration": 20,
        "transcript_segments": [
            {"speaker_name": "Bob", "start_time": 50.5, "end_time": 60.0, "text": "This should be third."},
            {"speaker_name": "Alice", "start_time": 10.0, "end_time": 15.2, "text": "This should be first."},
            {"speaker_name": "Charlie", "start_time": 30.1, "end_time": 40.5, "text": "This should be second."}
        ]
    }
    response = client.post("/api/meetings", json=meeting_data)
    assert response.status_code == 201
    meeting_id = response.json()["id"]

    # Read Transcript
    response = client.get(f"/api/meetings/{meeting_id}/transcript")
    assert response.status_code == 200
    segments = response.json()
    assert len(segments) == 3
    assert segments[0]["speaker_name"] == "Alice"
    assert segments[1]["speaker_name"] == "Charlie"
    assert segments[2]["speaker_name"] == "Bob"
    assert segments[0]["start_time"] < segments[1]["start_time"] < segments[2]["start_time"]


# 4. Action-item Update Persistence
def test_action_item_update_persistence(client):
    # Create meeting with action item
    meeting_data = {
        "title": "Action Item Meeting",
        "date": "2026-08-14T12:00:00",
        "duration": 30,
        "action_items": [
            {"description": "Initial task description", "assignee": "Dave", "completed": False}
        ]
    }
    response = client.post("/api/meetings", json=meeting_data)
    assert response.status_code == 201
    detail = response.json()
    action_item_id = detail["action_items"][0]["id"]

    # Update Action Item
    update_payload = {
        "description": "Updated task description",
        "assignee": "Dave Updated",
        "completed": True
    }
    response = client.put(f"/api/action-items/{action_item_id}", json=update_payload)
    assert response.status_code == 200
    updated_item = response.json()
    assert updated_item["description"] == "Updated task description"
    assert updated_item["assignee"] == "Dave Updated"
    assert updated_item["completed"] is True

    # Re-fetch Meeting to verify persistence
    response = client.get(f"/api/meetings/{detail['id']}")
    assert response.status_code == 200
    refetched_detail = response.json()
    refetched_item = refetched_detail["action_items"][0]
    assert refetched_item["description"] == "Updated task description"
    assert refetched_item["assignee"] == "Dave Updated"
    assert refetched_item["completed"] is True


# 5. Meeting Deletion with Cascade Delete
def test_meeting_deletion_cascade(client, db_session):
    # Create meeting with nested child components
    meeting_data = {
        "title": "Cascade Test Meeting",
        "date": "2026-08-14T13:00:00",
        "duration": 30,
        "participants": [{"name": "Cascade Part", "email": "cascade@example.com"}],
        "transcript_segments": [{"speaker_name": "Cas", "start_time": 0.0, "end_time": 10.0, "text": "Test"}],
        "topics": [{"name": "Cascade Topic", "start_time": 0.0}],
        "action_items": [{"description": "Cascade Action", "assignee": "Cas", "completed": False}]
    }
    response = client.post("/api/meetings", json=meeting_data)
    assert response.status_code == 201
    meeting_id = response.json()["id"]

    # Verify entries exist in the database session
    assert db_session.query(models.Participant).filter_by(meeting_id=meeting_id).count() == 1
    assert db_session.query(models.TranscriptSegment).filter_by(meeting_id=meeting_id).count() == 1
    assert db_session.query(models.Topic).filter_by(meeting_id=meeting_id).count() == 1
    assert db_session.query(models.ActionItem).filter_by(meeting_id=meeting_id).count() == 1

    # Delete meeting
    response = client.delete(f"/api/meetings/{meeting_id}")
    assert response.status_code == 204

    # Verify cascade deleted everything
    assert db_session.query(models.Participant).filter_by(meeting_id=meeting_id).count() == 0
    assert db_session.query(models.TranscriptSegment).filter_by(meeting_id=meeting_id).count() == 0
    assert db_session.query(models.Topic).filter_by(meeting_id=meeting_id).count() == 0
    assert db_session.query(models.ActionItem).filter_by(meeting_id=meeting_id).count() == 0


# 6. Input Validation (HTTP 422)
def test_input_validation_failures(client):
    # Invalid email format
    meeting_invalid_email = {
        "title": "Invalid Email Meeting",
        "date": "2026-08-14T10:00:00",
        "duration": 30,
        "participants": [{"name": "Alice", "email": "invalidemail"}]
    }
    response = client.post("/api/meetings", json=meeting_invalid_email)
    assert response.status_code == 422

    # Negative duration
    meeting_invalid_duration = {
        "title": "Invalid Duration Meeting",
        "date": "2026-08-14T10:00:00",
        "duration": -10
    }
    response = client.post("/api/meetings", json=meeting_invalid_duration)
    assert response.status_code == 422

    # Transcript end_time less than start_time
    meeting_invalid_transcript = {
        "title": "Invalid Transcript Meeting",
        "date": "2026-08-14T10:00:00",
        "duration": 30,
        "transcript_segments": [{"speaker_name": "Bob", "start_time": 20.0, "end_time": 10.0, "text": "Wrong times"}]
    }
    response = client.post("/api/meetings", json=meeting_invalid_transcript)
    assert response.status_code == 422


# 7. 404 Error Handling
def test_404_error_handling(client):
    # Non-existent meeting get
    response = client.get("/api/meetings/9999")
    assert response.status_code == 404

    # Non-existent meeting delete
    response = client.delete("/api/meetings/9999")
    assert response.status_code == 404

    # Non-existent meeting update
    response = client.put("/api/meetings/9999", json={"title": "New Title"})
    assert response.status_code == 404

    # Non-existent action item update
    response = client.put("/api/action-items/9999", json={"completed": True})
    assert response.status_code == 404

    # Non-existent action item delete
    response = client.delete("/api/action-items/9999")
    assert response.status_code == 404


# 8. Date Filtering Tests
def test_date_filtering(client):
    # Create meetings with distinct dates
    m1 = {"title": "Meeting A", "date": "2026-08-01T10:00:00", "duration": 10}
    m2 = {"title": "Meeting B", "date": "2026-08-05T12:00:00", "duration": 20}
    m3 = {"title": "Meeting C", "date": "2026-08-10T14:00:00", "duration": 30}
    
    client.post("/api/meetings", json=m1)
    client.post("/api/meetings", json=m2)
    client.post("/api/meetings", json=m3)

    # Test date_from filtering
    response = client.get("/api/meetings?date_from=2026-08-05")
    assert response.status_code == 200
    results = response.json()
    assert len(results) == 2
    assert results[0]["title"] == "Meeting C" # ordered desc
    assert results[1]["title"] == "Meeting B"

    # Test date_to filtering
    response = client.get("/api/meetings?date_to=2026-08-05")
    assert response.status_code == 200
    results = response.json()
    assert len(results) == 2
    assert results[0]["title"] == "Meeting B"
    assert results[1]["title"] == "Meeting A"

    # Test date range filtering
    response = client.get("/api/meetings?date_from=2026-08-02&date_to=2026-08-09")
    assert response.status_code == 200
    results = response.json()
    assert len(results) == 1
    assert results[0]["title"] == "Meeting B"

    # Test invalid date formatting
    response = client.get("/api/meetings?date_from=invalid-date")
    assert response.status_code == 422


# 9. Creating Meeting from Pasted Transcript
def test_create_meeting_from_transcript(client):
    payload = {
        "title": "Pasted Transcript Meeting",
        "date": "2026-08-14T10:00:00",
        "transcript": "Alice: Hello team, let's start the design review.\nBob: Yes, I am ready.\nAlice: Let's focus on the sidebar component."
    }
    response = client.post("/api/meetings/from-transcript", json=payload)
    assert response.status_code == 201
    meeting = response.json()
    assert meeting["title"] == "Pasted Transcript Meeting"
    assert meeting["duration"] > 0  # calculated duration

    # Verify segments exist and details are preserved
    assert len(meeting["transcript_segments"]) == 3
    segments = meeting["transcript_segments"]
    assert segments[0]["speaker_name"] == "Alice"
    assert segments[0]["text"] == "Hello team, let's start the design review."
    assert segments[1]["speaker_name"] == "Bob"
    assert segments[1]["text"] == "Yes, I am ready."
    assert segments[2]["speaker_name"] == "Alice"
    assert segments[2]["text"] == "Let's focus on the sidebar component."

    # Verify times are sequential and start at 0
    assert segments[0]["start_time"] == 0.0
    assert segments[1]["start_time"] == segments[0]["end_time"]
    assert segments[2]["start_time"] == segments[1]["end_time"]

    # Verify we can fetch the transcript from the dedicated endpoint too
    ref_response = client.get(f"/api/meetings/{meeting['id']}/transcript")
    assert ref_response.status_code == 200
    assert len(ref_response.json()) == 3


# 10. Creating Meeting from Uploaded File
def test_create_meeting_from_transcript_file(client):
    file_content = (
        "Charlie: Let's discuss API design.\n"
        "Dave: Sounds good. We need to add the from-transcript endpoints.\n"
        "Charlie: Agreed. I will write the text parser."
    )
    
    # Valid file upload
    response = client.post(
        "/api/meetings/from-transcript-file",
        data={"title": "Uploaded File Meeting", "date": "2026-08-14T10:00:00"},
        files={"file": ("transcript.txt", file_content.encode("utf-8"), "text/plain")}
    )
    assert response.status_code == 201
    meeting = response.json()
    assert meeting["title"] == "Uploaded File Meeting"
    assert len(meeting["transcript_segments"]) == 3
    assert meeting["transcript_segments"][0]["speaker_name"] == "Charlie"
    assert meeting["transcript_segments"][1]["speaker_name"] == "Dave"

    # Invalid file extension upload
    response = client.post(
        "/api/meetings/from-transcript-file",
        data={"title": "Uploaded Image", "date": "2026-08-14T10:00:00"},
        files={"file": ("transcript.png", b"fakeimagedata", "image/png")}
    )
    assert response.status_code == 400
    assert "txt" in response.json()["detail"].lower()

    # Invalid date upload form parameter
    response = client.post(
        "/api/meetings/from-transcript-file",
        data={"title": "Uploaded File Meeting", "date": "invalid-date"},
        files={"file": ("transcript.txt", file_content.encode("utf-8"), "text/plain")}
    )
    assert response.status_code == 422

