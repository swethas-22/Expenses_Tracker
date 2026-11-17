const express = require('express');
const router = express.Router();
const { getStore, saveStore } = require('../data/db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/categories/
// List default categories + user's custom categories
router.get('/', authenticateToken, (req, res) => {
  const store = getStore();
  const userId = req.user.id;
  const categories = store.categories.filter(c => c.user === null || c.user === userId);
  return res.status(200).json(categories);
});

// POST /api/categories/
// Create custom category
router.post('/', authenticateToken, (req, res) => {
  const { name, type, color, icon } = req.body;
  const errors = {};

  if (!name || name.trim().length === 0 || name.trim().length > 50) {
    errors.name = ['Category name is required and must not exceed 50 characters.'];
  }

  if (!type || !['income', 'expense'].includes(type)) {
    errors.type = ['Type must be either "income" or "expense".'];
  }

  const store = getStore();
  const userId = req.user.id;
  const normalizedName = (name || '').trim().toLowerCase();

  // Check uniqueness per user (case-insensitive) per FR-3.3
  const exists = store.categories.some(
    c => (c.user === null || c.user === userId) && c.name.toLowerCase() === normalizedName
  );
  if (exists) {
    errors.name = ['A category with this name already exists.'];
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  const newCategory = {
    id: 'cat-custom-' + Date.now(),
    user: userId,
    name: name.trim(),
    type,
    color: color || '#A78BFA',
    icon: icon || 'tag',
    is_default: false,
    created_at: new Date().toISOString()
  };

  store.categories.push(newCategory);
  saveStore();

  return res.status(201).json(newCategory);
});

// PATCH /api/categories/:id
router.patch('/:id', authenticateToken, (req, res) => {
  const store = getStore();
  const category = store.categories.find(c => c.id === req.params.id);

  if (!category) {
    return res.status(404).json({ detail: 'Category not found.' });
  }

  if (category.is_default || category.user === null) {
    return res.status(403).json({ detail: 'Default categories cannot be modified.' });
  }

  if (category.user !== req.user.id) {
    return res.status(404).json({ detail: 'Category not found.' });
  }

  const { name, color, icon } = req.body;
  if (name !== undefined) {
    if (name.trim().length === 0 || name.trim().length > 50) {
      return res.status(400).json({ name: ['Name must be between 1 and 50 characters.'] });
    }
    const duplicate = store.categories.some(
      c => c.id !== category.id && (c.user === null || c.user === req.user.id) && c.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (duplicate) {
      return res.status(400).json({ name: ['A category with this name already exists.'] });
    }
    category.name = name.trim();
  }
  if (color !== undefined) category.color = color;
  if (icon !== undefined) category.icon = icon;

  saveStore();
  return res.status(200).json(category);
});

// DELETE /api/categories/:id
router.delete('/:id', authenticateToken, (req, res) => {
  const store = getStore();
  const categoryIndex = store.categories.findIndex(c => c.id === req.params.id);

  if (categoryIndex === -1) {
    return res.status(404).json({ detail: 'Category not found.' });
  }

  const category = store.categories[categoryIndex];

  if (category.is_default || category.user === null) {
    return res.status(403).json({ detail: 'Default categories cannot be deleted.' });
  }

  if (category.user !== req.user.id) {
    return res.status(404).json({ detail: 'Category not found.' });
  }

  // FR-3.5: If category has transactions, require reassigning first (return 409 Conflict)
  const hasTransactions = store.transactions.some(
    t => t.user === req.user.id && (t.category === category.id || (t.category && t.category.id === category.id))
  );

  if (hasTransactions) {
    return res.status(409).json({
      detail: 'Cannot delete category that is currently associated with transactions. Please reassign transactions first.'
    });
  }

  store.categories.splice(categoryIndex, 1);
  saveStore();

  return res.status(204).send();
});

module.exports = router;
