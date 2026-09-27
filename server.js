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

async function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}


const authRoutes = require('./routes/authRoutes');
app.use('/', authRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/users', isAuthenticated, userRoutes);

const productRoutes = require('./routes/productRoutes');
app.use('/products', productRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});