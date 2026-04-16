const Database = require('better-sqlite3');
const path = require('path');
const { hashSync } = require('bcryptjs');

const dbPath = path.join(process.cwd(), 'app.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('🚀 Initializing and Seeding Database...');

try {
  db.transaction(() => {
    // 1. Create Tables (SQLite Syntax)
    db.exec(`
      CREATE TABLE IF NOT EXISTS institutions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        logo_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin', 'institution')),
        institution_id INTEGER REFERENCES institutions(id),
        is_approved BOOLEAN DEFAULT FALSE,
        avatar_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        thumbnail TEXT,
        teacher_id INTEGER REFERENCES users(id),
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS modules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        video_url TEXT,
        content TEXT,
        order_number INTEGER NOT NULL DEFAULT 1,
        duration_minutes INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS module_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        completed BOOLEAN DEFAULT FALSE,
        completed_at DATETIME,
        UNIQUE(module_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
        progress INTEGER DEFAULT 0,
        enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        UNIQUE(user_id, course_id)
      );

      CREATE TABLE IF NOT EXISTS quizzes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        time_limit INTEGER DEFAULT 30,
        passing_score INTEGER DEFAULT 70,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS quiz_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        question_type TEXT DEFAULT 'multiple_choice',
        points INTEGER DEFAULT 10,
        order_number INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS quiz_options (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER REFERENCES quiz_questions(id) ON DELETE CASCADE,
        option_text TEXT NOT NULL,
        is_correct BOOLEAN DEFAULT FALSE,
        order_number INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS quiz_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        score INTEGER,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        UNIQUE(quiz_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS quiz_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        response_id INTEGER REFERENCES quiz_responses(id) ON DELETE CASCADE,
        question_id INTEGER REFERENCES quiz_questions(id),
        selected_option_id INTEGER REFERENCES quiz_options(id),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        due_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS assignment_submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        submission_text TEXT,
        file_url TEXT,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        grade INTEGER,
        feedback TEXT,
        UNIQUE(assignment_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS certificates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        certificate_url TEXT,
        UNIQUE(user_id, course_id)
      );
    `);

    // 2. Clear Existing Data (Optional but recommended for a clean seed)
    // We only clear if we want a fresh start. Let's keep existing users if any.
    // db.exec('DELETE FROM certificates; DELETE FROM enrollments; DELETE FROM modules; DELETE FROM courses;');

    // 3. Seed Demo Users if not present
    const demoPassword = hashSync('demo123', 10);
    const users = [
      { name: 'Admin User', email: 'admin@nextgenschool.com', role: 'admin' },
      { name: 'Demo Teacher', email: 'teacher@nextgenschool.com', role: 'teacher' },
      { name: 'Demo Student', email: 'student@nextgenschool.com', role: 'student' }
    ];

    const insertUser = db.prepare('INSERT INTO users (name, email, password_hash, role, is_approved) VALUES (?, ?, ?, ?, 1) ON CONFLICT(email) DO NOTHING');
    for (const user of users) {
      insertUser.run(user.name, user.email, demoPassword, user.role);
    }

    const teacher = db.prepare('SELECT id FROM users WHERE email = ?').get('teacher@nextgenschool.com');
    const student = db.prepare('SELECT id FROM users WHERE email = ?').get('student@nextgenschool.com');

    // 4. Seed Courses (Class 4 to 9)
    const subjects = ['Mathematics', 'Science', 'English', 'History'];
    const courseInsert = db.prepare('INSERT INTO courses (title, description, thumbnail, teacher_id, status) VALUES (?, ?, ?, ?, ?)');
    const moduleInsert = db.prepare('INSERT INTO modules (course_id, title, description, video_url, content, order_number, duration_minutes) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const quizInsert = db.prepare('INSERT INTO quizzes (course_id, title) VALUES (?, ?)');
    const questionInsert = db.prepare('INSERT INTO quiz_questions (quiz_id, question, order_number) VALUES (?, ?, ?)');
    const optionInsert = db.prepare('INSERT INTO quiz_options (question_id, option_text, is_correct, order_number) VALUES (?, ?, ?, ?)');
    const enrollmentInsert = db.prepare('INSERT INTO enrollments (user_id, course_id, status, progress) VALUES (?, ?, ?, ?)');
    const certificateInsert = db.prepare('INSERT INTO certificates (user_id, course_id, certificate_url) VALUES (?, ?, ?)');

    for (let grade = 4; grade <= 9; grade++) {
      for (const subject of subjects) {
        const title = `Class ${grade} ${subject}`;
        const description = `Become a master of ${subject} for Class ${grade}. Fun, interactive lessons and quizzes!`;
        const thumbnail = grade % 2 === 0 ? 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b' : 'https://images.unsplash.com/photo-1509062522246-3755977927d7';
        
        const courseResult = courseInsert.run(title, description, thumbnail, teacher.id, 'approved');
        const courseId = courseResult.lastInsertRowid;

        // 5. Add Lessons (Modules) - 5 per course
        const moduleIds = [];
        for (let m = 1; m <= 5; m++) {
          const modResult = moduleInsert.run(
            courseId,
            `Lesson ${m}: Introduction to ${subject} Grade ${grade}`,
            `In this lesson, we will cover the basics of ${subject}.`,
            'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'Full lesson content goes here. It can be very long.',
            m,
            15
          );
          moduleIds.push(modResult.lastInsertRowid);
        }

        // 6. Add 2 Quizzes
        for (let q = 1; q <= 2; q++) {
          const quizResult = quizInsert.run(courseId, `Quiz ${q}: ${subject} Grade ${grade}`);
          const quizId = quizResult.lastInsertRowid;

          // Add 3 questions per quiz
          for (let qn = 1; qn <= 3; qn++) {
            const questionResult = questionInsert.run(quizId, `What is question ${qn} for ${subject} Grade ${grade}?`, qn);
            const questionId = questionResult.lastInsertRowid;

            // Add options
            optionInsert.run(questionId, 'Option 1 (Correct)', 1, 1);
            optionInsert.run(questionId, 'Option 2', 0, 2);
            optionInsert.run(questionId, 'Option 3', 0, 3);
            optionInsert.run(questionId, 'Option 4', 0, 4);
          }
        }

        // 7. Progress for Demo Student
        // Variety: 100%, 50%, 0%
        let progress = 0;
        if (grade === 4) progress = 100;
        else if (grade === 5) progress = 50;
        else if (grade === 6) progress = 0;
        else if (grade === 7) progress = 100;
        else if (grade === 8) progress = 25;
        else progress = 0;

        if (grade <= 8) { // Only enroll in some
          enrollmentInsert.run(student.id, courseId, 'approved', progress);
          
          if (progress === 100) {
            certificateInsert.run(student.id, courseId, `/certificates/${courseId}.pdf`);
          }
          
          // Seed module progress
          const completedCount = Math.floor((progress / 100) * 5);
          for (let i = 0; i < completedCount; i++) {
            db.prepare('INSERT INTO module_progress (module_id, user_id, completed, completed_at) VALUES (?, ?, ?, ?) ON CONFLICT(module_id, user_id) DO UPDATE SET completed = 1').run(moduleIds[i], student.id, 1, new Date().toISOString());
          }
        }
      }
    }
  })();

  console.log('✅ Database initialized and seeded successfully with Class 4-9 data!');
} catch (error) {
  console.error('❌ Database initialization/seed error:', error.message);
} finally {
  db.close();
}
