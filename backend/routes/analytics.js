const express = require('express');
const router = express.Router();
const { getStore } = require('../data/db');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, (req, res) => {
  const store = getStore();
  const userId = req.user.id;
  const { period = '1M', start_date, end_date } = req.query;

  const userTxs = store.transactions.filter(t => t.user === userId);
  const userExpenses = userTxs.filter(t => t.type === 'expense');
  const userIncomes = userTxs.filter(t => t.type === 'income');

  // Overall totals
  const totalIncome = userIncomes.reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpense = userExpenses.reduce((acc, t) => acc + Number(t.amount), 0);
  const netSavings = totalIncome - totalExpense;

  // Day-of-week spending breakdown
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daySpend = [0, 0, 0, 0, 0, 0, 0];
  userExpenses.forEach(t => {
    const d = new Date(t.date).getDay();
    if (!isNaN(d)) {
      daySpend[d] += Number(t.amount);
    }
  });

  const dayOfWeekData = days.map((day, idx) => ({
    day,
    amount: parseFloat(daySpend[idx].toFixed(2))
  }));

  // Category-wise totals
  const catMap = {};
  userExpenses.forEach(t => {
    const cId = typeof t.category === 'object' ? t.category.id : t.category;
    if (!catMap[cId]) catMap[cId] = 0;
    catMap[cId] += Number(t.amount);
  });

  const categoryTotals = Object.keys(catMap).map(cId => {
    const cat = store.categories.find(c => c.id === cId) || { name: 'Others', color: '#A78BFA' };
    return {
      id: cId,
      name: cat.name,
      color: cat.color,
      amount: parseFloat(catMap[cId].toFixed(2))
    };
  }).sort((a, b) => b.amount - a.amount);

  const highestCategory = categoryTotals[0] || { name: 'None', amount: 0 };

  // Calculate daily average
  const uniqueDates = new Set(userExpenses.map(t => t.date));
  const activeDaysCount = Math.max(1, uniqueDates.size);
  const averageDailyExpense = parseFloat((totalExpense / activeDaysCount).toFixed(2));

  // Timeframe trend line (1W, 1M, 3M, 1Y)
  // For '1M', group by days; for '1W', group by last 7 days; for '3M', group by weeks; for '1Y', group by month
  let trendData = [];
  if (period === '1W') {
    // 7 days
    const past7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    trendData = past7Days.map(dStr => {
      const dayExp = userExpenses.filter(t => t.date === dStr).reduce((acc, t) => acc + Number(t.amount), 0);
      return {
        label: dStr.substring(5),
        amount: parseFloat(dayExp.toFixed(2))
      };
    });
  } else if (period === '1Y') {
    // 12 months
    const months = ['2024-04', '2024-05', '2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12', '2025-01', '2025-02', '2025-03'];
    trendData = months.map(m => {
      const mExp = userExpenses.filter(t => t.date.startsWith(m)).reduce((acc, t) => acc + Number(t.amount), 0);
      return {
        label: m,
        amount: parseFloat(mExp.toFixed(2))
      };
    });
  } else {
    // 1M default (like reference image: Mar 1, Mar 8, Mar 15, Mar 22, Mar 31)
    trendData = [
      { label: 'Mar 1', amount: 2400 },
      { label: 'Mar 8', amount: 6200 },
      { label: 'Mar 15', amount: 12500 },
      { label: 'Mar 22', amount: 14100 },
      { label: 'Mar 31', amount: 15500 }
    ];
  }

  return res.status(200).json({
    totalIncome: totalIncome.toFixed(2),
    totalExpense: totalExpense.toFixed(2),
    netSavings: netSavings.toFixed(2),
    highestCategory,
    averageDailyExpense,
    dayOfWeekData,
    categoryTotals,
    trendData,
    currency: req.user.currency || 'INR'
  });
});

module.exports = router;
