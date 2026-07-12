/**
 * qa_tests_analytics.js
 * Automated verification of the Analytics & Reporting Module.
 */
const assert = require('assert');

const API_URL = 'http://localhost:5005/api/v1';
let authToken = '';

async function fetchAPI(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  
  const res = await fetch(url, { ...options, headers });
  
  // Handle binary streams for exports
  if (res.headers.get('content-type')?.includes('application/pdf')) {
    const buffer = await res.arrayBuffer();
    if (!res.ok) throw new Error('PDF request failed');
    return { isBinary: true, type: 'PDF', size: buffer.byteLength };
  }
  if (res.headers.get('content-type')?.includes('spreadsheetml')) {
    const buffer = await res.arrayBuffer();
    if (!res.ok) throw new Error('Excel request failed');
    return { isBinary: true, type: 'EXCEL', size: buffer.byteLength };
  }
  if (res.headers.get('content-type')?.includes('text/csv')) {
    const text = await res.text();
    if (!res.ok) throw new Error('CSV request failed');
    return { isBinary: false, type: 'CSV', data: text };
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API request failed');
  return data;
}

async function runAnalyticsTests() {
  console.log('🚀 Starting QA Tests for Analytics & Reporting Module...\n');

  try {
    // 1. Authenticate
    console.log('--- Auth Setup ---');
    const loginRes = await fetchAPI(`${API_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@transitops.com', password: 'password123' })
    });
    authToken = loginRes.data.token;
    console.log('✅ Authenticated successfully.\n');

    // 2. Test Executive Dashboard (KPI Engine)
    console.log('--- Testing KPI Engine (Aggregation Pipelines) ---');
    const dashboardRes = await fetchAPI(`${API_URL}/analytics/dashboard`);
    const data = dashboardRes.data;
    
    assert(data.fleet.total !== undefined, 'Fleet KPIs missing');
    assert(data.trips.total !== undefined, 'Trip KPIs missing');
    assert(data.finance.totalOperatingCost !== undefined, 'Finance KPIs missing');
    assert(data.maintenance.totalCost !== undefined, 'Maintenance KPIs missing');
    console.log(`✅ Dashboard Aggregations Successful (Total Vehicles: ${data.fleet.total}, Total Operating Cost: $${data.finance.totalOperatingCost})`);

    // 3. Test Scheduled Reports CRUD
    console.log('\n--- Testing Scheduled Reports ---');
    const createSchedule = await fetchAPI(`${API_URL}/analytics/schedules`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'Weekly Fleet Report',
        type: 'FLEET',
        frequency: 'WEEKLY',
        format: 'PDF',
        recipients: ['admin@transitops.com']
      })
    });
    assert(createSchedule.data.name === 'Weekly Fleet Report', 'Schedule creation failed');
    
    const getSchedules = await fetchAPI(`${API_URL}/analytics/schedules`);
    assert(getSchedules.data.length > 0, 'Schedule retrieval failed');
    console.log(`✅ Scheduled Reports CRUD Successful (${getSchedules.data.length} schedules found).`);

    // 4. Test PDF Export
    console.log('\n--- Testing PDF Export Engine ---');
    const pdfRes = await fetchAPI(`${API_URL}/analytics/export?type=DASHBOARD&format=PDF`);
    assert(pdfRes.isBinary && pdfRes.type === 'PDF', 'Expected a PDF binary stream');
    assert(pdfRes.size > 0, 'PDF buffer is empty');
    console.log(`✅ PDF Generation Successful (${pdfRes.size} bytes)`);

    // 5. Test Excel Export
    console.log('\n--- Testing Excel Export Engine ---');
    const excelRes = await fetchAPI(`${API_URL}/analytics/export?type=DASHBOARD&format=EXCEL`);
    assert(excelRes.isBinary && excelRes.type === 'EXCEL', 'Expected an Excel binary stream');
    assert(excelRes.size > 0, 'Excel buffer is empty');
    console.log(`✅ Excel Generation Successful (${excelRes.size} bytes)`);

    // 6. Test CSV Export
    console.log('\n--- Testing CSV Export Engine ---');
    const csvRes = await fetchAPI(`${API_URL}/analytics/export?type=DASHBOARD&format=CSV`);
    assert(csvRes.type === 'CSV', 'Expected CSV text');
    assert(csvRes.data.length > 0, 'CSV payload is empty');
    console.log(`✅ CSV Generation Successful (${csvRes.data.length} characters)`);

    console.log('\n🎉 All Analytics & Reporting Tests Passed! Zero Regressions.');
  } catch (err) {
    console.error('❌ Tests Failed:', err.message);
  }
}

runAnalyticsTests();
