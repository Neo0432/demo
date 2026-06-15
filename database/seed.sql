INSERT INTO roles (name)
VALUES ('user'), ('admin')
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (username, role_id, password_hash)
SELECT 'admin', roles.id, '$2b$10$admin-demo-password-hash'
FROM roles
WHERE roles.name = 'admin'
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, role_id, password_hash)
SELECT 'student', roles.id, '$2b$10$student-demo-password-hash'
FROM roles
WHERE roles.name = 'user'
ON CONFLICT (username) DO NOTHING;

