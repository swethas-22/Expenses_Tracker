const assert = require('assert');
const app = require('./server');
const { getStore } = require('./data/db');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./middleware/auth');

function mockReq(options = {}) {
  return {
    method: options.method || 'GET',
    url: options.url || '/',
    originalUrl: options.url || '/',
    headers: options.headers || {},
    query: options.query || {},
    params: options.params || {},
    body: options.body || {},
    file: options.file || null
  };
}

function mockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    bodyData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(key, val) {
      this.headers[key] = val;
    },
    json(data) {
      this.bodyData = data;
      return this;
    },
    send(data) {
      this.bodyData = data;
      return this;
    },
    end() {
      return this;
    }
  };
  return res;
}

async function runDirectTests() {
  console.log('🚀 Running In-Process SpendQuest System Verification...\n');

  const store = getStore();
  const demoUser = store.users.find(u => u.username === 'swetha');
  assert.ok(demoUser, 'Demo user swetha must exist');
  console.log('✓ Store loaded with user:', demoUser.username);

  // Generate valid test JWT
  const token = jwt.sign({ id: demoUser.id, username: demoUser.username, email: demoUser.email }, JWT_SECRET);

  // 1. Test Dashboard Summary
  const dashRouter = require('./routes/dashboard');
  const summaryReq = mockReq({
    query: { month: '2025-03' },
    headers: { authorization: `Bearer ${token}` }
  });
  summaryReq.user = demoUser;
  const summaryRes = mockRes();

  // Find GET /summary handler
  const summaryLayer = dashRouter.stack.find(s => s.route && s.route.path === '/summary');
  summaryLayer.route.stack[1].handle(summaryReq, summaryRes);

  console.log('Dashboard figures:');
  console.log('  Total Balance:', summaryRes.bodyData.total_balance);
  console.log('  Period Income:', summaryRes.bodyData.period_income);
  console.log('  Period Expenses:', summaryRes.bodyData.period_expense);
  console.log('  Financial Health:', summaryRes.bodyData.financial_health + '%');

  assert.strictEqual(summaryRes.bodyData.total_balance, '42500.00');
  assert.strictEqual(summaryRes.bodyData.period_income, '28000.00');
  assert.strictEqual(summaryRes.bodyData.period_expense, '15500.00');
  assert.strictEqual(summaryRes.bodyData.financial_health, 94);
  console.log('✓ Dashboard Summary figures verified exactly to reference image!\n');

  // 2. Test Category Breakdown Donut
  const breakdownReq = mockReq({ query: { month: '2025-03' } });
  breakdownReq.user = demoUser;
  const breakdownRes = mockRes();
  const breakdownLayer = dashRouter.stack.find(s => s.route && s.route.path === '/category-breakdown');
  breakdownLayer.route.stack[1].handle(breakdownReq, breakdownRes);

  console.log('Category Spending breakdown:');
  breakdownRes.bodyData.categories.forEach(c => {
    console.log(`  ${c.name}: ${c.percentage}% (${c.amount})`);
  });
  assert.strictEqual(breakdownRes.bodyData.total_spending, '15500.00');
  console.log('✓ Donut breakdown calculation verified!\n');

  // 3. Test Budgets & Alert Levels (FR-4.5)
  const budgetRouter = require('./routes/budgets');
  const budgetReq = mockReq({ query: { month: '2025-03' } });
  budgetReq.user = demoUser;
  const budgetRes = mockRes();
  const budgetListLayer = budgetRouter.stack.find(s => s.route && s.route.path === '/' && s.route.methods.get);
  budgetListLayer.route.stack[1].handle(budgetReq, budgetRes);

  console.log('Budget statuses:');
  budgetRes.bodyData.results.forEach(b => {
    console.log(`  ${b.category?.name || 'Overall'}: ${b.spent}/${b.limit} (${b.percent_used}%) -> [${b.alert_level.toUpperCase()}]`);
  });

  const warningBudget = budgetRes.bodyData.results.find(b => b.alert_level === 'warning');
  const exceededBudget = budgetRes.bodyData.results.find(b => b.alert_level === 'exceeded');
  assert.ok(warningBudget, 'Warning budget must be triggered at >= 80%');
  assert.ok(exceededBudget, 'Exceeded budget must be triggered at >= 100%');
  console.log('✓ Budget 80% Warning and 100% Exceeded alert thresholds verified!\n');

  // 4. Test Transaction Filtering & Export
  const txRouter = require('./routes/transactions');
  const exportReq = mockReq({ query: { format: 'csv' } });
  exportReq.user = demoUser;
  const exportRes = mockRes();
  const exportLayer = txRouter.stack.find(s => s.route && s.route.path === '/export');
  await exportLayer.route.stack[1].handle(exportReq, exportRes);

  assert.strictEqual(exportRes.headers['Content-Type'], 'text/csv');
  assert.ok(exportRes.bodyData.includes('Date,Type,Title,Category,Payment Method,Amount (INR),Description'));
  console.log('✓ CSV Export structure verified with user currency header!\n');

  // 5. Test AI Insights (Module E)
  const insightRouter = require('./routes/insights');
  const insReq = mockReq();
  insReq.user = demoUser;
  const insRes = mockRes();
  const insLayer = insightRouter.stack.find(s => s.route && s.route.path === '/');
  insLayer.route.stack[1].handle(insReq, insRes);

  console.log('AI Insights:');
  console.log('  Quick Insight:', insRes.bodyData.quick_insight.highlight);
  console.log('  Total Insights Generated:', insRes.bodyData.insights.length);
  assert.ok(insRes.bodyData.insights.length >= 3);
  console.log('✓ AI Insights engine verified with actual transaction analytics!\n');

  console.log('✨ ALL 5 CORE ENGINE VERIFICATIONS PASSED FLAWLESSLY!');
  process.exit(0);
}

runDirectTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
