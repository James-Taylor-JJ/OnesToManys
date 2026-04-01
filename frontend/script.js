const API_URL = "http://127.0.0.1:8000";

let selectedTrackId = null;

console.log("Script is running");

async function loadTracks() {
    try {
        console.log("Loading tracks...");

        const response = await fetch(`${API_URL}/tracks`);
        console.log("Track response status:", response.status);

        const tracks = await response.json();
        console.log("Tracks received:", tracks);

        const trackList = document.getElementById("track-list");
        trackList.innerHTML = "";

        if (!Array.isArray(tracks) || tracks.length === 0) {
            const li = document.createElement("li");
            li.textContent = "No tracks found.";
            trackList.appendChild(li);
            return;
        }

        tracks.forEach(track => {
            const li = document.createElement("li");
            li.textContent = `${track.track_id}: ${track.name}`;
            li.style.cursor = "pointer";

            li.addEventListener("click", () => {
                selectedTrackId = track.track_id;
                document.getElementById("selected-track").textContent =
                    `Track ${track.track_id}: ${track.name}`;
                loadCourses(track.track_id);
            });

            trackList.appendChild(li);
        });
    } catch (error) {
        console.error("Error loading tracks:", error);
        document.getElementById("track-list").innerHTML =
            "<li>Failed to load tracks.</li>";
    }
}

async function loadCourses(trackId) {
    try {
        console.log(`Loading courses for track ${trackId}...`);

        const response = await fetch(`${API_URL}/tracks/${trackId}/courses`);
        console.log("Course response status:", response.status);

        const courses = await response.json();
        console.log("Courses received:", courses);

        const courseList = document.getElementById("course-list");
        courseList.innerHTML = "";

        if (!Array.isArray(courses) || courses.length === 0) {
            const li = document.createElement("li");
            li.textContent = "No courses found for this track.";
            courseList.appendChild(li);
            return;
        }

        courses.forEach(course => {
            const li = document.createElement("li");
            li.textContent = `${course.course_id}: ${course.title}`;
            courseList.appendChild(li);
        });
    } catch (error) {
        console.error("Error loading courses:", error);
        document.getElementById("course-list").innerHTML =
            "<li>Failed to load courses.</li>";
    }
}

async function createTrack() {
    const name = document.getElementById("track-name").value;
    const description = document.getElementById("track-description").value;

    try {
        const response = await fetch(`${API_URL}/tracks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                description: description
            })
        });

        const newTrack = await response.json();
        console.log("Created track:", newTrack);

        document.getElementById("track-name").value = "";
        document.getElementById("track-description").value = "";

        loadTracks();
    } catch (error) {
        console.error("Error creating track:", error);
    }
}

async function createCourse() {
    if (selectedTrackId === null) {
        alert("Please select a track first.");
        return;
    }

    const title = document.getElementById("course-title").value;
    const description = document.getElementById("course-description").value;
    const topics = document.getElementById("course-topics").value;

    try {
        const response = await fetch(`${API_URL}/tracks/${selectedTrackId}/courses`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                description: description,
                topics: topics
            })
        });

        const newCourse = await response.json();
        console.log("Created course:", newCourse);

        document.getElementById("course-title").value = "";
        document.getElementById("course-description").value = "";
        document.getElementById("course-topics").value = "";

        loadCourses(selectedTrackId);
    } catch (error) {
        console.error("Error creating course:", error);
    }
}

loadTracks();