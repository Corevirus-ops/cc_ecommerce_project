const express = require('express');
const router = express.Router();
const pool = require('../db/pg');
const bcrypt = require('bcrypt');


router.get('/', async (req, res) => {
  const { id } = req.user;
  const user = await pool.query('SELECT id, username, email FROM users WHERE id = $1', [id]);
  if (user.rows.length === 0) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user.rows[0]);
});

router.put('/', async (req, res) => {
  const { id } = req.user;
  const { username, email, password } = req.body || {};

  if (typeof username !== 'string' || typeof email !== 'string' || !username.trim() || !email.trim()) {
    return res.status(400).json({ message: 'Username and email are required' });
  }

  if (password && (typeof password !== 'string' || !password.trim())) {
    return res.status(400).json({ message: 'Password must be a non-empty string' });
  }

  const normalizedUsername = username.trim();
  const normalizedEmail = email.trim();
  const hashedPassword = password ? await bcrypt.hash(password.trim(), 10) : null;
const query = 'UPDATE users SET username = $1, email = $2' + (hashedPassword ? ', password = $3 WHERE id = $4 ' : ' WHERE id = $3 ') + 'RETURNING id, username, email';
  const updatedUser = await pool.query(
    query,
    hashedPassword ? [normalizedUsername, normalizedEmail, hashedPassword, id] : [normalizedUsername, normalizedEmail, id]
  );

  if (updatedUser.rows.length === 0) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(updatedUser.rows[0]);
});

module.exports = router;