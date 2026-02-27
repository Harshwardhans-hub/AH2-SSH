BEGIN;

-- Migrating applications (3 rows)
INSERT INTO applications (student_id, company_name, role, applied_date, status, location, created_at) VALUES (1, 'TATA', 'Java Developer', '2026-02-26', 'applied', 'Indore ', '2026-02-26 23:24:41') ON CONFLICT DO NOTHING;
INSERT INTO applications (student_id, company_name, role, applied_date, status, location, created_at) VALUES (1, 'Hotwax ', 'Python Developer', '2026-02-26', 'interview', 'Indore', '2026-02-26 23:25:24') ON CONFLICT DO NOTHING;
INSERT INTO applications (student_id, company_name, role, applied_date, status, location, created_at) VALUES (1, 'IBM', 'Full Stack Developer', '2026-02-26', 'selected', 'Delhi', '2026-02-26 23:26:56') ON CONFLICT DO NOTHING;


COMMIT;
