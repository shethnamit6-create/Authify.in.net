// Frontend Login Debug Script
// Run this in the browser console on http://localhost:3000/admin-login

console.log('🧪 Frontend Login Debug Script');
console.log('================================');

// 1. Check if we're on the right page
console.log('1️⃣ Current URL:', window.location.href);
console.log('1️⃣ Pathname:', window.location.pathname);

// 2. Check if auth context is available
try {
  const authModule = require('@/lib/auth-context');
  console.log('2️⃣ Auth context module found:', !!authModule);
} catch (error) {
  console.log('2️⃣ Auth context module error:', error.message);
}

// 3. Check API client
try {
  const apiModule = require('@/lib/api-production');
  console.log('3️⃣ API client module found:', !!apiModule);
} catch (error) {
  console.log('3️⃣ API client module error:', error.message);
}

// 4. Test direct API call
console.log('4️⃣ Testing direct API call...');
fetch('http://localhost:5000/api/v1/company/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@acme.test',
    password: 'Password123!'
  })
})
.then(response => response.json())
.then(data => {
  console.log('4️⃣ Direct API call successful:', data);
  console.log('4️⃣ Token generated:', !!data.data?.token);
})
.catch(error => {
  console.log('4️⃣ Direct API call failed:', error.message);
});

// 5. Check localStorage
console.log('5️⃣ LocalStorage check:');
console.log('5️⃣ Access token exists:', !!localStorage.getItem('accessToken'));
console.log('5️⃣ User data exists:', !!localStorage.getItem('user'));

// 6. Check cookies
console.log('6️⃣ Cookie check:');
console.log('6️⃣ Access token cookie:', document.cookie.includes('accessToken'));

// 7. Check React environment
console.log('7️⃣ React environment:');
console.log('7️⃣ React available:', typeof React !== 'undefined');
console.log('7️⃣ Next.js available:', typeof next !== 'undefined');

console.log('================================');
console.log('🎯 Manual login test:');
console.log('Run this in console to test login manually:');
console.log(`
fetch('http://localhost:5000/api/v1/company/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@acme.test',
    password: 'Password123!'
  })
})
.then(r => r.json())
.then(data => {
  console.log('Login result:', data);
  if (data.data?.token) {
    localStorage.setItem('accessToken', data.data.token);
    localStorage.setItem('user', JSON.stringify({ email: 'admin@acme.test', role: 'admin', firstName: 'Admin', lastName: '' }));
    document.cookie = 'accessToken=' + data.data.token + '; path=/; max-age=3600';
    window.location.href = '/admin';
  }
})
.catch(e => console.error('Login failed:', e));
`);
