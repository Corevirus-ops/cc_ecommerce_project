require('dotenv').config();

const express = require('express');
const session = require('express-session');
const passport = require('./auth/auth');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));



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

const facebookAuthRoutes = require('./routes/facebookAuthRoutes');
app.use('/auth/facebook', facebookAuthRoutes);

const googleAuthRoutes = require('./routes/googleAuthRoutes');
app.use('/auth/google', googleAuthRoutes);



const authRoutes = require('./routes/authRoutes');
app.use('/', authRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/users', isAuthenticated, userRoutes);

const productRoutes = require('./routes/productRoutes');
app.use('/products', productRoutes);

const cartRoutes = require('./routes/cartRoutes');
app.use('/cart', isAuthenticated, cartRoutes);

const orderRoutes = require('./routes/orderRoutes');
app.use('/orders', isAuthenticated, orderRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});