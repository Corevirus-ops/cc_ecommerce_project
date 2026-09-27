BEGIN;

INSERT INTO users (id, username, email, password) VALUES
  (1, 'testuser', 'test@example.com', '$2b$10$.KBerreT4WtaT/jbCSy8w.B8gEJREk1per3zusT806TlHVEzg1lOG'),
  (2, 'adminuser', 'admin@example.com', '$2b$10$JHkwuGL61fJc.23WKxzVmu./4XGEqKABOMCn4PXR8skQ4nfuHkc5q')
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, name, description, price) VALUES
  (1, 'Wireless Keyboard', 'Compact mechanical keyboard with Bluetooth connectivity.', 79.99),
  (2, 'USB-C Hub', 'Seven-port USB-C hub with HDMI and power delivery.', 49.95),
  (3, 'Laptop Stand', 'Adjustable aluminum stand for laptops up to 16 inches.', 39.50),
  (4, 'Webcam', 'Full HD webcam with built-in microphone.', 59.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO categories (id, name, description) VALUES
  (1, 'Accessories', 'Computer and desk accessories.'),
  (2, 'Office', 'Equipment for home and professional offices.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_categories (product_id, category_id) VALUES
  (1, 1),
  (2, 1),
  (3, 1),
  (3, 2),
  (4, 2)
ON CONFLICT DO NOTHING;

INSERT INTO orders (id, user_id, total) VALUES
  (1, 1, 129.94),
  (2, 2, 59.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
  (1, 1, 1, 79.99),
  (1, 2, 1, 49.95),
  (2, 4, 1, 59.00)
ON CONFLICT DO NOTHING;

SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE((SELECT MAX(id) FROM products), 1));
SELECT setval(pg_get_serial_sequence('categories', 'id'), COALESCE((SELECT MAX(id) FROM categories), 1));
SELECT setval(pg_get_serial_sequence('orders', 'id'), COALESCE((SELECT MAX(id) FROM orders), 1));
SELECT setval(pg_get_serial_sequence('order_items', 'id'), COALESCE((SELECT MAX(id) FROM order_items), 1));

COMMIT;
