const express = require('express');
const router = express.Router();
const passport = require('../auth/auth');
const bcrypt = require('bcrypt');
const pool = require('../db/pg');

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

router.delete('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

router.post('/register', async (req, res) => {
  const { username, password, email } = req.body;
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

    //check if user exists
    const existingUser = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: 'Username or email already exists' });
    }

    await pool.query(
        'INSERT INTO users (username, password, email) VALUES ($1, $2, $3)',
        [username, hashedPassword, email]
    );
    req.login({ username, email }, err => {
        if (err) {
            return res.status(500).json({ message: 'Error logging in after registration' });
        }
        return res.status(201).json({ message: 'User registered successfully' });
    });

});

module.exports = router;