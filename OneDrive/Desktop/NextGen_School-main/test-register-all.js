const fs = require('fs');

async function testPort(port) {
  const email = 'testuser_' + Date.now() + '@example.com';
  try {
    const r = await fetch(`http://localhost:${port}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: email,
        password: 'password123',
        role: 'student'
      })
    });
    const text = await r.text();
    console.log(`Port ${port} response: ${r.status}`);
    if (r.status === 200 || !text.includes('Clerk')) {
       console.log(`Port ${port} is the right app!`);
       console.log(text);
    }
  } catch(e) {
    console.log(`Port ${port} failed: ${e.message}`);
  }
}

async function run() {
  await testPort(3000);
  await testPort(3001);
  await testPort(3002);
  await testPort(3003);
}

run();
