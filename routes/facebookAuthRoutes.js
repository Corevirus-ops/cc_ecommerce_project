
const express = require('express');
const passport = require('../auth/facebook');

const router = express.Router();

router.get('/', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/callback',
    passport.authenticate('facebook', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
    }
);

module.exports = router;