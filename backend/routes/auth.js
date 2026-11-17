const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getStore, saveStore } = require('../data/db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

const REFRESH_SECRET = process.env.REFRESH_SECRET || 'spendquest-refresh-secret-2026';

function generateTokens(user) {
  const payload = { id: user.id, username: user.username, email: user.email };
  const access = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  const refresh = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
  return { access, refresh };
}

// POST /api/auth/register/
router.post('/register', (req, res) => {
  const { username, email, password, password_confirm } = req.body;
  const errors = {};

  if (!username || username.trim().length === 0) {
    errors.username = ['Username is required.'];
  }
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    errors.email = ['A valid email address is required.'];
  }
  if (!password || password.length < 8) {
    errors.password = ['Password must be at least 8 characters long.'];
  } else if (/^\d+$/.test(password)) {
    errors.password = ['Password cannot be entirely numeric.'];
  }

  const store = getStore();
  if (store.users.some(u => u.email.toLowerCase() === (email || '').toLowerCase())) {
    errors.email = ['A user with that email already exists.'];
  }
  if (store.users.some(u => u.username.toLowerCase() === (username || '').toLowerCase())) {
    errors.username = ['A user with that username already exists.'];
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: 'user-' + Date.now(),
    username: username.trim(),
    email: email.trim().toLowerCase(),
    password: hashedPassword,
    first_name: req.body.first_name || username.trim(),
    last_name: req.body.last_name || '',
    currency: 'INR',
    financial_health: 85,
    created_at: new Date().toISOString()
  };

  store.users.push(newUser);
  saveStore();

  const tokens = generateTokens(newUser);
  return res.status(201).json({
    access: tokens.access,
    refresh: tokens.refresh,
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      currency: newUser.currency,
      financial_health: newUser.financial_health
    }
  });
});

// POST /api/auth/login/
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ detail: 'Email and password are required.' });
  }

  const store = getStore();
  const user = store.users.find(
    u => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === email.toLowerCase()
  );

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ detail: 'No active account found with the given credentials.' });
  }

  const tokens = generateTokens(user);
  return res.status(200).json({
    access: tokens.access,
    refresh: tokens.refresh,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      currency: user.currency || 'INR',
      financial_health: user.financial_health || 94
    }
  });
});

// POST /api/auth/token/refresh/
router.post('/token/refresh', (req, res) => {
  const { refresh } = req.body;
  if (!refresh) {
    return res.status(400).json({ detail: 'Refresh token required.' });
  }

  const store = getStore();
  if (store.blacklistedTokens.includes(refresh)) {
    return res.status(401).json({ detail: 'Token is blacklisted.' });
  }

  jwt.verify(refresh, REFRESH_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ detail: 'Token is invalid or expired.' });
    }

    const user = store.users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({ detail: 'User not found.' });
    }

    // Blacklist old refresh token (rotation per FR-1.4)
    store.blacklistedTokens.push(refresh);

    const newTokens = generateTokens(user);
    saveStore();

    return res.status(200).json({
      access: newTokens.access,
      refresh: newTokens.refresh
    });
  });
});

// POST /api/auth/logout/
router.post('/logout', (req, res) => {
  const { refresh, access } = req.body;
  const store = getStore();

  if (refresh) store.blacklistedTokens.push(refresh);
  if (access) store.blacklistedTokens.push(access);
  saveStore();

  return res.status(205).json({ detail: 'Successfully logged out.' });
});

// GET & PATCH /api/auth/profile/
router.get('/profile', authenticateToken, (req, res) => {
  const user = req.user;
  return res.status(200).json({
    id: user.id,
    username: user.username,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    currency: user.currency || 'INR',
    financial_health: user.financial_health || 94,
    created_at: user.created_at
  });
});

router.patch('/profile', authenticateToken, (req, res) => {
  const store = getStore();
  const userIndex = store.users.findIndex(u => u.id === req.user.id);
  if (userIndex === -1) {
    return res.status(404).json({ detail: 'User not found.' });
  }

  const user = store.users[userIndex];
  const { first_name, last_name, email, currency } = req.body;

  if (email && email !== user.email) {
    if (store.users.some(u => u.id !== user.id && u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ email: ['Email already taken by another account.'] });
    }
    user.email = email.trim().toLowerCase();
  }

  if (first_name !== undefined) user.first_name = first_name.trim();
  if (last_name !== undefined) user.last_name = last_name.trim();
  if (currency !== undefined) user.currency = currency.toUpperCase().trim();

  store.users[userIndex] = user;
  saveStore();

  return res.status(200).json({
    id: user.id,
    username: user.username,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    currency: user.currency,
    financial_health: user.financial_health
  });
});

// POST /api/auth/change-password/
router.post('/change-password', authenticateToken, (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) {
    return res.status(400).json({ detail: 'Current and new password are required.' });
  }

  const store = getStore();
  const userIndex = store.users.findIndex(u => u.id === req.user.id);
  const user = store.users[userIndex];

  if (!bcrypt.compareSync(current_password, user.password)) {
    return res.status(400).json({ current_password: ['Current password does not match.'] });
  }

  if (new_password.length < 8 || /^\d+$/.test(new_password)) {
    return res.status(400).json({ new_password: ['New password must be at least 8 characters and not all numbers.'] });
  }

  user.password = bcrypt.hashSync(new_password, 10);
  store.users[userIndex] = user;
  saveStore();

  return res.status(200).json({ detail: 'Password updated successfully.' });
});

// POST /api/auth/password-reset/
router.post('/password-reset', (req, res) => {
  const { email } = req.body;
  // Per FR-1.6: respond identically whether or not email is registered
  return res.status(200).json({
    detail: 'If an account exists with this email, a reset token has been dispatched.',
    mock_reset_token: 'spendquest-mock-reset-' + Date.now()
  });
});

// POST /api/auth/password-reset/confirm/
router.post('/password-reset/confirm', (req, res) => {
  const { token, new_password } = req.body;
  if (!token || !new_password || new_password.length < 8) {
    return res.status(400).json({ detail: 'Valid token and minimum 8-character password required.' });
  }
  return res.status(200).json({ detail: 'Password has been reset successfully. Please log in.' });
});

module.exports = router;
