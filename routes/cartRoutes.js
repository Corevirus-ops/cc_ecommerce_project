const express = require('express');
const router = express.Router();

const pool = require('../db/pg');

async function getOrCreateCart(userId) {
    const existingCart = await pool.query(
        'SELECT id FROM cart WHERE user_id = $1 ORDER BY id LIMIT 1',
        [userId]
    );

    if (existingCart.rows.length > 0) {
        return existingCart.rows[0].id;
    }

    const newCart = await pool.query(
        'INSERT INTO cart (user_id) VALUES ($1) RETURNING id',
        [userId]
    );
    return newCart.rows[0].id;
}

router.get('/', async (req, res) => {
    const cartId = await getOrCreateCart(req.user.id);
    const cartItems = await pool.query(
        `SELECT cart_items.id, cart_items.product_id, products.name, products.price,
                        cart_items.quantity, cart_items.created_at
         FROM cart_items
         JOIN products ON products.id = cart_items.product_id
         WHERE cart_items.cart_id = $1
         ORDER BY cart_items.id`,
        [cartId]
    );
    res.json({ cartId, items: cartItems.rows });
});

router.post('/', async (req, res) => {
    const productId = Number(req.body?.productId);
    const quantity = Number(req.body?.quantity);

    if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ message: 'productId and a positive integer quantity are required' });
    }

    const product = await pool.query('SELECT id FROM products WHERE id = $1', [productId]);
    if (product.rows.length === 0) {
        return res.status(404).json({ message: 'Product not found' });
    }

    const cartId = await getOrCreateCart(req.user.id);
    const existingItem = await pool.query(
        'SELECT id FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [cartId, productId]
    );

    if (existingItem.rows.length > 0) {
        const updatedItem = await pool.query(
            'UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2 RETURNING *',
            [quantity, existingItem.rows[0].id]
        );
        return res.json(updatedItem.rows[0]);
    }

    const newCartItem = await pool.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
        [cartId, productId, quantity]
    );
    res.status(201).json(newCartItem.rows[0]);
});

router.put('/:id', async (req, res) => {
    const cartItemId = Number(req.params.id);
    const quantity = Number(req.body?.quantity);

    if (!Number.isInteger(cartItemId) || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ message: 'A valid cart item ID and positive integer quantity are required' });
    }

    const updatedCartItem = await pool.query(
        `UPDATE cart_items
         SET quantity = $1
         WHERE id = $2
             AND cart_id IN (SELECT id FROM cart WHERE user_id = $3)
         RETURNING *`,
        [quantity, cartItemId, req.user.id]
    );
    if (updatedCartItem.rows.length === 0) {
        return res.status(404).json({ message: 'Cart item not found' });
    }
    res.json(updatedCartItem.rows[0]);
});

router.delete('/:id', async (req, res) => {
    const cartItemId = Number(req.params.id);

    if (!Number.isInteger(cartItemId)) {
        return res.status(400).json({ message: 'A valid cart item ID is required' });
    }

    const deletedCartItem = await pool.query(
        `DELETE FROM cart_items
         WHERE id = $1
             AND cart_id IN (SELECT id FROM cart WHERE user_id = $2)`,
        [cartItemId, req.user.id]
    );
    if (deletedCartItem.rowCount === 0) {
        return res.status(404).json({ message: 'Cart item not found' });
    }
    res.status(204).json({ message: 'Cart item deleted successfully' });
});

module.exports = router;