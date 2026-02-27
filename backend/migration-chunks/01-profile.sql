BEGIN;

-- SQLite to PostgreSQL Migration SQL
-- Generated: 2026-02-27T08:35:11.973Z
-- Run this in Supabase SQL Editor



-- Migrating profile (4 rows)
INSERT INTO profile (name, email, role, college, pass_out_year, department, phone, password, created_at, login_count) VALUES ('Harshwardhan sharma', 'test@123.com', 'student', 'AITR', 2027, NULL, NULL, '$2a$10$.9UW83ARwZ2vFAfL6bwa6eyrGpqsTtIU5MFaSrEHXofmGE867Ynt.', '2026-02-26 23:20:44', 2) ON CONFLICT DO NOTHING;
INSERT INTO profile (name, email, role, college, pass_out_year, department, phone, password, created_at, login_count) VALUES ('Aditya', 'acro11@acropolis.in', 'college', 'AITR', NULL, 'CSE', '7869217793', '$2a$10$SZ1Maw3wQk7Z7GZ3v38vLuhjZ5H.rd9zOQNBpTu4lRuH0id73lF5i', '2026-02-26 23:21:19', 7) ON CONFLICT DO NOTHING;
INSERT INTO profile (name, email, role, college, pass_out_year, department, phone, password, created_at, login_count) VALUES ('Harshwardhan sharma', 'harshwardhans279sharma@gmail.com', 'student', 'AITR', 2027, NULL, NULL, '$2a$10$xFqFf5K.K9EvHazYkggSKO1XXfpuu8eHCvx2VY9u0N0omALTyod76', '2026-02-27 03:30:33', 3) ON CONFLICT DO NOTHING;
INSERT INTO profile (name, email, role, college, pass_out_year, department, phone, password, created_at, login_count) VALUES ('Ajay Rajera', 'ajayrajera230740@acropolis.in', 'student', 'AITR', 2027, NULL, NULL, '$2a$10$X9Iar/Ff71ZFfBJYf9W1gefCY7o3sThqxEpTT.mblZIxeaSsDrCU2', '2026-02-27 04:46:38', 1) ON CONFLICT DO NOTHING;


COMMIT;
