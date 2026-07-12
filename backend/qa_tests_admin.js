/**
 * qa_tests_admin.js
 * Automated verification of the Admin, Notifications, and Activity modules.
 */
const assert = require('assert');

const API_URL = 'http://localhost:5005/api/v1';
let authToken = '';

async function fetchAPI(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  
  const res = await fetch(url, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API request failed');
  return data;
}

async function runAdminTests() {
  console.log('🚀 Starting QA Tests for Admin, Notifications & Activity Modules...\n');

  try {
    // 1. Authenticate
    console.log('--- Auth Setup ---');
    const loginRes = await fetchAPI(`${API_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@transitops.com', password: 'password123' })
    });
    authToken = loginRes.data.token;
    console.log('✅ Authenticated successfully.\n');

    // 2. Test Admin User Management
    console.log('--- Testing Admin API ---');
    const usersRes = await fetchAPI(`${API_URL}/admin/users`);
    assert(usersRes.data.length > 0, 'No users found');
    console.log(`✅ Admin Users retrieved (${usersRes.data.length} found).`);

    // 3. Test Activity Timeline (EventBus Integration)
    // The login above should have triggered an Activity log automatically!
    console.log('\n--- Testing Activity Logging (EventBus) ---');
    const activityRes = await fetchAPI(`${API_URL}/activity/recent`);
    assert(activityRes.data.length > 0, 'No recent activities found');
    const loginActivity = activityRes.data.find(a => a.action === 'LOGIN');
    assert(loginActivity, 'Expected a LOGIN activity from our auth setup');
    console.log(`✅ Activity successfully captured via EventBus: ${loginActivity.description}`);

    // 4. Trigger a new Vehicle creation to test Vehicle EventBus hooks
    console.log('\n--- Testing Vehicle -> EventBus Hook ---');
    const tempVin = `TEST-${Date.now()}`;
    await fetchAPI(`${API_URL}/vehicles`, {
      method: 'POST',
      body: JSON.stringify({
        registrationNumber: `V-${Date.now().toString().slice(-4)}`,
        vehicleName: 'Test Truck',
        manufacturer: 'Volvo',
        model: 'VNL',
        year: 2024,
        vehicleType: 'TRUCK',
        fuelType: 'DIESEL',
        currentStatus: 'AVAILABLE'
      })
    });
    
    // Check if activity was generated for vehicle
    const vehicleActivityRes = await fetchAPI(`${API_URL}/activity/recent?module=VEHICLES`);
    assert(vehicleActivityRes.data.length > 0, 'Vehicle activity not logged');
    console.log('✅ Vehicle Creation successfully logged an activity via EventBus.');

    // 5. Test Notifications
    console.log('\n--- Testing Notifications ---');
    const notifCount = await fetchAPI(`${API_URL}/notifications/count`);
    assert(notifCount.data.count !== undefined, 'Unread count failed');
    
    const notifList = await fetchAPI(`${API_URL}/notifications`);
    assert(Array.isArray(notifList.data), 'Notifications list is invalid');
    console.log(`✅ Notifications working (Unread Count: ${notifCount.data.count}).`);

    console.log('\n🎉 All Admin, Notification, and Activity Tests Passed! Zero Regressions.');
  } catch (err) {
    console.error('❌ Tests Failed:', err.message);
  }
}

runAdminTests();
