const express = require('express');
const router = express.Router();

const pool = require('../db/pg');

//return all previous orders
router.get('/', async (req, res) => {
    const userId = req.user.id;
    const orders = await pool.query(
        `SELECT orders.id, orders.total, orders.created_at,
                COALESCE(json_agg(json_build_object(
                    'id', order_items.id,
                    'productId', order_items.product_id,
                    'productName', products.name,
                    'quantity', order_items.quantity,
                    'price', order_items.price
                ) ORDER BY order_items.id) FILTER (WHERE order_items.id IS NOT NULL), '[]') AS items
         FROM orders
         LEFT JOIN order_items ON order_items.order_id = orders.id
         LEFT JOIN products ON products.id = order_items.product_id
         WHERE orders.user_id = $1
         GROUP BY orders.id
         ORDER BY orders.created_at DESC`,
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
        `SELECT orders.id, orders.total, orders.created_at,
                COALESCE(json_agg(json_build_object(
                    'id', order_items.id,
                    'productId', order_items.product_id,
                    'productName', products.name,
                    'quantity', order_items.quantity,
                    'price', order_items.price
                ) ORDER BY order_items.id) FILTER (WHERE order_items.id IS NOT NULL), '[]') AS items
         FROM orders
         LEFT JOIN order_items ON order_items.order_id = orders.id
         LEFT JOIN products ON products.id = order_items.product_id
         WHERE orders.id = $1 AND orders.user_id = $2
         GROUP BY orders.id`,
        [orderId, userId]
    );

    if (order.rows.length === 0) {
        return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order: order.rows[0] });
});

module.exports = router;