const API_URL = "http://127.0.0.1:8000";

let tracksData = [];
let coursesData = [];
let selectedTrackId = null;
let selectedCourseId = null;

console.log("script loaded");

async function loadTracks() {
    try {
        console.log("loading tracks...");
        const response = await fetch(`${API_URL}/tracks`);
        console.log("track status:", response.status);

        const tracks = await response.json();
        console.log("tracks received:", tracks);

        tracksData = tracks;

        const trackSelector = document.getElementById("track-selector");
        const currentTrackValue = trackSelector.value;

        trackSelector.innerHTML = '<option value="">-- Search by Track --</option>';

        if (!Array.isArray(tracks) || tracks.length === 0) {
            return;
        }

        tracks.forEach(track => {
            const option = document.createElement("option");
            option.value = track.track_id;
            option.textContent = `${track.track_id}: ${track.name}`;
            trackSelector.appendChild(option);
        });

        if (currentTrackValue) {
            trackSelector.value = currentTrackValue;
        }
    } catch (error) {
        console.error("Error loading tracks:", error);
    }
}

function handleTrackSelection() {
    const selector = document.getElementById("track-selector");
    const trackId = selector.value;

    if (!trackId) {
        selectedTrackId = null;
        selectedCourseId = null;
        coursesData = [];

        document.getElementById("track-name-display").textContent = "None selected";
        document.getElementById("track-description-display").textContent = "None selected";

        document.getElementById("create-course-track-id").value = "";

        resetCourseSelector();
        resetSelectedCourseDisplay();
        resetUpdateCourseForm();
        return;
    }

    selectedTrackId = parseInt(trackId, 10);
    selectedCourseId = null;

    const selectedTrack = tracksData.find(track => track.track_id === selectedTrackId);

    if (!selectedTrack) {
        console.error("selected track not found in tracksData");
        return;
    }

    document.getElementById("track-name-display").textContent = selectedTrack.name;
    document.getElementById("track-description-display").textContent =
        selectedTrack.description || "No description available.";

    document.getElementById("create-course-track-id").value = selectedTrack.track_id;

    loadCoursesForTrack(selectedTrackId);
}

async function loadCoursesForTrack(trackId) {
    try {
        const response = await fetch(`${API_URL}/tracks/${trackId}/courses`);
        const courses = await response.json();

        coursesData = courses;

        const courseSelector = document.getElementById("course-selector");
        const currentCourseValue = courseSelector.value;

        courseSelector.innerHTML = '<option value="">-- Search by Course --</option>';

        if (!Array.isArray(courses) || courses.length === 0) {
            resetSelectedCourseDisplay();
            resetUpdateCourseForm();
            return;
        }

        courses.forEach(course => {
            const option = document.createElement("option");
            option.value = course.course_id;
            option.textContent = `${course.course_id}: ${course.title}`;
            courseSelector.appendChild(option);
        });

        if (currentCourseValue) {
            courseSelector.value = currentCourseValue;
        }

        resetSelectedCourseDisplay();
        resetUpdateCourseForm();
    } catch (error) {
        console.error("Error loading courses:", error);
        resetCourseSelector();
        resetSelectedCourseDisplay();
        resetUpdateCourseForm();
    }
}

function handleCourseSelection() {
    const selector = document.getElementById("course-selector");
    const courseId = selector.value;

    if (!courseId) {
        selectedCourseId = null;
        resetSelectedCourseDisplay();
        resetUpdateCourseForm();
        return;
    }

    selectedCourseId = parseInt(courseId, 10);

    const selectedCourse = coursesData.find(course => course.course_id === selectedCourseId);

    if (!selectedCourse) {
        selectedCourseId = null;
        resetSelectedCourseDisplay();
        resetUpdateCourseForm();
        return;
    }

    document.getElementById("selected-course-id").value = selectedCourse.course_id ?? "";
    document.getElementById("selected-course-track-id").value = selectedCourse.track_id ?? "";
    document.getElementById("selected-course-title").value = selectedCourse.title ?? "";
    document.getElementById("selected-course-description").value = selectedCourse.description ?? "";
    document.getElementById("selected-course-topics").value = selectedCourse.topics ?? "";

    document.getElementById("update-course-id").value = selectedCourse.course_id ?? "";
    document.getElementById("update-course-track-id").value = selectedCourse.track_id ?? "";
    document.getElementById("update-course-title").value = selectedCourse.title ?? "";
    document.getElementById("update-course-description").value = selectedCourse.description ?? "";
    document.getElementById("update-course-topics").value = selectedCourse.topics ?? "";
}

async function createCourse() {
    const trackId = document.getElementById("create-course-track-id").value.trim();
    const title = document.getElementById("create-course-title").value.trim();
    const description = document.getElementById("create-course-description").value.trim();
    const topics = document.getElementById("create-course-topics").value.trim();

    if (!trackId || !title) {
        alert("Track ID and Title are required.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/courses`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                track_id: parseInt(trackId, 10),
                title,
                description,
                topics
            })
        });

        const result = await response.json();
        console.log("Created course:", result);

        document.getElementById("create-course-id").value = "Auto-generated";
        document.getElementById("create-course-title").value = "";
        document.getElementById("create-course-description").value = "";
        document.getElementById("create-course-topics").value = "";

        if (selectedTrackId && parseInt(trackId, 10) === selectedTrackId) {
            await loadCoursesForTrack(selectedTrackId);
        }
    } catch (error) {
        console.error("Error creating course:", error);
    }
}

async function updateSelectedCourse() {
    if (!selectedCourseId) {
        alert("Please select a course first.");
        return;
    }

    const trackId = document.getElementById("update-course-track-id").value.trim();
    const title = document.getElementById("update-course-title").value.trim();
    const description = document.getElementById("update-course-description").value.trim();
    const topics = document.getElementById("update-course-topics").value.trim();

    if (!trackId || !title) {
        alert("Track ID and Title are required.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/courses/${selectedCourseId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                track_id: parseInt(trackId, 10),
                title,
                description,
                topics
            })
        });

        const updatedCourse = await response.json();
        console.log("Updated course:", updatedCourse);

        const updatedTrackId = parseInt(trackId, 10);

        if (selectedTrackId === updatedTrackId) {
            await loadCoursesForTrack(selectedTrackId);
            const selector = document.getElementById("course-selector");
            selector.value = String(selectedCourseId);
            handleCourseSelection();
        } else {
            selectedCourseId = null;
            resetSelectedCourseDisplay();
            resetUpdateCourseForm();
            await loadCoursesForTrack(selectedTrackId);
        }
    } catch (error) {
        console.error("Error updating course:", error);
    }
}

async function deleteSelectedCourse() {
    const courseId = document.getElementById("selected-course-id").value.trim();
    const trackId = document.getElementById("selected-course-track-id").value.trim();
    const title = document.getElementById("selected-course-title").value.trim();
    const description = document.getElementById("selected-course-description").value.trim();
    const topics = document.getElementById("selected-course-topics").value.trim();

    if (!courseId || !trackId || !title || !description || !topics) {
        alert("Delete only works when the selected-course fields still contain the record information.");
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/tracks/${trackId}/courses/${courseId}`,
            { method: "DELETE" }
        );

        const result = await response.json();
        console.log("Delete result:", result);

        selectedCourseId = null;

        if (selectedTrackId) {
            await loadCoursesForTrack(selectedTrackId);
        }

        resetSelectedCourseDisplay();
        resetUpdateCourseForm();
    } catch (error) {
        console.error("Error deleting course:", error);
    }
}

function resetCourseSelector() {
    document.getElementById("course-selector").innerHTML =
        '<option value="">-- Search by Course --</option>';
}

function resetSelectedCourseDisplay() {
    document.getElementById("selected-course-id").value = "";
    document.getElementById("selected-course-track-id").value = "";
    document.getElementById("selected-course-title").value = "";
    document.getElementById("selected-course-description").value = "";
    document.getElementById("selected-course-topics").value = "";
}

function resetUpdateCourseForm() {
    document.getElementById("update-course-id").value = "";
    document.getElementById("update-course-track-id").value = "";
    document.getElementById("update-course-title").value = "";
    document.getElementById("update-course-description").value = "";
    document.getElementById("update-course-topics").value = "";
}

loadTracks();