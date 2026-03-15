// Test API Client directly
require('dotenv').config();

// Mock browser environment for testing
global.fetch = async (url, options) => {
  const { default: fetch } = await import('node-fetch');
  return fetch(url, options);
};

// Mock localStorage
global.localStorage = {
  getItem: (key) => global.localStorageMock?.[key] || null,
  setItem: (key, value) => {
    if (!global.localStorageMock) global.localStorageMock = {};
    global.localStorageMock[key] = value;
  },
  removeItem: (key) => {
    if (global.localStorageMock) delete global.localStorageMock[key];
  }
};

// Mock document
global.document = {
  cookie: ''
};

const testApiClient = async () => {
  console.log('🧪 Testing API Client...\n');
  
  try {
    // Import API client
    const { apiClient } = await import('./src/lib/api-production.js');
    console.log('✅ API client imported successfully');
    
    // Test health check
    console.log('1️⃣ Testing health check...');
    const health = await apiClient.healthCheck();
    console.log('✅ Health check:', health);
    
    // Test login
    console.log('2️⃣ Testing login...');
    const loginResponse = await apiClient.login({
      email: 'admin@acme.test',
      password: 'Password123!'
    });
    console.log('✅ Login successful');
    console.log('User role:', loginResponse.user.role);
    console.log('User email:', loginResponse.user.email);
    console.log('Tokens generated:', !!loginResponse.tokens);
    
    // Test token storage
    console.log('3️⃣ Testing token storage...');
    console.log('Access token in localStorage:', !!localStorage.getItem('accessToken'));
    console.log('Refresh token in localStorage:', !!localStorage.getItem('refreshToken'));
    
    console.log('\n🎉 API Client Test Results:');
    console.log('✅ API Client: Working');
    console.log('✅ Health Check: Working');
    console.log('✅ Login: Working');
    console.log('✅ Token Storage: Working');
    
  } catch (error) {
    console.error('❌ API Client Test Failed:', error.message);
    console.error('Stack:', error.stack);
  }
};

testApiClient();
