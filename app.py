from fastapi import FastAPI
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