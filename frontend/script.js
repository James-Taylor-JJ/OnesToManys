const API_URL = "http://127.0.0.1:8000";

let tracksData = [];
let coursesData = [];
let selectedTrackId = null;
let selectedCourseId = null;

async function loadTracks(preserveTrack = true) {
    try {
        const trackSelector = document.getElementById("track-selector");
        const previousTrackValue = preserveTrack ? trackSelector.value : "";

        const response = await fetch(`${API_URL}/tracks`);
        const tracks = await response.json();

        tracksData = tracks;

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

        if (previousTrackValue && tracks.some(t => String(t.track_id) === previousTrackValue)) {
            trackSelector.value = previousTrackValue;
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

        resetSelectedTrackDisplay();
        resetUpdateTrackForm();

        document.getElementById("create-course-track-id").value = "";

        resetCourseSelector();
        resetSelectedCourseDisplay();
        resetUpdateCourseForm();
        return;
    }

    selectedTrackId = parseInt(trackId, 10);
    selectedCourseId = null;

    const selectedTrack = tracksData.find(track => track.track_id === selectedTrackId);
    if (!selectedTrack) return;

    document.getElementById("selected-track-id").value = selectedTrack.track_id ?? "";
    document.getElementById("selected-track-name").value = selectedTrack.name ?? "";
    document.getElementById("selected-track-description").value = selectedTrack.description ?? "";

    document.getElementById("update-track-id").value = selectedTrack.track_id ?? "";
    document.getElementById("update-track-name").value = selectedTrack.name ?? "";
    document.getElementById("update-track-description").value = selectedTrack.description ?? "";

    document.getElementById("create-course-track-id").value = selectedTrack.track_id;

    loadCoursesForTrack(selectedTrackId);
}

async function loadCoursesForTrack(trackId, preserveCourse = true) {
    try {
        const courseSelector = document.getElementById("course-selector");
        const previousCourseValue = preserveCourse ? courseSelector.value : "";

        const response = await fetch(`${API_URL}/tracks/${trackId}/courses`);
        const courses = await response.json();

        coursesData = courses;

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

        if (previousCourseValue && courses.some(c => String(c.course_id) === previousCourseValue)) {
            courseSelector.value = previousCourseValue;
        } else {
            resetSelectedCourseDisplay();
            resetUpdateCourseForm();
        }
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

async function createTrack() {
    const trackId = document.getElementById("create-track-id").value.trim();
    const name = document.getElementById("create-track-name").value.trim();
    const description = document.getElementById("create-track-description").value.trim();

    if (!trackId || !name) {
        alert("Track ID and Name are required.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/tracks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                track_id: parseInt(trackId, 10),
                name,
                description
            })
        });

        const result = await response.json();
        console.log("Created track:", result);

        document.getElementById("create-track-id").value = "";
        document.getElementById("create-track-name").value = "";
        document.getElementById("create-track-description").value = "";

        await loadTracks(true);
    } catch (error) {
        console.error("Error creating track:", error);
    }
}

async function updateSelectedTrack() {
    const trackId = document.getElementById("update-track-id").value.trim();
    const name = document.getElementById("update-track-name").value.trim();
    const description = document.getElementById("update-track-description").value.trim();

    if (!trackId || !name) {
        alert("Please select a track first.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/tracks/${trackId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description })
        });

        const result = await response.json();
        console.log("Updated track:", result);

        await loadTracks(true);

        const selector = document.getElementById("track-selector");
        selector.value = String(trackId);
        handleTrackSelection();
    } catch (error) {
        console.error("Error updating track:", error);
    }
}

async function deleteSelectedTrack() {
    const trackId = document.getElementById("selected-track-id").value.trim();
    const name = document.getElementById("selected-track-name").value.trim();
    const description = document.getElementById("selected-track-description").value.trim();

    if (!trackId || !name || !description) {
        alert("Delete only works when the selected-track fields still contain the record information.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/tracks/${trackId}`, {
            method: "DELETE"
        });

        const result = await response.json();
        console.log("Deleted track:", result);

        selectedTrackId = null;
        selectedCourseId = null;

        resetSelectedTrackDisplay();
        resetUpdateTrackForm();
        resetCourseSelector();
        resetSelectedCourseDisplay();
        resetUpdateCourseForm();

        await loadTracks(false);
    } catch (error) {
        console.error("Error deleting track:", error);
    }
}

async function createCourse() {
    const courseId = document.getElementById("create-course-id").value.trim();
    const trackId = document.getElementById("create-course-track-id").value.trim();
    const title = document.getElementById("create-course-title").value.trim();
    const description = document.getElementById("create-course-description").value.trim();
    const topics = document.getElementById("create-course-topics").value.trim();

    if (!courseId || !trackId || !title) {
        alert("Course ID, Track ID, and Title are required.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/courses`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                course_id: parseInt(courseId, 10),
                track_id: parseInt(trackId, 10),
                title,
                description,
                topics
            })
        });

        const result = await response.json();
        console.log("Created course:", result);

        document.getElementById("create-course-id").value = "";
        document.getElementById("create-course-title").value = "";
        document.getElementById("create-course-description").value = "";
        document.getElementById("create-course-topics").value = "";

        if (selectedTrackId && parseInt(trackId, 10) === selectedTrackId) {
            await loadCoursesForTrack(selectedTrackId, true);
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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                track_id: parseInt(trackId, 10),
                title,
                description,
                topics
            })
        });

        const result = await response.json();
        console.log("Updated course:", result);

        const updatedTrackId = parseInt(trackId, 10);

        if (selectedTrackId === updatedTrackId) {
            await loadCoursesForTrack(selectedTrackId, true);
            const selector = document.getElementById("course-selector");
            selector.value = String(selectedCourseId);
            handleCourseSelection();
        } else {
            selectedCourseId = null;
            resetSelectedCourseDisplay();
            resetUpdateCourseForm();
            await loadCoursesForTrack(selectedTrackId, false);
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
        console.log("Deleted course:", result);

        selectedCourseId = null;

        if (selectedTrackId) {
            await loadCoursesForTrack(selectedTrackId, false);
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

function resetSelectedTrackDisplay() {
    document.getElementById("selected-track-id").value = "";
    document.getElementById("selected-track-name").value = "";
    document.getElementById("selected-track-description").value = "";
}

function resetUpdateTrackForm() {
    document.getElementById("update-track-id").value = "";
    document.getElementById("update-track-name").value = "";
    document.getElementById("update-track-description").value = "";
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