const passport = require('passport');
const GoogleStrategy = require('passport-google-oidc').Strategy;
const bcrypt = require('bcrypt');
const pool = require('../db/pg');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.BACKEND_URL + '/auth/google/callback',
    scope: ['profile', 'email']
},
async (issuer, profile, done) => {
    try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
            return done(new Error('Google did not return an email address.'));
        }

        const result = await pool.query('SELECT id, username, email FROM users WHERE email = $1', [email]);
        let user = result.rows[0];

        if (!user) {
            const username = profile.displayName.replace(/\s+/g, '_');
            const password = await bcrypt.hash(`${profile.id}:${process.env.SECRET}`, 10);
            const insertResult = await pool.query(
                'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
                [username, email, password]
            );
            user = insertResult.rows[0];
        }
        done(null, user);
    } catch (err) {
        done(err);
    }
}
));

module.exports = passport;