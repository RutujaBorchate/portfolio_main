const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(process.cwd(), 'app.db');
const db = new Database(dbPath);

console.log('Seeding NextGen School database...');

try {
  // Get existing users
  let admin = db.prepare("SELECT id FROM users WHERE email='admin@nextgenschool.com' LIMIT 1").get();
  let teacher = db.prepare("SELECT id FROM users WHERE email='teacher@nextgenschool.com' LIMIT 1").get();
  let student = db.prepare("SELECT id FROM users WHERE email='student@nextgenschool.com' LIMIT 1").get();

  const teacherId = teacher ? teacher.id : 1;
  const studentId = student ? student.id : 2;

  // Insert classes 4 to 9 courses
  const classes = [4, 5, 6, 7, 8, 9];
  const subjects = ['Mathematics', 'Science', 'English'];

  const insertCourse = db.prepare(
    "INSERT INTO courses (title, description, thumbnail, teacher_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
  );
  const insertModule = db.prepare(
    "INSERT INTO modules (course_id, title, description, video_url, content, order_number, duration_minutes) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  const insertQuiz = db.prepare(
    "INSERT INTO quizzes (course_id, title, time_limit, passing_score, max_attempts) VALUES (?, ?, ?, ?, ?)"
  );
  const insertQuizQuestion = db.prepare(
    "INSERT INTO quiz_questions (quiz_id, question, option1, option2, option3, option4, correct_answer, order_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const insertEnrollment = db.prepare(
    "INSERT INTO enrollments (user_id, course_id, status, progress, enrolled_at) VALUES (?, ?, 'approved', ?, CURRENT_TIMESTAMP)"
  );
  const insertCertificate = db.prepare(
    "INSERT INTO certificates (user_id, course_id, certificate_number, issued_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)"
  );
  const insertModuleProgress = db.prepare(
    "INSERT INTO module_progress (module_id, user_id, completed, completed_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)"
  );

  db.transaction(() => {
    // We'll track how many courses we create to vary their progress
    let courseIndex = 0;

    for (const classNum of classes) {
      for (const subject of subjects) {
        courseIndex++;
        
        // 1. Create Course
        const info = insertCourse.run(
          `Class ${classNum} ${subject} Masterclass`,
          `Comprehensive ${subject} syllabus designed specifically for Class ${classNum} students. Interactive, fun, and easy to understand!`,
          'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=1000',
          teacherId
        );
        const courseId = info.lastInsertRowid;

        // 2. Add 5 Modules (Lessons)
        const moduleIds = [];
        for (let i = 1; i <= 5; i++) {
          const modInfo = insertModule.run(
            courseId,
            `Chapter ${i}: Advanced ${subject} Concepts`,
            `In this lesson, we will explore the core concepts of Chapter ${i}.`,
            'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            `<p>This is the comprehensive text content for Chapter ${i}.</p>`,
            i,
            15 + Math.floor(Math.random() * 10)
          );
          moduleIds.push(modInfo.lastInsertRowid);
        }

        // 3. Add 2 Quizzes
        for (let i = 1; i <= 2; i++) {
          const quizInfo = insertQuiz.run(
            courseId,
            `${subject} Mid-term Assessment ${i}`,
            15,
            70,
            3
          );
          const quizId = quizInfo.lastInsertRowid;

          // Add 3 questions per quiz
          for (let q = 1; q <= 3; q++) {
            insertQuizQuestion.run(
              quizId,
              `What is the primary concept taught in ${subject} Chapter ${q}?`,
              `Option A`,
              `Option B`,
              `Option C`,
              `Option D`,
              Math.floor(Math.random() * 4) + 1, // Random correct answer 1-4
              q
            );
          }
        }

        // 4. Enroll the student with varying progress (100%, 50%, 0%)
        let progress = 0;
        let isCompleted = false;

        if (courseIndex % 3 === 0) {
          progress = 100;
          isCompleted = true;
        } else if (courseIndex % 3 === 1) {
          progress = 50;
        } else {
          progress = 0;
        }

        // Create enrollment
        const enrollInfo = insertEnrollment.run(studentId, courseId, progress);
        
        // Modules Progress
        for (let i = 0; i < moduleIds.length; i++) {
          let moduleCompleted = false;
          if (progress === 100) moduleCompleted = true;
          else if (progress === 50 && i < 2) moduleCompleted = true; // Complete first 2/5

          if (moduleCompleted) {
             insertModuleProgress.run(moduleIds[i], studentId, 1);
          }
        }

        // 5. Add Certificate if completed
        if (isCompleted) {
          const certNum = crypto.randomUUID().toUpperCase();
          insertCertificate.run(studentId, courseId, `CERT-${certNum}`);
          
          // Mark enrollment as fully completed (adding completed_at somehow if needed, SQLite syntax allows UPDATE)
          db.prepare("UPDATE enrollments SET completed_at = CURRENT_TIMESTAMP WHERE user_id = ? AND course_id = ?").run(studentId, courseId);
        }
      }
    }
  })();

  console.log("Successfully seeded courses, lessons, quizzes, progress, and certificates!");
} catch (error) {
  console.error("Seeding failed: ", error.message);
} finally {
  db.close();
}
