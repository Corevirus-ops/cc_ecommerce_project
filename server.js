require('dotenv').config();

const express = require('express');
const session = require('express-session');
const passport = require('./auth/auth');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

const authRoutes = require('./routes/authRoutes');
app.use('/', authRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});