DROP TABLE IF EXISTS course;
DROP TABLE IF EXISTS track;

CREATE TABLE track (
    track_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE course (
    course_id INTEGER PRIMARY KEY,
    track_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    topics TEXT,
    FOREIGN KEY (track_id)
        REFERENCES track(track_id)
        ON DELETE CASCADE
);