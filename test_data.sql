-- Tracks
INSERT INTO track (track_id, name, description) VALUES
(1, 'Creative & Artistic Growth', 'Developing musical skills, artistic identity, and live performance abilities'),
(2, 'Business & Strategy', 'Understanding the music industry, legal frameworks, and career planning'),
(3, 'Branding & Image', 'Building a strong visual identity and audience presence');

-- Courses: Creative & Artistic Growth
INSERT INTO course (course_id, track_id, title, description, topics) VALUES
(101, 1, 'Vocal Technique Foundations', 'Learn proper breathing, tone control, and vocal health',
 'breathing exercises, pitch control, vocal warmups'),
(102, 1, 'Songwriting Essentials', 'Understand structure, melody writing, and lyric development',
 'song structure, melody creation, lyric writing'),
(103, 1, 'Live Performance & Stage Presence', 'Develop confidence and command on stage',
 'stage presence, audience engagement, performance flow'),
(104, 1, 'Rehearsal Techniques', 'Run efficient and productive rehearsals',
 'practice routines, band coordination, time management');

-- Courses: Business & Strategy
INSERT INTO course (course_id, track_id, title, description, topics) VALUES
(201, 2, 'Music Business Fundamentals', 'Overview of how the music industry operates',
 'industry structure, revenue streams, roles'),
(202, 2, 'Copyright & Royalties', 'Understand ownership and how artists get paid',
 'copyright law, royalties, publishing'),
(203, 2, 'Contracts & Agreements', 'Learn how to read and evaluate music contracts',
 'record deals, licensing, negotiation'),
(204, 2, 'Career Roadmapping', 'Plan long-term growth and milestones as an artist',
 'goal setting, strategy planning, career paths');

-- Courses: Branding & Image
INSERT INTO course (course_id, track_id, title, description, topics) VALUES
(301, 3, 'Artist Branding Basics', 'Define your unique identity and artistic voice',
 'brand identity, storytelling, positioning'),
(302, 3, 'Visual Aesthetic & Content Creation', 'Create consistent visuals for your brand',
 'photoshoots, album art, visual themes'),
(303, 3, 'Social Media Strategy', 'Grow and engage your audience online',
 'content planning, engagement, platforms'),
(304, 3, 'PR & Playlisting', 'Increase exposure through media and playlists',
 'press outreach, playlist pitching, networking');