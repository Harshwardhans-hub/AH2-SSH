BEGIN;

-- Migrating communities (1 rows)
INSERT INTO communities (name, description, category, password, cover_image, created_by, created_at) VALUES ('AITR', 'Join our Community to get Information on Placement and Internship opportunities.


', 'General', NULL, NULL, NULL, '2026-02-26 23:33:10') ON CONFLICT DO NOTHING;


COMMIT;
