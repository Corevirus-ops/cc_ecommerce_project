const express = require('express');
const router = express.Router();

const pool = require('../db/pg');

//return all previous orders
router.get('/', async (req, res) => {
    const userId = req.user.id;
    const orders = await pool.query(
        `SELECT orders.id, orders.created_at, order_items.product_id, order_items.quantity
         FROM orders
         JOIN order_items ON order_items.order_id = orders.id
         WHERE orders.user_id = $1
         ORDER BY orders.id`,
        [userId]
    );
    res.json({ orders: orders.rows });

});

router.get('/:id', async (req, res) => {
    const orderId = Number(req.params.id);
    const userId = req.user.id;

    if (!Number.isInteger(orderId)) {
        return res.status(400).json({ message: 'A valid order ID is required' });
    }

    const order = await pool.query(
        `SELECT orders.id, orders.created_at, order_items.product_id, order_items.quantity
         FROM orders
         JOIN order_items ON order_items.order_id = orders.id
         WHERE orders.id = $1 AND orders.user_id = $2`,
        [orderId, userId]
    );

    if (order.rows.length === 0) {
        return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order: order.rows });
});

module.exports = router;