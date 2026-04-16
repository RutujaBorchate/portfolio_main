const fs = require('fs');
const email = 'testuser_' + Date.now() + '@example.com';
fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test User',
    email: email,
    password: 'password123',
    role: 'student'
  })
}).then(async r => {
  const status = r.status;
  const text = await r.text();
  fs.writeFileSync('test-output.log', status + '\n' + text, 'utf8');
}).catch(console.error);
