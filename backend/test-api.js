const assert = require('assert');
const app = require('./server');

let server;
const PORT = 5099;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runTests() {
  console.log('🚀 Starting SpendQuest Comprehensive Backend Verification Suite...\n');

  server = app.listen(PORT);
  let accessToken = '';
  let refreshToken = '';

  try {
    // Test 1: Health check
    console.log('Test 1: Health Check...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    assert.strictEqual(healthRes.status, 200);
    const healthData = await healthRes.json();
    assert.strictEqual(healthData.status, 'healthy');
    console.log('✓ Health check passed.\n');

    // Test 2: Demo Login (Swetha)
    console.log('Test 2: Demo Login as Swetha...');
    const loginRes = await fetch(`${BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'swetha@spendquest.io', password: 'password123' })
    });
    assert.strictEqual(loginRes.status, 200);
    const loginData = await loginRes.json();
    assert.ok(loginData.access, 'Access token should be returned');
    assert.ok(loginData.refresh, 'Refresh token should be returned');
    assert.strictEqual(loginData.user.username, 'swetha');
    accessToken = loginData.access;
    refreshToken = loginData.refresh;
    console.log('✓ Login passed with valid JWT tokens.\n');

    // Test 3: Token Refresh & Rotation (FR-1.4)
    console.log('Test 3: Token Refresh and Rotation...');
    const refreshRes = await fetch(`${BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken })
    });
    assert.strictEqual(refreshRes.status, 200);
    const refreshData = await refreshRes.json();
    assert.ok(refreshData.access);
    assert.ok(refreshData.refresh);
    // Update active token
    accessToken = refreshData.access;
    console.log('✓ Refresh and token rotation passed.\n');

    // Test 4: Dashboard Summary & Figures (FR-5.1)
    console.log('Test 4: Dashboard Summary Figures...');
    const dashRes = await fetch(`${BASE_URL}/dashboard/summary/?month=2025-03`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    assert.strictEqual(dashRes.status, 200);
    const dashData = await dashRes.json();
    console.log(`Total Balance: ${dashData.total_balance}, Period Income: ${dashData.period_income}, Period Expense: ${dashData.period_expense}`);
    assert.strictEqual(dashData.period_expense, '15500.00');
    assert.strictEqual(dashData.period_income, '28000.00');
    assert.strictEqual(dashData.total_balance, '42500.00');
    console.log('✓ Dashboard figures match exact reference image.\n');

    // Test 5: Donut Category Breakdown (FR-5.3)
    console.log('Test 5: Donut Spending Breakdown...');
    const donutRes = await fetch(`${BASE_URL}/dashboard/category-breakdown/?month=2025-03`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    assert.strictEqual(donutRes.status, 200);
    const donutData = await donutRes.json();
    assert.strictEqual(donutData.total_spending, '15500.00');
    assert.ok(donutData.categories.length > 0);
    console.log(`✓ Donut breakdown verified with ${donutData.categories.length} categories.\n`);

    // Test 6: Budgets & Alert Thresholds (80% Warning, 100% Exceeded) (FR-4.5)
    console.log('Test 6: Budgets Alert Levels...');
    const budRes = await fetch(`${BASE_URL}/budgets/?month=2025-03`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    assert.strictEqual(budRes.status, 200);
    const budData = await budRes.json();
    const exceeded = budData.results.find(b => b.alert_level === 'exceeded');
    assert.ok(exceeded, 'Should contain at least one exceeded budget (Dining Out)');
    console.log(`✓ Budgets verified: Exceeded budget found: ${exceeded.category.name} (${exceeded.percent_used}%)\n`);

    // Test 7: Export CSV and Excel (FR-6.6, FR-6.7, FR-6.8)
    console.log('Test 7: Export CSV & Excel...');
    const csvRes = await fetch(`${BASE_URL}/transactions/export/?format=csv`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    assert.strictEqual(csvRes.status, 200);
    assert.strictEqual(csvRes.headers.get('content-type'), 'text/csv');
    const csvText = await csvRes.text();
    assert.ok(csvText.includes('Weekly groceries') || csvText.includes('Food & Dining'));

    const xlsxRes = await fetch(`${BASE_URL}/transactions/export/?format=xlsx`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    assert.strictEqual(xlsxRes.status, 200);
    console.log('✓ Both CSV and Excel (.xlsx) exports verified.\n');

    // Test 8: AI Insights Engine (Module E)
    console.log('Test 8: AI Insights Engine...');
    const insRes = await fetch(`${BASE_URL}/insights/`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    assert.strictEqual(insRes.status, 200);
    const insData = await insRes.json();
    assert.ok(insData.insights.length >= 3);
    assert.ok(insData.quick_insight);
    console.log(`✓ AI Insights generated ${insData.insights.length} pattern tips.\n`);

    // Test 9: Savings Challenges (Module F)
    console.log('Test 9: Savings Challenges...');
    const chalRes = await fetch(`${BASE_URL}/challenges/`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    assert.strictEqual(chalRes.status, 200);
    const chalData = await chalRes.json();
    assert.ok(chalData.length > 0);
    assert.strictEqual(chalData[0].title, 'Spring Savings Sprint');
    console.log('✓ Savings challenges verified.\n');

    console.log('🎉 ALL BACKEND TEST SUITES PASSED FLAWLESSLY!');
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runTests();
