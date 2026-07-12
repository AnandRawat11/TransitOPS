

const API_URL = 'http://localhost:5005/api/v1';

const runTests = async () => {
  let adminToken = '';
  let driverToken = '';
  let vehicleId = '';

  const report = { passed: [], failed: [] };

  const assert = (condition, description) => {
    if (condition) {
      report.passed.push(description);
      console.log(`✅ PASS: ${description}`);
    } else {
      report.failed.push(description);
      console.error(`❌ FAIL: ${description}`);
    }
  };

  try {
    console.log('--- Starting QA API Tests ---');

    // 1. Health Check
    let res = await fetch('http://localhost:5005/api/health');
    let data = await res.json();
    assert(res.status === 200 && data.status === 'UP', 'Health endpoint responds correctly');

    // 2. Authentication Tests
    // 2a. Invalid Login (401)
    res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@transitops.com', password: 'wrongpassword' }),
    });
    data = await res.json();
    assert(res.status === 401 && !data.success, 'Invalid login returns 401 Unauthorized');

    // 2b. Valid Admin Login
    res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@transitops.com', password: 'password123' }),
    });
    data = await res.json();
    assert(res.status === 200 && data.success && data.data.token, 'Admin login succeeds and returns token');
    adminToken = data.data.token;

    // 2c. Valid Driver Login
    res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'driver@transitops.com', password: 'password123' }),
    });
    data = await res.json();
    assert(res.status === 200 && data.success && data.data.token, 'Driver login succeeds and returns token');
    driverToken = data.data.token;

    // 2d. Registration with weak password (Validation Error 400)
    res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@transitops.com',
        password: 'weak',
        role: 'DRIVER'
      }),
    });
    data = await res.json();
    assert(res.status === 400 && data.error && data.error.some(e => e.field === 'password'), 'Registration rejects weak passwords (400)');

    // 2e. Registration with duplicate email (409)
    res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Another Admin',
        email: 'admin@transitops.com', // Duplicate
        password: 'Password123!',
        role: 'ADMIN'
      }),
    });
    data = await res.json();
    assert(res.status === 409, 'Registration rejects duplicate email (409)');

    // 2f. GET /me
    res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    data = await res.json();
    assert(res.status === 200 && data.data.user.email === 'admin@transitops.com', 'GET /me retrieves profile');
    assert(!data.data.user.password, 'GET /me does not expose password');

    // 3. Authorization Tests (RBAC)
    // 3a. Create Vehicle as Driver (403 Forbidden)
    res = await fetch(`${API_URL}/vehicles`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${driverToken}`
      },
      body: JSON.stringify({
        registrationNumber: 'TEST-001',
        vehicleName: 'Test Truck',
        vehicleType: 'TRUCK',
        manufacturer: 'Test Make',
        model: 'Test Model',
        year: 2024,
        fuelType: 'DIESEL'
      }),
    });
    data = await res.json();
    assert(res.status === 403, 'Driver cannot create vehicles (403 Forbidden)');

    // 3b. Create Vehicle as Admin (201 Created)
    res = await fetch(`${API_URL}/vehicles`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        registrationNumber: 'TEST-001',
        vehicleName: 'Test Truck',
        vehicleType: 'TRUCK',
        manufacturer: 'Test Make',
        model: 'Test Model',
        year: 2024,
        fuelType: 'DIESEL'
      }),
    });
    data = await res.json();
    assert(res.status === 201 && data.data.registrationNumber === 'TEST-001', 'Admin can create vehicles (201 Created)');
    vehicleId = data.data.id;

    // 3c. Invalid Vehicle Validation (Future Year) (400)
    res = await fetch(`${API_URL}/vehicles`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        registrationNumber: 'TEST-002',
        vehicleName: 'Test Truck 2',
        vehicleType: 'TRUCK',
        manufacturer: 'Test Make',
        model: 'Test Model',
        year: 2100, // Invalid future year
        fuelType: 'DIESEL'
      }),
    });
    data = await res.json();
    assert(res.status === 400 && data.error && data.error.some(e => e.field === 'year'), 'Vehicle creation rejects future year (400)');

    // 3d. Duplicate Registration Number (409)
    res = await fetch(`${API_URL}/vehicles`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        registrationNumber: 'TEST-001', // Duplicate
        vehicleName: 'Test Truck 3',
        vehicleType: 'TRUCK',
        manufacturer: 'Test Make',
        model: 'Test Model',
        year: 2024,
        fuelType: 'DIESEL'
      }),
    });
    data = await res.json();
    assert(res.status === 409, 'Vehicle creation rejects duplicate registration number (409)');

    // 3e. GET Vehicles (200)
    res = await fetch(`${API_URL}/vehicles`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    data = await res.json();
    assert(res.status === 200 && Array.isArray(data.data), 'GET /vehicles returns array (200)');

    // 3f. PUT Update Vehicle (200)
    res = await fetch(`${API_URL}/vehicles/${vehicleId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        odometer: 1500
      }),
    });
    data = await res.json();
    assert(res.status === 200 && data.data.odometer === 1500, 'PUT /vehicles/:id updates successfully');

    // 3g. Invalid ObjectId (400)
    res = await fetch(`${API_URL}/vehicles/invalidid123`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    data = await res.json();
    assert(res.status === 400, 'Invalid ObjectId in params returns 400 Bad Request');

    // 3h. DELETE Vehicle (200)
    res = await fetch(`${API_URL}/vehicles/${vehicleId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    data = await res.json();
    assert(res.status === 200, 'DELETE /vehicles/:id successfully soft-deletes');

    // 3i. GET Deleted Vehicle (404)
    res = await fetch(`${API_URL}/vehicles/${vehicleId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    data = await res.json();
    assert(res.status === 404, 'GET /vehicles/:id for soft-deleted vehicle returns 404');

    // 4. Missing Token (401)
    res = await fetch(`${API_URL}/vehicles`);
    data = await res.json();
    assert(res.status === 401, 'Missing token returns 401 Unauthorized');

    // 5. 404 Route
    res = await fetch(`${API_URL}/invalidroute123`);
    data = await res.json();
    assert(res.status === 404, 'Invalid route returns 404 Not Found');

    console.log('\n--- QA Report ---');
    console.log(`Passed: ${report.passed.length}`);
    console.log(`Failed: ${report.failed.length}`);

    if (report.failed.length > 0) {
      console.log('\nFailures:');
      report.failed.forEach(f => console.log(`- ${f}`));
      process.exit(1);
    } else {
      process.exit(0);
    }

  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  }
};

runTests();
