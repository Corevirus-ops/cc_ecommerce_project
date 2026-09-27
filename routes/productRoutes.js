const express = require('express');
const router = express.Router();

const pool = require('../db/pg');

router.get('/', async (req, res) => {
    const category = req.query.category;
    const products = category
    // product_categories
      ? await pool.query('SELECT * FROM products LEFT JOIN product_categories ON products.id = product_categories.product_id WHERE product_categories.category_id = $1', [category])
      : await pool.query('SELECT * FROM products');
    res.json(products.rows);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const product = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  if (product.rows.length === 0) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product.rows[0]);
});



module.exports = router;