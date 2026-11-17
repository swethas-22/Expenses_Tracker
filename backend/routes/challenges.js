const express = require('express');
const router = express.Router();
const { getStore, saveStore } = require('../data/db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/challenges/
router.get('/', authenticateToken, (req, res) => {
  const store = getStore();
  const userId = req.user.id;
  const challenges = store.challenges.filter(c => c.user === userId);

  const formatted = challenges.map(c => {
    const percent = c.target_amount > 0
      ? Math.min(100, Math.round((c.current_amount / c.target_amount) * 100))
      : 0;
    return {
      ...c,
      percent,
      is_completed: percent >= 100 || c.status === 'completed'
    };
  });

  return res.status(200).json(formatted);
});

// POST /api/challenges/
router.post('/', authenticateToken, (req, res) => {
  const store = getStore();
  const userId = req.user.id;
  const { title, description, target_amount, duration_days } = req.body;
  const errors = {};

  if (!title || title.trim().length === 0) {
    errors.title = ['Title is required.'];
  }

  const numTarget = parseFloat(target_amount);
  if (isNaN(numTarget) || numTarget <= 0) {
    errors.target_amount = ['Target amount must be greater than 0.'];
  }

  const numDays = parseInt(duration_days, 10);
  if (isNaN(numDays) || numDays <= 0) {
    errors.duration_days = ['Duration days must be at least 1.'];
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  const newChallenge = {
    id: 'chal-' + Date.now(),
    user: userId,
    title: title.trim(),
    description: description ? description.trim() : '',
    target_amount: parseFloat(numTarget.toFixed(2)),
    current_amount: 0.00,
    duration_days: numDays,
    days_left: numDays,
    badge: 'Ambition Seeker',
    status: 'active',
    created_at: new Date().toISOString()
  };

  store.challenges.push(newChallenge);
  saveStore();

  return res.status(201).json({
    ...newChallenge,
    percent: 0,
    is_completed: false
  });
});

// POST /api/challenges/:id/contribute
// Add saved amount towards a challenge goal
router.post('/:id/contribute', authenticateToken, (req, res) => {
  const store = getStore();
  const chalIndex = store.challenges.findIndex(c => c.id === req.params.id && c.user === req.user.id);
  if (chalIndex === -1) {
    return res.status(404).json({ detail: 'Challenge not found.' });
  }

  const chal = store.challenges[chalIndex];
  const { amount } = req.body;
  const numAmount = parseFloat(amount);

  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ detail: 'Contribution amount must be greater than 0.' });
  }

  chal.current_amount = parseFloat((chal.current_amount + numAmount).toFixed(2));
  if (chal.current_amount >= chal.target_amount) {
    chal.status = 'completed';
    chal.current_amount = chal.target_amount;
  }

  store.challenges[chalIndex] = chal;
  saveStore();

  const percent = Math.min(100, Math.round((chal.current_amount / chal.target_amount) * 100));

  return res.status(200).json({
    ...chal,
    percent,
    is_completed: chal.status === 'completed',
    message: chal.status === 'completed'
      ? '🎉 Woohoo! You achieved your savings challenge goal!'
      : `✨ Great job! Added to your savings challenge.`
  });
});

// DELETE /api/challenges/:id
router.delete('/:id', authenticateToken, (req, res) => {
  const store = getStore();
  const chalIndex = store.challenges.findIndex(c => c.id === req.params.id && c.user === req.user.id);
  if (chalIndex === -1) {
    return res.status(404).json({ detail: 'Challenge not found.' });
  }

  store.challenges.splice(chalIndex, 1);
  saveStore();

  return res.status(204).send();
});

module.exports = router;
