/**
 * qa_tests_maintenance.js - Verifies Maintenance lifecycle and Vehicle state sync.
 */
require('dotenv').config();

const API_URL = 'http://localhost:5005/api/v1';

async function runTests() {
  console.log('--- Starting Maintenance QA Tests ---');
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

    // 2. Get a Vehicle ID to use for the test
    const vRes = await fetch(`${API_URL}/vehicles?limit=1`, { headers });
    const vData = await vRes.json();
    if (!vData.data || vData.data.length === 0) {
      throw new Error("No vehicles found in the database. Please create one first.");
    }
    const vehicleId = vData.data[0].id;
    console.log(`✅ Using Vehicle ID: ${vehicleId}`);

    // 3. Dashboard APIs
    console.log('\n2. Testing Dashboard APIs...');
    const sumRes = await fetch(`${API_URL}/dashboard/maintenance/summary`, { headers });
    const summary = await sumRes.json();
    console.log('✅ Maintenance Summary retrieved:', summary.data);
    
    const anaRes = await fetch(`${API_URL}/dashboard/maintenance/analytics`, { headers });
    const analytics = await anaRes.json();
    console.log('✅ Maintenance Analytics retrieved.');

    // 4. Create a Maintenance Log
    console.log('\n3. Testing Maintenance Creation...');
    const mntData = {
      vehicleId: vehicleId,
      maintenanceType: 'PREVENTIVE',
      priority: 'MEDIUM',
      title: 'Routine Oil Change',
      description: 'Standard 10,000km oil and filter change.',
      estimatedCost: 150,
      scheduledDate: new Date(Date.now() + 86400000).toISOString(),
    };
    
    const createRes = await fetch(`${API_URL}/maintenance`, {
      method: 'POST',
      headers,
      body: JSON.stringify(mntData)
    });
    const createData = await createRes.json();
    if (!createRes.ok) throw new Error(JSON.stringify(createData));
    
    const mntId = createData.data.id;
    console.log('✅ Maintenance Created:', createData.data.maintenanceNumber);
    
    // 5. Update Status to IN_PROGRESS
    console.log('\n4. Testing Maintenance Status Update (IN_PROGRESS)...');
    const updateRes = await fetch(`${API_URL}/maintenance/${mntId}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status: 'IN_PROGRESS', notes: 'Automated test start' })
    });
    const updateData = await updateRes.json();
    if (!updateRes.ok) throw new Error(JSON.stringify(updateData));
    console.log('✅ Maintenance Status Updated to IN_PROGRESS');

    // 5b. Verify Vehicle Status is MAINTENANCE
    const checkVehicleRes = await fetch(`${API_URL}/vehicles/${vehicleId}`, { headers });
    const checkVehicleData = await checkVehicleRes.json();
    if (checkVehicleData.data.currentStatus !== 'MAINTENANCE') {
       throw new Error(`Vehicle status did not sync. Expected MAINTENANCE, got ${checkVehicleData.data.currentStatus}`);
    }
    console.log('✅ Vehicle accurately synced to MAINTENANCE state.');
    
    // 6. Delete Maintenance (Should fail because it's IN_PROGRESS)
    console.log('\n5. Testing Maintenance Deletion (Should Fail)...');
    const deleteResFail = await fetch(`${API_URL}/maintenance/${mntId}`, {
      method: 'DELETE',
      headers
    });
    if (deleteResFail.ok) {
        throw new Error('Maintenance was deleted while IN_PROGRESS, which violates business rules.');
    }
    console.log('✅ Maintenance deletion safely blocked.');

    // 7. Update to COMPLETED
    console.log('\n6. Testing Maintenance Status Update (COMPLETED)...');
    const completeRes = await fetch(`${API_URL}/maintenance/${mntId}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status: 'COMPLETED', notes: 'Automated test complete' })
    });
    if (!completeRes.ok) throw new Error(await completeRes.text());
    console.log('✅ Maintenance Status Updated to COMPLETED');

    // 7b. Verify Vehicle Status is AVAILABLE
    const checkVehicleRes2 = await fetch(`${API_URL}/vehicles/${vehicleId}`, { headers });
    const checkVehicleData2 = await checkVehicleRes2.json();
    if (checkVehicleData2.data.currentStatus !== 'AVAILABLE') {
       throw new Error(`Vehicle status did not sync. Expected AVAILABLE, got ${checkVehicleData2.data.currentStatus}`);
    }
    console.log('✅ Vehicle accurately synced back to AVAILABLE state.');

    console.log('\n✅ All Basic Maintenance API tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();
