const jwt = require('jsonwebtoken');
const { getStore } = require('../data/db');

const JWT_SECRET = process.env.JWT_SECRET || 'spendquest-super-secret-key-2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ detail: 'Authentication credentials were not provided.' });
  }

  const store = getStore();
  if (store.blacklistedTokens && store.blacklistedTokens.includes(token)) {
    return res.status(401).json({ detail: 'Token is blacklisted or expired.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ detail: 'Given token not valid for any token type.' });
    }

    const user = store.users.find(u => u.id === decoded.id || u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({ detail: 'User not found.' });
    }

    req.user = user;
    req.token = token;
    next();
  });
}

module.exports = {
  authenticateToken,
  JWT_SECRET
};
