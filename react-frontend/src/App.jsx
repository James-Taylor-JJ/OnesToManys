import { useState, useEffect, useCallback } from "react";

const API_URL = "http://127.0.0.1:8000";

const B = {
  red:      "#D81118",
  redDark:  "#A50D12",
  charcoal: "#25353C",
  charcoalL:"#2f4249",
  charcoalD:"#1c2a30",
  pearl:    "#F1F5F6",
  gray:     "#4C5960",
  grayL:    "#7B8B96",
  grayXL:   "#c8d2d8",
};

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Barlow+Condensed:wght@600;700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Barlow', sans-serif;
      background: ${B.charcoalD};
      color: ${B.pearl};
      min-height: 100vh;
    }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: ${B.charcoal}; }
    ::-webkit-scrollbar-thumb { background: ${B.red}; border-radius: 3px; }

    input, textarea, select {
      font-family: 'Barlow', sans-serif;
      font-size: 13px;
      font-weight: 400;
      background: rgba(0,0,0,0.3);
      border: 1px solid ${B.gray};
      border-radius: 4px;
      color: ${B.pearl};
      padding: 8px 12px;
      width: 100%;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    input:focus, textarea:focus, select:focus {
      border-color: ${B.red};
      box-shadow: 0 0 0 3px rgba(216,17,24,0.15);
    }
    input[readonly], textarea[readonly] {
      background: rgba(0,0,0,0.2);
      border-color: rgba(76,89,96,0.5);
      color: ${B.grayL};
      cursor: default;
    }
    select option { background: ${B.charcoal}; }

    button {
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 700;
      font-size: 13px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      background: transparent;
      color: ${B.red};
      border: 1px solid ${B.red};
      border-radius: 4px;
      padding: 9px 20px;
      cursor: pointer;
      transition: background 0.2s, color 0.2s, transform 0.1s;
      white-space: nowrap;
    }
    button:hover  { background: rgba(216,17,24,0.12); }
    button:active { transform: scale(0.97); }

    button.primary {
      background: ${B.red};
      color: ${B.pearl};
      border-color: ${B.red};
    }
    button.primary:hover { background: ${B.redDark}; border-color: ${B.redDark}; }

    label {
      display: block;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: ${B.grayL};
      margin-bottom: 5px;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fade-up { animation: fadeUp 0.3s ease both; }
  `}</style>
);

// ─── Primitives ───────────────────────────────────────────────────────────────

function SectionLabel({ text }) {
  return (
    <div style={{
      fontFamily: "'Barlow Condensed', sans-serif",
      fontWeight: 700,
      fontSize: 13,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: B.grayL,
      borderLeft: `3px solid ${B.red}`,
      paddingLeft: 10,
      marginBottom: 12,
    }}>{text}</div>
  );
}

function PanelDivider({ label }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      margin: "28px 0 20px",
    }}>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 800,
        fontSize: 11,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: B.red,
      }}>{label}</div>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 6,
      padding: "16px 18px",
      marginBottom: 14,
      ...style,
    }}>{children}</div>
  );
}

function Field({ label, id, value, onChange, readOnly = false, textarea = false }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label htmlFor={id}>{label}</label>
      {textarea
        ? <textarea id={id} value={value} onChange={onChange} readOnly={readOnly} rows={3} style={{ resize: "vertical" }} />
        : <input   id={id} value={value} onChange={onChange} readOnly={readOnly} />
      }
    </div>
  );
}

function InlineDelete({ label, id, value, textarea, onDelete }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
      <div style={{ flex: 1 }}>
        <Field label={label} id={id} value={value} readOnly textarea={textarea} />
      </div>
      <button onClick={onDelete} style={{ marginBottom: 12, flexShrink: 0 }}>Delete</button>
    </div>
  );
}

function Collapsible({ label, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 10 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%",
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottomLeftRadius: open ? 0 : 4,
          borderBottomRightRadius: open ? 0 : 4,
          padding: "10px 16px",
        }}
      >
        <span>{label}</span>
        <span style={{ fontWeight: 300, fontSize: 18 }}>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="fade-up" style={{
          border: `1px solid ${B.red}`,
          borderTop: "none",
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 4,
          padding: "16px",
          background: "rgba(0,0,0,0.2)",
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Track Panel ──────────────────────────────────────────────────────────────

function TrackPanel({ tracks, onTracksChanged }) {
  const [createId, setCreateId]           = useState("");
  const [createName, setCreateName]       = useState("");
  const [createDesc, setCreateDesc]       = useState("");
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [updateName, setUpdateName]       = useState("");
  const [updateDesc, setUpdateDesc]       = useState("");

  function handleSelectChange(e) {
    const id = parseInt(e.target.value, 10);
    if (!id) {
      setSelectedTrack(null); setUpdateName(""); setUpdateDesc("");
      onTracksChanged(null); return;
    }
    const track = tracks.find(t => t.track_id === id) || null;
    setSelectedTrack(track);
    setUpdateName(track?.name ?? "");
    setUpdateDesc(track?.description ?? "");
    onTracksChanged(id);
  }

  async function handleCreate() {
    if (!createId || !createName) { alert("Track ID and Name are required."); return; }
    try {
      const res = await fetch(`${API_URL}/tracks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track_id: parseInt(createId, 10), name: createName, description: createDesc }),
      });
      const result = await res.json();
      if (!res.ok) { alert(result.detail || "Error creating track."); return; }
      setCreateId(""); setCreateName(""); setCreateDesc("");
      onTracksChanged(result.track_id);
    } catch (err) { console.error(err); }
  }

  async function handleUpdate() {
    if (!selectedTrack) { alert("Please select a track first."); return; }
    if (!updateName) { alert("Name is required."); return; }
    try {
      const res = await fetch(`${API_URL}/tracks/${selectedTrack.track_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: updateName, description: updateDesc }),
      });
      const result = await res.json();
      if (!res.ok) { alert(result.detail || "Error updating track."); return; }
      onTracksChanged(selectedTrack.track_id);
    } catch (err) { console.error(err); }
  }

  async function handleDelete() {
    if (!selectedTrack) { alert("Delete only works when a track is selected."); return; }
    try {
      const res = await fetch(`${API_URL}/tracks/${selectedTrack.track_id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) { alert(result.detail || "Error deleting track."); return; }
      setSelectedTrack(null); setUpdateName(""); setUpdateDesc("");
      onTracksChanged(null);
    } catch (err) { console.error(err); }
  }

  useEffect(() => {
    if (!selectedTrack) return;
    const fresh = tracks.find(t => t.track_id === selectedTrack.track_id);
    if (fresh) {
      setSelectedTrack(fresh);
      setUpdateName(fresh.name ?? "");
      setUpdateDesc(fresh.description ?? "");
    }
  }, [tracks]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <Card>
        <SectionLabel text="Search Track" />
        <select value={selectedTrack?.track_id ?? ""} onChange={handleSelectChange}>
          <option value="">— Select a track —</option>
          {tracks.map(t => (
            <option key={t.track_id} value={t.track_id}>{t.track_id}: {t.name}</option>
          ))}
        </select>
      </Card>

      {selectedTrack && (
        <Card className="fade-up">
          <SectionLabel text="Selected Track" />
          <Field label="Track ID"    id="sel-track-id"   value={selectedTrack.track_id ?? ""} readOnly />
          <Field label="Name"        id="sel-track-name" value={selectedTrack.name ?? ""}      readOnly />
          <InlineDelete
            label="Description" id="sel-track-desc"
            value={selectedTrack.description ?? ""} textarea
            onDelete={handleDelete}
          />
        </Card>
      )}

      {selectedTrack && (
        <Collapsible label="Update Selected Track">
          <Field label="Track ID"    id="upd-track-id"   value={selectedTrack?.track_id ?? ""} readOnly />
          <Field label="Name"        id="upd-track-name" value={updateName} onChange={e => setUpdateName(e.target.value)} />
          <Field label="Description" id="upd-track-desc" value={updateDesc} onChange={e => setUpdateDesc(e.target.value)} textarea />
          <button className="primary" onClick={handleUpdate}>Update Track</button>
        </Collapsible>
      )}

      <Collapsible label="+ Create New Track">
        <Field label="Track ID"    id="create-track-id"   value={createId}   onChange={e => setCreateId(e.target.value)} />
        <Field label="Name"        id="create-track-name" value={createName} onChange={e => setCreateName(e.target.value)} />
        <Field label="Description" id="create-track-desc" value={createDesc} onChange={e => setCreateDesc(e.target.value)} textarea />
        <button className="primary" onClick={handleCreate}>Create Track</button>
      </Collapsible>
    </div>
  );
}

// ─── Course Panel ─────────────────────────────────────────────────────────────

function CoursePanel({ selectedTrackId }) {
  const [courses, setCourses]               = useState([]);
  const [createCourseId, setCreateCourseId] = useState("");
  const [createTrackId, setCreateTrackId]   = useState(selectedTrackId ?? "");
  const [createTitle, setCreateTitle]       = useState("");
  const [createDesc, setCreateDesc]         = useState("");
  const [createTopics, setCreateTopics]     = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [updateTrackId, setUpdateTrackId]   = useState("");
  const [updateTitle, setUpdateTitle]       = useState("");
  const [updateDesc, setUpdateDesc]         = useState("");
  const [updateTopics, setUpdateTopics]     = useState("");
  const [findId, setFindId]                 = useState("");

  function populateCourse(course) {
    setSelectedCourse(course);
    setUpdateTrackId(String(course.track_id));
    setUpdateTitle(course.title ?? "");
    setUpdateDesc(course.description ?? "");
    setUpdateTopics(course.topics ?? "");
  }

  function clearCourseSelection() {
    setSelectedCourse(null);
    setUpdateTrackId(""); setUpdateTitle(""); setUpdateDesc(""); setUpdateTopics("");
  }

  async function loadCourses(trackId, preserveCourseId = null) {
    if (!trackId) { setCourses([]); return; }
    try {
      const res  = await fetch(`${API_URL}/tracks/${trackId}/courses`);
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
      if (preserveCourseId) {
        const still = data.find(c => c.course_id === preserveCourseId);
        if (still) { populateCourse(still); } else { clearCourseSelection(); }
      } else { clearCourseSelection(); }
    } catch (err) { console.error(err); setCourses([]); }
  }

  useEffect(() => {
    setCreateTrackId(selectedTrackId ?? "");
    loadCourses(selectedTrackId);
  }, [selectedTrackId]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSelectChange(e) {
    const id = parseInt(e.target.value, 10);
    if (!id) { clearCourseSelection(); return; }
    const course = courses.find(c => c.course_id === id);
    if (course) populateCourse(course);
  }

  async function handleCreate() {
    if (!createCourseId || !createTrackId || !createTitle) {
      alert("Course ID, Track ID, and Title are required."); return;
    }
    try {
      const res = await fetch(`${API_URL}/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: parseInt(createCourseId, 10),
          track_id:  parseInt(createTrackId, 10),
          title: createTitle, description: createDesc, topics: createTopics,
        }),
      });
      const result = await res.json();
      if (!res.ok) { alert(result.detail || "Error creating course."); return; }
      setCreateCourseId(""); setCreateTitle(""); setCreateDesc(""); setCreateTopics("");
      if (selectedTrackId && parseInt(createTrackId, 10) === selectedTrackId) {
        await loadCourses(selectedTrackId, selectedCourse?.course_id ?? null);
      }
    } catch (err) { console.error(err); }
  }

  async function handleUpdate() {
    if (!selectedCourse) { alert("Please select a course first."); return; }
    if (!updateTrackId || !updateTitle) { alert("Track ID and Title are required."); return; }
    try {
      const res = await fetch(`${API_URL}/courses/${selectedCourse.course_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track_id: parseInt(updateTrackId, 10),
          title: updateTitle, description: updateDesc, topics: updateTopics,
        }),
      });
      const result = await res.json();
      if (!res.ok) { alert(result.detail || "Error updating course."); return; }
      if (parseInt(updateTrackId, 10) === selectedTrackId) {
        await loadCourses(selectedTrackId, selectedCourse.course_id);
      } else { clearCourseSelection(); await loadCourses(selectedTrackId); }
    } catch (err) { console.error(err); }
  }

  async function handleDelete() {
    if (!selectedCourse) { alert("Delete only works when a course is selected."); return; }
    try {
      const res = await fetch(
        `${API_URL}/tracks/${selectedCourse.track_id}/courses/${selectedCourse.course_id}`,
        { method: "DELETE" }
      );
      const result = await res.json();
      if (!res.ok) { alert(result.detail || "Error deleting course."); return; }
      clearCourseSelection();
      await loadCourses(selectedTrackId);
    } catch (err) { console.error(err); }
  }

  async function handleFindById() {
    const id = parseInt(findId.trim(), 10);
    if (!findId.trim()) { alert("Please enter a course ID."); return; }
    if (Number.isNaN(id)) { alert("Course ID must be a number."); return; }
    try {
      const res    = await fetch(`${API_URL}/courses/${id}`);
      const course = await res.json();
      if (!res.ok) { alert(course.detail || "Course not found."); return; }
      populateCourse(course);
    } catch (err) { console.error(err); }
  }

  return (
    <div>
      <Card>
        <SectionLabel text="Search Course" />
        <select
          value={selectedCourse?.course_id ?? ""}
          onChange={handleSelectChange}
          disabled={!selectedTrackId}
          style={{ marginBottom: 12 }}
        >
          <option value="">
            {selectedTrackId ? "— Select a course —" : "— Select a track first —"}
          </option>
          {courses.map(c => (
            <option key={c.course_id} value={c.course_id}>{c.course_id}: {c.title}</option>
          ))}
        </select>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={findId}
            onChange={e => setFindId(e.target.value)}
            placeholder="Find by course ID…"
            onKeyDown={e => e.key === "Enter" && handleFindById()}
            style={{ flex: 1 }}
          />
          <button onClick={handleFindById} style={{ flexShrink: 0 }}>Find</button>
        </div>
      </Card>

      {selectedCourse && (
        <Card className="fade-up">
          <SectionLabel text="Selected Course" />
          <Field label="Course ID"   id="sel-course-id"       value={selectedCourse.course_id ?? ""}   readOnly />
          <Field label="Track ID"    id="sel-course-track-id" value={selectedCourse.track_id ?? ""}    readOnly />
          <Field label="Title"       id="sel-course-title"    value={selectedCourse.title ?? ""}        readOnly />
          <Field label="Description" id="sel-course-desc"     value={selectedCourse.description ?? ""} readOnly textarea />
          <InlineDelete
            label="Topics" id="sel-course-topics"
            value={selectedCourse.topics ?? ""} textarea
            onDelete={handleDelete}
          />
        </Card>
      )}

      {selectedCourse && (
        <Collapsible label="Update Selected Course">
          <Field label="Course ID"   id="upd-course-id"       value={selectedCourse?.course_id ?? ""} readOnly />
          <Field label="Track ID"    id="upd-course-track-id" value={updateTrackId}  onChange={e => setUpdateTrackId(e.target.value)} />
          <Field label="Title"       id="upd-course-title"    value={updateTitle}    onChange={e => setUpdateTitle(e.target.value)} />
          <Field label="Description" id="upd-course-desc"     value={updateDesc}     onChange={e => setUpdateDesc(e.target.value)} textarea />
          <Field label="Topics"      id="upd-course-topics"   value={updateTopics}   onChange={e => setUpdateTopics(e.target.value)} textarea />
          <button className="primary" onClick={handleUpdate}>Update Course</button>
        </Collapsible>
      )}

      <Collapsible label="+ Create New Course">
        <Field label="Course ID"   id="create-course-id"       value={createCourseId} onChange={e => setCreateCourseId(e.target.value)} />
        <Field label="Track ID"    id="create-course-track-id" value={createTrackId}  onChange={e => setCreateTrackId(e.target.value)} />
        <Field label="Title"       id="create-course-title"    value={createTitle}    onChange={e => setCreateTitle(e.target.value)} />
        <Field label="Description" id="create-course-desc"     value={createDesc}     onChange={e => setCreateDesc(e.target.value)} textarea />
        <Field label="Topics"      id="create-course-topics"   value={createTopics}   onChange={e => setCreateTopics(e.target.value)} textarea />
        <button className="primary" onClick={handleCreate}>Create Course</button>
      </Collapsible>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [tracks, setTracks]                   = useState([]);
  const [selectedTrackId, setSelectedTrackId] = useState(null);

  const loadTracks = useCallback(async (preserveTrackId = null) => {
    try {
      const res  = await fetch(`${API_URL}/tracks`);
      const data = await res.json();
      setTracks(Array.isArray(data) ? data : []);
      if (preserveTrackId !== undefined) {
        const still = data.find(t => t.track_id === preserveTrackId);
        setSelectedTrackId(still ? preserveTrackId : null);
      }
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { loadTracks(); }, [loadTracks]);

  function handleTracksChanged(newSelectedId) {
    loadTracks(newSelectedId);
    setSelectedTrackId(newSelectedId);
  }

  const selectedTrack = tracks.find(t => t.track_id === selectedTrackId);

  return (
    <>
      <GlobalStyle />

      {/* Header */}
      <header style={{
        background: B.charcoal,
        borderBottom: `3px solid ${B.red}`,
        padding: "0 32px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 2px 24px rgba(0,0,0,0.5)",
      }}>
        <div style={{
          maxWidth: 860,
          margin: "0 auto",
          height: 68,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: 22,
              letterSpacing: "0.05em",
              lineHeight: 1,
              color: B.pearl,
            }}>
              <span style={{ color: B.red }}>OBYLISK</span> CONSULTING &amp; MANAGEMENT
            </div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 600,
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: B.grayL,
              marginTop: 3,
            }}>
              Artist Development Program Constructor
              {selectedTrack && (
                <span style={{ color: B.red, marginLeft: 10 }}>· {selectedTrack.name}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Single scrolling page */}
      <main style={{ maxWidth: 860, margin: "0 auto", padding: "28px 32px" }}>

        <TrackPanel tracks={tracks} onTracksChanged={handleTracksChanged} />

        <PanelDivider label="Courses" />

        <CoursePanel selectedTrackId={selectedTrackId} />

      </main>
    </>
  );
}