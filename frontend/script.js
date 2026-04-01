const API_URL = "http://127.0.0.1:8000";

let tracksData = [];
let coursesData = [];
let selectedTrackId = null;

async function loadTracks() {
    try {
        const response = await fetch(`${API_URL}/tracks`);
        const tracks = await response.json();

        tracksData = tracks;

        const trackSelector = document.getElementById("track-selector");
        trackSelector.innerHTML = '<option value="">-- Select a Track --</option>';

        tracks.forEach(track => {
            const option = document.createElement("option");
            option.value = track.track_id;
            option.textContent = track.name;
            trackSelector.appendChild(option);
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
        coursesData = [];

        document.getElementById("track-name-display").textContent = "None selected";
        document.getElementById("track-description-display").textContent = "None selected";

        resetCourseSelector();
        resetCourseDisplay();
        return;
    }

    selectedTrackId = parseInt(trackId);

    const selectedTrack = tracksData.find(track => track.track_id === selectedTrackId);

    document.getElementById("track-name-display").textContent = selectedTrack.name;
    document.getElementById("track-description-display").textContent =
        selectedTrack.description || "No description available.";

    loadCoursesForTrack(selectedTrackId);
}

async function loadCoursesForTrack(trackId) {
    try {
        const response = await fetch(`${API_URL}/tracks/${trackId}/courses`);
        const courses = await response.json();

        coursesData = courses;

        const courseSelector = document.getElementById("course-selector");
        courseSelector.innerHTML = '<option value="">-- Select a Course --</option>';

        if (!Array.isArray(courses) || courses.length === 0) {
            resetCourseDisplay();
            return;
        }

        courses.forEach(course => {
            const option = document.createElement("option");
            option.value = course.course_id;
            option.textContent = course.title;
            courseSelector.appendChild(option);
        });

        resetCourseDisplay();
    } catch (error) {
        console.error("Error loading courses:", error);
        resetCourseSelector();
        resetCourseDisplay();
    }
}

function handleCourseSelection() {
    const selector = document.getElementById("course-selector");
    const courseId = selector.value;

    if (!courseId) {
        resetCourseDisplay();
        return;
    }

    const selectedCourse = coursesData.find(course => course.course_id === parseInt(courseId));
    const selectedTrack = tracksData.find(track => track.track_id === selectedTrackId);

    if (!selectedCourse) {
        resetCourseDisplay();
        return;
    }

    document.getElementById("course-title-display").textContent = selectedCourse.title;
    document.getElementById("course-description-display").textContent =
        selectedCourse.description || "No description available.";
    document.getElementById("course-topics-display").textContent =
        selectedCourse.topics || "No topics available.";
    document.getElementById("course-track-display").textContent =
        selectedTrack ? selectedTrack.name : "Unknown track";
}

function resetCourseSelector() {
    document.getElementById("course-selector").innerHTML =
        '<option value="">-- Select a Course --</option>';
}

function resetCourseDisplay() {
    document.getElementById("course-title-display").textContent = "None selected";
    document.getElementById("course-description-display").textContent = "None selected";
    document.getElementById("course-topics-display").textContent = "None selected";
    document.getElementById("course-track-display").textContent = "None selected";
}

loadTracks();