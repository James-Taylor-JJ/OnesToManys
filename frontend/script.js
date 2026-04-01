const API_URL = "http://127.0.0.1:8000";

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

            li.addEventListener("click", () => loadCourses(track.track_id));

            trackList.appendChild(li);
        });
    } catch (error) {
        console.error("Error loading tracks:", error);

        const trackList = document.getElementById("track-list");
        trackList.innerHTML = "";

        const li = document.createElement("li");
        li.textContent = "Failed to load tracks.";
        trackList.appendChild(li);
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

        const courseList = document.getElementById("course-list");
        courseList.innerHTML = "";

        const li = document.createElement("li");
        li.textContent = "Failed to load courses.";
        courseList.appendChild(li);
    }
}

loadTracks();