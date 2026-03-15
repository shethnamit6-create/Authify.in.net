// Test file to verify admin login flow
// This can be run in the browser console to debug the admin login

export const testAdminLogin = async () => {
  console.log('🧪 Testing Admin Login Flow in Frontend...\n');
  
  try {
    // Test 1: Check if auth context is available
    console.log('1️⃣ Testing Auth Context...');
    const { useAuth } = await import('./auth-context');
    console.log('✅ Auth context imported successfully');
    
    // Test 2: Check if API client works
    console.log('2️⃣ Testing API Client...');
    const { apiClient } = await import('./api-production');
    
    try {
      const healthCheck = await apiClient.healthCheck();
      console.log('✅ API client working:', healthCheck);
    } catch (error) {
      console.log('❌ API client error:', error.message);
      return;
    }
    
    // Test 3: Simulate admin login
    console.log('3️⃣ Testing Admin Login...');
    try {
      const loginResponse = await apiClient.login({
        email: 'admin@authify.com',
        password: 'password'
      });
      
      console.log('✅ Login successful!');
      console.log('User role:', loginResponse.user.role);
      console.log('User email:', loginResponse.user.email);
      
      if (loginResponse.user.role === 'admin') {
        console.log('✅ Admin role confirmed!');
        
        // Test 4: Check localStorage
        console.log('4️⃣ Testing LocalStorage...');
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const userStr = localStorage.getItem('user');
        
        console.log('Access Token exists:', !!accessToken);
        console.log('Refresh Token exists:', !!refreshToken);
        console.log('User data exists:', !!userStr);
        
        if (userStr) {
          const user = JSON.parse(userStr);
          console.log('Stored user role:', user.role);
          console.log('Stored user email:', user.email);
        }
        
        console.log('\n🎉 Frontend Admin Login Test Complete!');
        console.log('✅ All components working correctly');
        console.log('✅ Ready for admin portal access');
        
      } else {
        console.log('❌ User is not an admin');
      }
    } catch (error) {
      console.log('❌ Login failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testAdminLogin = testAdminLogin;
  console.log('Run testAdminLogin() in browser console to test admin login flow');
}
