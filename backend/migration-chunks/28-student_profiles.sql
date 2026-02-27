BEGIN;

-- Migrating student_profiles (2 rows)
INSERT INTO student_profiles (student_id, resume_uploaded, resume_url, skills, course, profile_completion, created_at) VALUES (1, 0, NULL, NULL, NULL, 0, '2026-02-26 23:27:07') ON CONFLICT DO NOTHING;
INSERT INTO student_profiles (student_id, resume_uploaded, resume_url, skills, course, profile_completion, created_at) VALUES (3, 0, NULL, NULL, NULL, 0, '2026-02-27 03:53:19') ON CONFLICT DO NOTHING;


-- Migration complete!
-- Total rows exported: 2293


COMMIT;
