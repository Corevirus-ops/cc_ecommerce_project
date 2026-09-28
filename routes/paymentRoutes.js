const express = require('express');
const Stripe = require('stripe');
const pool = require('../db/pg');

const router = express.Router();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

router.post('/create-intent', async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ message: 'Stripe payments are not configured' });
  }

  try {
    const cart = await pool.query(
      `SELECT cart.id,
              SUM(cart_items.quantity * products.price)::numeric AS total
       FROM cart
       JOIN cart_items ON cart_items.cart_id = cart.id
       JOIN products ON products.id = cart_items.product_id
       WHERE cart.user_id = $1
       GROUP BY cart.id`,
      [req.user.id]
    );

    if (cart.rows.length === 0 || cart.rows[0].total === null) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const amount = Math.round(Number(cart.rows[0].total) * 100);
    if (!Number.isInteger(amount) || amount < 50) {
      return res.status(400).json({ message: 'Cart total must be at least $0.50' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        cartId: String(cart.rows[0].id),
        userId: String(req.user.id)
      }
    });

    return res.json({
      clientSecret: paymentIntent.client_secret,
      amount
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to prepare payment' });
  }
});

module.exports = router;
