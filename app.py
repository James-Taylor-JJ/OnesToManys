from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import json
from pathlib import Path

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app = FastAPI()

DB_PATH = "app.db"


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


@app.get("/tracks")
def get_tracks():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM track")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


@app.get("/courses")
def get_courses():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM course")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


@app.get("/tracks/{track_id}")
def get_track(track_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM track WHERE track_id = ?", (track_id,))
    row = cursor.fetchone()
    conn.close()

    if row is None:
        raise HTTPException(status_code=404, detail="Track not found")

    return dict(row)


@app.get("/tracks/{track_id}/courses")
def get_courses_for_track(track_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM track WHERE track_id = ?", (track_id,))
    track = cursor.fetchone()

    if track is None:
        conn.close()
        raise HTTPException(status_code=404, detail="Track not found")

    cursor.execute("SELECT * FROM course WHERE track_id = ?", (track_id,))
    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]

@app.get("/courses/{course_id}")
def get_course(course_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM course WHERE course_id = ?", (course_id,))
    row = cursor.fetchone()
    conn.close()

    if row is None:
        raise HTTPException(status_code=404, detail="Course not found")

    return dict(row)

class TrackCreate(BaseModel):
    name: str
    description: str


@app.post("/tracks")
def create_track(track: TrackCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO track (name, description) VALUES (?, ?)",
        (track.name, track.description)
    )
    conn.commit()

    new_id = cursor.lastrowid
    cursor.execute("SELECT * FROM track WHERE track_id = ?", (new_id,))
    new_track = cursor.fetchone()
    conn.close()

    return dict(new_track)

class TrackUpdate(BaseModel):
    name: str
    description: str


@app.put("/tracks/{track_id}")
def update_track(track_id: int, track: TrackUpdate):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM track WHERE track_id = ?", (track_id,))
    existing_track = cursor.fetchone()

    if existing_track is None:
        conn.close()
        raise HTTPException(status_code=404, detail="Track not found")

    cursor.execute(
        "UPDATE track SET name = ?, description = ? WHERE track_id = ?",
        (track.name, track.description, track_id)
    )
    conn.commit()

    cursor.execute("SELECT * FROM track WHERE track_id = ?", (track_id,))
    updated_track = cursor.fetchone()
    conn.close()

    return dict(updated_track)


@app.delete("/tracks/{track_id}")
def delete_track(track_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM track WHERE track_id = ?", (track_id,))
    existing_track = cursor.fetchone()

    if existing_track is None:
        conn.close()
        raise HTTPException(status_code=404, detail="Track not found")

    cursor.execute("DELETE FROM track WHERE track_id = ?", (track_id,))
    conn.commit()
    conn.close()

    return {"message": f"Track {track_id} deleted successfully"}

class CourseCreate(BaseModel):
    track_id: int
    title: str
    description: str
    topics: str


@app.post("/courses")
def create_course(course: CourseCreate):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM track WHERE track_id = ?", (course.track_id,))
    track = cursor.fetchone()

    if track is None:
        conn.close()
        raise HTTPException(status_code=404, detail="Track not found")

    cursor.execute(
        "INSERT INTO course (track_id, title, description, topics) VALUES (?, ?, ?, ?)",
        (course.track_id, course.title, course.description, course.topics)
    )
    conn.commit()

    new_id = cursor.lastrowid
    cursor.execute("SELECT * FROM course WHERE course_id = ?", (new_id,))
    new_course = cursor.fetchone()
    conn.close()

    return dict(new_course)

class CourseUpdate(BaseModel):
    track_id: int
    title: str
    description: str
    topics: str


@app.put("/courses/{course_id}")
def update_course(course_id: int, course: CourseUpdate):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM course WHERE course_id = ?", (course_id,))
    existing_course = cursor.fetchone()

    if existing_course is None:
        conn.close()
        raise HTTPException(status_code=404, detail="Course not found")

    cursor.execute("SELECT * FROM track WHERE track_id = ?", (course.track_id,))
    track = cursor.fetchone()

    if track is None:
        conn.close()
        raise HTTPException(status_code=404, detail="Track not found")

    cursor.execute(
        "UPDATE course SET track_id = ?, title = ?, description = ?, topics = ? WHERE course_id = ?",
        (course.track_id, course.title, course.description, course.topics, course_id)
    )
    conn.commit()

    cursor.execute("SELECT * FROM course WHERE course_id = ?", (course_id,))
    updated_course = cursor.fetchone()
    conn.close()

    return dict(updated_course)

@app.delete("/courses/{course_id}")
def delete_course(course_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM course WHERE course_id = ?", (course_id,))
    existing_course = cursor.fetchone()

    if existing_course is None:
        conn.close()
        raise HTTPException(status_code=404, detail="Course not found")

    cursor.execute("DELETE FROM course WHERE course_id = ?", (course_id,))
    conn.commit()
    conn.close()

    return {"message": f"Course {course_id} deleted successfully"}

@app.get("/tracks/{track_id}/courses/{course_id}")
def get_course_for_track(track_id: int, course_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()

    # verify parent track exists
    cursor.execute("SELECT * FROM track WHERE track_id = ?", (track_id,))
    track = cursor.fetchone()

    if track is None:
        conn.close()
        raise HTTPException(status_code=404, detail="Track not found")

    # fetch the specific child under that parent
    cursor.execute(
        "SELECT * FROM course WHERE course_id = ? AND track_id = ?",
        (course_id, track_id)
    )
    course = cursor.fetchone()
    conn.close()

    if course is None:
        raise HTTPException(status_code=404, detail="Course not found for this track")

    return dict(course)

class CourseUpdateForTrack(BaseModel):
    title: str
    description: str
    topics: str

@app.put("/tracks/{track_id}/courses/{course_id}")
def update_course_for_track(track_id: int, course_id: int, course: CourseUpdateForTrack):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM track WHERE track_id = ?", (track_id,))
    track = cursor.fetchone()

    if track is None:
        conn.close()
        raise HTTPException(status_code=404, detail="Track not found")

    cursor.execute(
        "SELECT * FROM course WHERE course_id = ? AND track_id = ?",
        (course_id, track_id)
    )
    existing_course = cursor.fetchone()

    if existing_course is None:
        conn.close()
        raise HTTPException(status_code=404, detail="Course not found for this track")

    cursor.execute(
        "UPDATE course SET title = ?, description = ?, topics = ? WHERE course_id = ? AND track_id = ?",
        (course.title, course.description, course.topics, course_id, track_id)
    )
    conn.commit()

    cursor.execute(
        "SELECT * FROM course WHERE course_id = ? AND track_id = ?",
        (course_id, track_id)
    )
    updated_course = cursor.fetchone()
    conn.close()

    return dict(updated_course)

@app.delete("/tracks/{track_id}/courses/{course_id}")
def delete_course_for_track(track_id: int, course_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM track WHERE track_id = ?", (track_id,))
    track = cursor.fetchone()

    if track is None:
        conn.close()
        raise HTTPException(status_code=404, detail="Track not found")

    cursor.execute(
        "SELECT * FROM course WHERE course_id = ? AND track_id = ?",
        (course_id, track_id)
    )
    existing_course = cursor.fetchone()

    if existing_course is None:
        conn.close()
        raise HTTPException(status_code=404, detail="Course not found for this track")

    cursor.execute(
        "DELETE FROM course WHERE course_id = ? AND track_id = ?",
        (course_id, track_id)
    )
    conn.commit()
    conn.close()

    return {"message": f"Course {course_id} deleted from track {track_id} successfully"}

@app.get("/export/json")
def export_data_json():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM track")
    tracks = [dict(row) for row in cursor.fetchall()]

    cursor.execute("SELECT * FROM course")
    courses = [dict(row) for row in cursor.fetchall()]

    conn.close()

    data = {
        "tracks": tracks,
        "courses": courses
    }

    export_path = Path("export_data.json")
    export_path.write_text(json.dumps(data, indent=2))

    return {
        "message": "Data exported successfully",
        "file": str(export_path),
        "tracks_count": len(tracks),
        "courses_count": len(courses)
    }

@app.post("/import/json")
def import_data_json():
    import_path = Path("export_data.json")

    if not import_path.exists():
        raise HTTPException(status_code=404, detail="export_data.json not found")

    data = json.loads(import_path.read_text())

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM course")
    cursor.execute("DELETE FROM track")

    for track in data.get("tracks", []):
        cursor.execute(
            "INSERT INTO track (track_id, name, description) VALUES (?, ?, ?)",
            (track["track_id"], track["name"], track["description"])
        )

    for course in data.get("courses", []):
        cursor.execute(
            "INSERT INTO course (course_id, track_id, title, description, topics) VALUES (?, ?, ?, ?, ?)",
            (
                course["course_id"],
                course["track_id"],
                course["title"],
                course["description"],
                course["topics"]
            )
        )

    conn.commit()
    conn.close()

    return {
        "message": "Data imported successfully",
        "tracks_count": len(data.get("tracks", [])),
        "courses_count": len(data.get("courses", []))
    }