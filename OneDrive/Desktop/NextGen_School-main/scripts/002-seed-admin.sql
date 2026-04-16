-- Seed admin user (password: admin123)
-- bcrypt hash for 'admin123'
INSERT INTO users (email, name, password_hash, role, is_approved)
VALUES (
  'admin@nextgenschool.com',
  'Admin User',
  '$2a$10$rQEY7xT8fFjP1QJL7FV0FeGz3n9.UZX4c3YU3jFBFDXd6kxvjX5Ym',
  'admin',
  true
) ON CONFLICT (email) DO NOTHING;

-- Seed a demo teacher (password: teacher123)
INSERT INTO users (email, name, password_hash, role, is_approved)
VALUES (
  'teacher@nextgenschool.com',
  'Demo Teacher',
  '$2a$10$rQEY7xT8fFjP1QJL7FV0FeGz3n9.UZX4c3YU3jFBFDXd6kxvjX5Ym',
  'teacher',
  true
) ON CONFLICT (email) DO NOTHING;

-- Seed a demo student (password: student123)
INSERT INTO users (email, name, password_hash, role, is_approved)
VALUES (
  'student@nextgenschool.com',
  'Demo Student',
  '$2a$10$rQEY7xT8fFjP1QJL7FV0FeGz3n9.UZX4c3YU3jFBFDXd6kxvjX5Ym',
  'student',
  true
) ON CONFLICT (email) DO NOTHING;
