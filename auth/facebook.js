const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('bcrypt');
const pool = require('../db/pg');

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    graphAPIVersion: process.env.FACEBOOK_GRAPH_API_VERSION || 'v24.0',
    callbackURL: process.env.BACKEND_URL + '/auth/facebook/callback',
    profileFields: ['id', 'emails', 'name'],
},
async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
            return done(new Error('Facebook did not return an email address. Check the email permission in Meta.'));
        }

        const result = await pool.query('SELECT id, username, email FROM users WHERE email = $1', [email]);
        let user = result.rows[0];

        if (!user) {
            const username = `${profile.name.givenName}_${profile.name.familyName}`;
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