const express = require('express');
const passport = require('../auth/google');
const router = express.Router();

router.get('/',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect(process.env.FRONTEND_URL);
    }
);

module.exports = router;