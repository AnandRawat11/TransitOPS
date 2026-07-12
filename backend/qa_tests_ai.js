/**
 * qa_tests_ai.js
 * Automated verification of the AI Intelligence Module and regression tests.
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

async function runAITests() {
  console.log('🚀 Starting QA Tests for AI Intelligence Module...\n');

  try {
    // 1. Authenticate
    console.log('--- Auth Setup ---');
    const loginRes = await fetchAPI(`${API_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@transitops.com', password: 'password123' })
    });
    authToken = loginRes.data.token;
    console.log('✅ Authenticated successfully.\n');

    // 2. Test Fleet Health
    console.log('--- Testing Fleet Health ---');
    const healthRes = await fetchAPI(`${API_URL}/ai/fleet-health`);
    const health = healthRes.data;
    assert(health.prediction !== undefined, 'Health prediction is missing');
    assert(health.reasoning !== undefined, 'Explainable AI Reasoning missing');
    assert(health.confidenceScore !== undefined, 'Confidence Score missing');
    console.log(`✅ Fleet Health: Score ${health.prediction}/100, Status: ${health.status}`);
    
    // 3. Test Predictive Maintenance
    console.log('\n--- Testing Predictive Maintenance ---');
    const maintRes = await fetchAPI(`${API_URL}/ai/predictive-maintenance`);
    console.log(`✅ Predictive Maintenance returned ${maintRes.data.length} risks.`);

    // 4. Test Fuel Analysis
    console.log('\n--- Testing Fuel Analysis ---');
    const fuelRes = await fetchAPI(`${API_URL}/ai/fuel-analysis`);
    console.log(`✅ Fuel Analysis returned ${fuelRes.data.length} anomalies.`);

    // 5. Test Driver Performance
    console.log('\n--- Testing Driver Performance ---');
    const driverRes = await fetchAPI(`${API_URL}/ai/driver-performance`);
    console.log(`✅ Driver Performance Rankings returned ${driverRes.data.length} drivers.`);

    // 6. Test Cost Prediction
    console.log('\n--- Testing Cost Prediction ---');
    const costRes = await fetchAPI(`${API_URL}/ai/cost-prediction`);
    assert(costRes.data.prediction, 'Cost prediction missing');
    console.log(`✅ Cost Prediction: ${costRes.data.prediction}`);

    // 7. Test AI Copilot
    console.log('\n--- Testing AI Copilot Chat ---');
    const chatRes = await fetchAPI(`${API_URL}/ai/copilot/chat`, {
      method: 'POST',
      body: JSON.stringify({ prompt: "summarize today's fleet activity" })
    });
    assert(chatRes.data.response, 'Copilot response missing');
    console.log(`✅ Copilot Responded:\n${chatRes.data.response.substring(0, 100)}...`);

    // 8. Test Regressions (Ensure vehicles still load)
    console.log('\n--- Regression Test: Fetching Vehicles ---');
    const vehiclesRes = await fetchAPI(`${API_URL}/vehicles`);
    console.log(`✅ Regression Passed. Retrieved ${vehiclesRes.data.length} vehicles.`);

    console.log('\n🎉 All AI Tests and Regressions Passed!');
  } catch (err) {
    console.error('❌ Tests Failed:', err.message);
  }
}

runAITests();
