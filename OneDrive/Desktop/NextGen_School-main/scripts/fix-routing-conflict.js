const fs = require('fs');
const path = require('path');

const dirs = [
  path.join(process.cwd(), 'app', 'dashboard', 'student', 'quizzes', '[quizId]'),
  path.join(process.cwd(), 'app', 'api', 'student', 'quizzes', '[quizId]')
];

dirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`Deleting ${dir}...`);
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`Deleted ${dir}.`);
  } else {
    console.log(`${dir} does not exist.`);
  }
});

console.log('✅ Routing conflict resolved.');
