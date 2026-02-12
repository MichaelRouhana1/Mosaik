INSERT INTO products (name, description, price, image_url, category, color)
SELECT 'Classic White T-Shirt', 'Premium cotton t-shirt with a relaxed fit. Perfect for everyday wear.', 29.99, '/images/tshirts.png', 'T-Shirts', 'White'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Classic White T-Shirt');

INSERT INTO products (name, description, price, image_url, category, color)
SELECT 'Slim Fit Denim Jeans', 'Comfortable slim-fit denim jeans with a modern cut. Durable and stylish.', 79.99, '/images/jeans.png', 'Jeans', 'Indigo'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Slim Fit Denim Jeans');

INSERT INTO products (name, description, price, image_url, category, color)
SELECT 'Oversized Hoodie', 'Soft fleece hoodie with an oversized fit. Cozy for cool weather.', 59.99, '/images/hoodies.png', 'Hoodies', 'Charcoal'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Oversized Hoodie');

INSERT INTO products (name, description, price, image_url, category, color)
SELECT 'Leather Jacket', 'Classic black leather jacket with a timeless design. Suitable for all occasions.', 199.99, 'https://images.pexels.com/photos/3748221/pexels-photo-3748221.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop', 'Jackets', 'Black'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Leather Jacket');

INSERT INTO products (name, description, price, image_url, category, color)
SELECT 'Wool Winter Sweater', 'Warm wool blend sweater with a ribbed knit. Ideal for autumn and winter.', 89.99, 'https://images.pexels.com/photos/9558579/pexels-photo-9558579.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop', 'Sweaters', 'Camel'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Wool Winter Sweater');

UPDATE products SET image_url = '/images/tshirts.png', color = 'White' WHERE name = 'Classic White T-Shirt';
UPDATE products SET image_url = '/images/jeans.png', color = 'Indigo' WHERE name = 'Slim Fit Denim Jeans';
UPDATE products SET image_url = '/images/hoodies.png', color = 'Charcoal' WHERE name = 'Oversized Hoodie';
UPDATE products SET image_url = 'https://images.pexels.com/photos/3748221/pexels-photo-3748221.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop', color = 'Black' WHERE name = 'Leather Jacket';
UPDATE products SET image_url = 'https://images.pexels.com/photos/9558579/pexels-photo-9558579.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop', color = 'Camel' WHERE name = 'Wool Winter Sweater';
