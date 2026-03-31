from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import sqlite3

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