INSERT INTO products (name, description, price, image_url, category)
SELECT 'Classic White T-Shirt', 'Premium cotton t-shirt with a relaxed fit. Perfect for everyday wear.', 29.99, 'https://picsum.photos/seed/tshirt1/400/600', 'T-Shirts'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Classic White T-Shirt');

INSERT INTO products (name, description, price, image_url, category)
SELECT 'Slim Fit Denim Jeans', 'Comfortable slim-fit denim jeans with a modern cut. Durable and stylish.', 79.99, 'https://picsum.photos/seed/jeans1/400/600', 'Jeans'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Slim Fit Denim Jeans');

UPDATE products SET image_url = 'https://picsum.photos/seed/tshirt1/400/600' WHERE name = 'Classic White T-Shirt';
UPDATE products SET image_url = 'https://picsum.photos/seed/jeans1/400/600' WHERE name = 'Slim Fit Denim Jeans';

INSERT INTO products (name, description, price, image_url, category)
SELECT 'Oversized Hoodie', 'Soft fleece hoodie with an oversized fit. Cozy for cool weather.', 59.99, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', 'Hoodies'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Oversized Hoodie');

INSERT INTO products (name, description, price, image_url, category)
SELECT 'Leather Jacket', 'Classic black leather jacket with a timeless design. Suitable for all occasions.', 199.99, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400', 'Jackets'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Leather Jacket');

INSERT INTO products (name, description, price, image_url, category)
SELECT 'Wool Winter Sweater', 'Warm wool blend sweater with a ribbed knit. Ideal for autumn and winter.', 89.99, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400', 'Sweaters'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Wool Winter Sweater');
