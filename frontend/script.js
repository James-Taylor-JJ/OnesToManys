const API_URL = "http://127.0.0.1:8000";

console.log("Script is running");

async function loadTracks() {
    try {
        console.log("Loading tracks...");
        const response = await fetch(`${API_URL}/tracks`);
        console.log("Track response:", response);
        console.log("Track response status:", response.status);

        const tracks = await response.json();
        console.log("Tracks received:", tracks);

        const trackList = document.getElementById("track-list");
        trackList.innerHTML = "";

        tracks.forEach(track => {
            const li = document.createElement("li");
            li.textContent = `${track.track_id}: ${track.name}`;
            li.style.cursor = "pointer";
            li.addEventListener("click", () => loadCourses(track.track_id));
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
        console.log("Loading courses for track:", trackId);
        const response = await fetch(`${API_URL}/tracks/${trackId}/courses`);
        console.log("Course response:", response);
        console.log("Course response status:", response.status);

        const courses = await response.json();
        console.log("Courses received:", courses);

        const courseList = document.getElementById("course-list");
        courseList.innerHTML = "";

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

loadTracks();

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

        // clear inputs
        document.getElementById("track-name").value = "";
        document.getElementById("track-description").value = "";

        // reload track list
        loadTracks();

    } catch (error) {
        console.error("Error creating track:", error);
    }
}