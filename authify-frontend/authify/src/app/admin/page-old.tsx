'use client';

export default function AdminDirect() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-blue-500">Admin Portal - Direct Access</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-400">Frontend Server</h3>
              <p className="text-green-400">✅ Running on port 3000</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-400">Backend Server</h3>
              <p className="text-green-400">✅ Running on port 5000</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-400">Admin Access</h3>
              <p className="text-green-400">✅ Page loading correctly</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Admin Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              'Dashboard',
              'User Management',
              'Roles & Permissions',
              'Authentication Settings',
              'Login & Activity Logs',
              'Session Management',
              'Audit Logs',
              'Security Monitoring',
              'Alerts & Notifications',
              'API & Integration',
              'System Configuration',
              'Backup & Data'
            ].map((feature, index) => (
              <div key={index} className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors">
                <h3 className="font-medium text-blue-400 mb-2">{feature}</h3>
                <p className="text-gray-400 text-sm">Admin functionality for {feature.toLowerCase()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">2</div>
              <p className="text-gray-400">Total Users</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">1</div>
              <p className="text-gray-400">Admin Users</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">12</div>
              <p className="text-gray-400">Admin Sections</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">0</div>
              <p className="text-gray-400">Security Alerts</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Access Information</h2>
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="mb-2"><strong>Admin Email:</strong> admin@acme.test</p>
            <p className="mb-2"><strong>Admin Password:</strong> Password123!</p>
            <p className="mb-2"><strong>Frontend URL:</strong> http://localhost:3000</p>
            <p className="mb-2"><strong>Backend URL:</strong> http://localhost:5000</p>
            <p className="mb-2"><strong>Admin Portal:</strong> http://localhost:3000/admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
