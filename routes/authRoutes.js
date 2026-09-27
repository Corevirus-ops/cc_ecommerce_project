const express = require('express');
const router = express.Router();
const passport = require('../auth/auth');
const bcrypt = require('bcrypt');
const pool = require('../db/pg');

router.post('/login', passport.authenticate('local', {
  session: true,
  failWithError: true
}), (req, res) => {
  res.json({
    message: 'Logged in successfully',
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email
    }
  });
}, (err, req, res, next) => {
  if (err.status === 401) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
  return next(err);
});

router.delete('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) { return next(err); }
    req.session.destroy(sessionError => {
      if (sessionError) { return next(sessionError); }
      res.status(204).send();
    });
  });
});

router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body || {};

    if (typeof username !== 'string' || typeof password !== 'string' || typeof email !== 'string' ||
        !username.trim() || !password || !email.trim()) {
      return res.status(400).json({ message: 'Username, password, and email are required' });
    }

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim();
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [normalizedUsername, normalizedEmail]
    );
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      'INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING username, email, id',
      [normalizedUsername, hashedPassword, normalizedEmail]
    );
    const user = newUser.rows[0];

    req.login(user, err => {
      if (err) {
        return res.status(500).json({ message: 'Error logging in after registration' });
      }
      return res.status(201).json({
        message: 'User registered successfully',
        user
      });
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Username or email already exists' });
    }
    return res.status(500).json({ message: 'Unable to register user' });
  }
});

module.exports = router;