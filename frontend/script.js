const API_URL = "http://127.0.0.1:8000";

// load tracks when page loads
async function loadTracks() {
    const response = await fetch(`${API_URL}/tracks`);
    const tracks = await response.json();

    const trackList = document.getElementById("track-list");
    trackList.innerHTML = "";

    tracks.forEach(track => {
        const li = document.createElement("li");
        li.textContent = track.name;

        // click → load courses
        li.onclick = () => loadCourses(track.track_id);

        trackList.appendChild(li);
    });
}

// load courses for a track
async function loadCourses(trackId) {
    const response = await fetch(`${API_URL}/tracks/${trackId}/courses`);
    const courses = await response.json();

    const courseList = document.getElementById("course-list");
    courseList.innerHTML = "";

    courses.forEach(course => {
        const li = document.createElement("li");
        li.textContent = course.title;
        courseList.appendChild(li);
    });
}

// run on page load
loadTracks();