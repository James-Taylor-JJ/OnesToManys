const API_URL = "http://127.0.0.1:8000";

let tracksData = [];
let selectedTrackId = null;

console.log("Script is running");

async function loadTracks() {
    try {
        const response = await fetch(`${API_URL}/tracks`);
        const tracks = await response.json();

        console.log("Tracks:", tracks);

        tracksData = tracks;

        const selector = document.getElementById("track-selector");
        selector.innerHTML = '<option value="">-- Select a Track --</option>';

        tracks.forEach(track => {
            const option = document.createElement("option");
            option.value = track.track_id;
            option.textContent = track.name;
            selector.appendChild(option);
        });

    } catch (error) {
        console.error("Error loading tracks:", error);
    }
}

function handleTrackSelection() {
    const selector = document.getElementById("track-selector");
    const trackId = selector.value;

    if (!trackId) {
        selectedTrackId = null;
        document.getElementById("track-description").textContent = "";
        document.getElementById("course-list").innerHTML = "";
        return;
    }

    selectedTrackId = parseInt(trackId);

    const track = tracksData.find(t => t.track_id === selectedTrackId);

    document.getElementById("track-description").textContent =
        track.description || "No description available.";

    loadCourses(selectedTrackId);
}

async function loadCourses(trackId) {
    try {
        const response = await fetch(`${API_URL}/tracks/${trackId}/courses`);
        const courses = await response.json();

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
    }
}

async function createTrack() {
    const name = document.getElementById("track-name").value;
    const description = document.getElementById("track-description-input").value;

    try {
        const response = await fetch(`${API_URL}/tracks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, description })
        });

        const newTrack = await response.json();
        console.log("Created track:", newTrack);

        document.getElementById("track-name").value = "";
        document.getElementById("track-description-input").value = "";

        loadTracks();

    } catch (error) {
        console.error("Error creating track:", error);
    }
}

async function createCourse() {
    if (!selectedTrackId) {
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
            body: JSON.stringify({ title, description, topics })
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