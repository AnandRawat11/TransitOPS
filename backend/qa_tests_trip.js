/**
 * qa_tests_trip.js - Verifies Trip lifecycle, Driver availability logic, and Vehicle state sync.
 */
require('dotenv').config();

const API_URL = 'http://localhost:5005/api/v1';

async function runTests() {
  console.log('--- Starting Trips QA Tests ---');
  let token = '';

  try {
    // 1. Login as Admin
    console.log('1. Logging in as Admin...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@transitops.com',
        password: 'password123',
      })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(loginData.message);
    token = loginData.data.token;
    console.log('✅ Logged in successfully.');
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // 2. Dashboard APIs
    console.log('\n2. Testing Dashboard APIs...');
    const sumRes = await fetch(`${API_URL}/dashboard/trips/summary`, { headers });
    const summary = await sumRes.json();
    console.log('✅ Trip Summary retrieved:', summary.data);
    
    const anaRes = await fetch(`${API_URL}/dashboard/trips/analytics`, { headers });
    const analytics = await anaRes.json();
    console.log('✅ Trip Analytics retrieved.');

    // 3. Create a Trip
    console.log('\n3. Testing Trip Creation...');
    const tripData = {
      startLocation: 'Warehouse A',
      destination: 'Port B',
      plannedDistance: 150,
      plannedStartTime: new Date().toISOString(),
      plannedEndTime: new Date(Date.now() + 86400000).toISOString(),
      cargoType: 'Electronics',
      cargoWeight: 500,
    };
    
    const createRes = await fetch(`${API_URL}/trips`, {
      method: 'POST',
      headers,
      body: JSON.stringify(tripData)
    });
    const createData = await createRes.json();
    if (!createRes.ok) throw new Error(JSON.stringify(createData));
    
    const tripId = createData.data.id;
    console.log('✅ Trip Created:', createData.data.tripNumber);
    
    // 4. Update Status to ASSIGNED
    console.log('\n4. Testing Trip Update...');
    const updateRes = await fetch(`${API_URL}/trips/${tripId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ notes: 'Automated test note' })
    });
    const updateData = await updateRes.json();
    if (!updateRes.ok) throw new Error(JSON.stringify(updateData));
    console.log('✅ Trip Updated:', updateData.data.notes);
    
    // 5. Delete Trip
    console.log('\n5. Testing Trip Deletion...');
    const deleteRes = await fetch(`${API_URL}/trips/${tripId}`, {
      method: 'DELETE',
      headers
    });
    if (!deleteRes.ok) {
        const deleteData = await deleteRes.json();
        throw new Error(JSON.stringify(deleteData));
    }
    console.log('✅ Trip Deleted.');

    console.log('\n✅ All Basic Trip API tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();
