const express = require('express');
const router = express.Router();
const { getStore, saveStore } = require('../data/db');
const { authenticateToken } = require('../middleware/auth');

function computeBudgetStatus(budget, transactions, categories) {
  const [bYear, bMonth] = budget.month.split('-');

  // Filter expenses matching user, year-month, and category (or all for overall)
  const matchingExpenses = transactions.filter(t => {
    if (t.user !== budget.user || t.type !== 'expense') return false;
    const [tYear, tMonth] = t.date.split('-');
    if (tYear !== bYear || tMonth !== bMonth) return false;

    if (budget.category === null) return true; // overall budget

    const cId = typeof t.category === 'object' ? t.category.id : t.category;
    return cId === budget.category;
  });

  const spent = matchingExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const limit = Number(budget.limit);
  const percent_used = limit > 0 ? parseFloat(((spent / limit) * 100).toFixed(1)) : 0;

  let alert_level = 'normal';
  let status_label = 'On Track';

  if (percent_used >= 100) {
    alert_level = 'exceeded';
    status_label = 'Limit Reached!';
  } else if (percent_used >= 80) {
    alert_level = 'warning';
    status_label = 'Almost there';
  }

  let catObj = null;
  if (budget.category) {
    catObj = categories.find(c => c.id === budget.category) || {
      id: budget.category,
      name: 'Category',
      color: '#A78BFA',
      icon: 'tag'
    };
  }

  return {
    id: budget.id,
    month: budget.month,
    category: catObj,
    limit: limit.toFixed(2),
    spent: spent.toFixed(2),
    remaining: Math.max(0, limit - spent).toFixed(2),
    percent_used,
    alert_level,
    status_label,
    created_at: budget.created_at
  };
}

// GET /api/budgets/
// ?month=YYYY-MM
router.get('/', authenticateToken, (req, res) => {
  const store = getStore();
  const userId = req.user.id;
  const { month } = req.query;

  let budgets = store.budgets.filter(b => b.user === userId);
  if (month) {
    budgets = budgets.filter(b => b.month === month);
  }

  const results = budgets.map(b => computeBudgetStatus(b, store.transactions, store.categories));

  return res.status(200).json({
    count: results.length,
    next: null,
    previous: null,
    results
  });
});

// POST /api/budgets/
router.post('/', authenticateToken, (req, res) => {
  const store = getStore();
  const userId = req.user.id;
  const { month, category, limit } = req.body;
  const errors = {};

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    errors.month = ['Month is required in YYYY-MM format.'];
  }

  const numLimit = parseFloat(limit);
  if (isNaN(numLimit) || numLimit <= 0) {
    errors.limit = ['Ensure limit is greater than 0.'];
  }

  let targetCat = null;
  if (category && category !== 'overall') {
    const catId = typeof category === 'object' ? category.id : category;
    const catObj = store.categories.find(c => c.id === catId);
    if (!catObj) {
      errors.category = ['Category not found.'];
    } else if (catObj.type !== 'expense') {
      errors.category = ['Budgets can only be set for expense categories.'];
    } else {
      targetCat = catObj.id;
    }
  }

  // Check unique per user, month, category (FR-4.3)
  const duplicate = store.budgets.some(
    b => b.user === userId && b.month === month && b.category === targetCat
  );
  if (duplicate) {
    return res.status(409).json({
      detail: targetCat ? 'A budget for this category and month already exists.' : 'An overall budget for this month already exists.'
    });
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  const newBudget = {
    id: 'bud-' + Date.now(),
    user: userId,
    month,
    category: targetCat,
    limit: parseFloat(numLimit.toFixed(2)),
    created_at: new Date().toISOString()
  };

  store.budgets.push(newBudget);
  saveStore();

  return res.status(201).json(computeBudgetStatus(newBudget, store.transactions, store.categories));
});

// PATCH /api/budgets/:id
router.patch('/:id', authenticateToken, (req, res) => {
  const store = getStore();
  const budgetIndex = store.budgets.findIndex(b => b.id === req.params.id && b.user === req.user.id);
  if (budgetIndex === -1) {
    return res.status(404).json({ detail: 'Budget not found.' });
  }

  const budget = store.budgets[budgetIndex];
  const { limit } = req.body;

  if (limit !== undefined) {
    const numLimit = parseFloat(limit);
    if (isNaN(numLimit) || numLimit <= 0) {
      return res.status(400).json({ limit: ['Ensure limit is greater than 0.'] });
    }
    budget.limit = parseFloat(numLimit.toFixed(2));
  }

  store.budgets[budgetIndex] = budget;
  saveStore();

  return res.status(200).json(computeBudgetStatus(budget, store.transactions, store.categories));
});

// DELETE /api/budgets/:id
router.delete('/:id', authenticateToken, (req, res) => {
  const store = getStore();
  const budgetIndex = store.budgets.findIndex(b => b.id === req.params.id && b.user === req.user.id);
  if (budgetIndex === -1) {
    return res.status(404).json({ detail: 'Budget not found.' });
  }

  store.budgets.splice(budgetIndex, 1);
  saveStore();

  return res.status(204).send();
});

module.exports = router;
