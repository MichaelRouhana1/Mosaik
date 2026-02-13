INSERT INTO products (name, description, price, image_url, category, color)
SELECT 'Classic White T-Shirt', 'Premium cotton t-shirt with a relaxed fit. Perfect for everyday wear.', 29.99, '/images/tshirts.png', 'T-Shirts', 'White'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Classic White T-Shirt');

INSERT INTO products (name, description, price, image_url, category, color)
SELECT 'Slim Fit Denim Jeans', 'Comfortable slim-fit denim jeans with a modern cut. Durable and stylish.', 79.99, '/images/jeans.png', 'Jeans', 'Indigo'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Slim Fit Denim Jeans');

INSERT INTO products (name, description, price, image_url, category, color)
SELECT 'Oversized Hoodie', 'Soft fleece hoodie with an oversized fit. Cozy for cool weather.', 59.99, '/images/hoodies.png', 'Hoodies', 'Charcoal'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Oversized Hoodie');

DELETE FROM products WHERE name = 'Leather Jacket';

INSERT INTO products (name, description, price, image_url, category, color)
SELECT 'Wool Winter Sweater', 'Warm wool blend sweater with a ribbed knit. Ideal for autumn and winter.', 89.99, 'https://images.pexels.com/photos/9558579/pexels-photo-9558579.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop', 'Sweaters', 'Camel'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Wool Winter Sweater');

INSERT INTO products (name, description, price, image_url, category, color)
SELECT 'Dark Grey Baggy Jeans', 'Relaxed baggy-fit denim with a worn wash. Wide legs that stack over sneakers. Premium denim fabric.', 89.99, '/images/photo_2025-11-06_09-46-22.JPG', 'Jeans', 'Charcoal'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Dark Grey Baggy Jeans');

INSERT INTO products (name, description, price, image_url, category, color)
SELECT 'Medium Wash Blue Baggy Jeans', 'Loose-fitting blue denim with paneled design. Contemporary streetwear style with a relaxed silhouette.', 84.99, '/images/photo_2025-10-23_13-52-21.JPG', 'Jeans', 'Blue'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Medium Wash Blue Baggy Jeans');

INSERT INTO products (name, description, price, image_url, category, color)
SELECT 'Light Blue Relaxed Straight Jeans', 'Classic relaxed straight-leg denim with a natural faded wash. Easy drape and comfort.', 79.99, '/images/photo_2025-05-01_12-57-14.JPG', 'Jeans', 'Light Blue'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Light Blue Relaxed Straight Jeans');

INSERT INTO products (name, description, price, image_url, category, color)
SELECT 'Light Wash Tapered Jeans', 'Slim-tapered fit with a light blue wash. Relaxed through the thigh, narrowing to the ankle.', 82.99, '/images/photo_2025-05-01_12-56-39.JPG', 'Jeans', 'Light Blue'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Light Wash Tapered Jeans');

INSERT INTO products (name, description, price, image_url, category, color)
SELECT 'Medium Blue Straight Jeans', 'Straight-leg denim with a medium wash. Versatile everyday style.', 79.99, '/images/photo_2025-05-01_12-56-39 (2).JPG', 'Jeans', 'Blue'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Medium Blue Straight Jeans');

INSERT INTO products (name, description, price, image_url, category, color)
SELECT 'Light Wash Relaxed Jeans', 'Loose, relaxed fit with a light acid wash. Casual and contemporary.', 84.99, '/images/photo_2025-05-01_12-55-09 (2).JPG', 'Jeans', 'Light Blue'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Light Wash Relaxed Jeans');

INSERT INTO products (name, description, price, image_url, category, color)
SELECT 'White Distressed Jeans', 'Cropped straight-fit white denim with subtle distressing. Clean, modern aesthetic.', 94.99, '/images/photo_2025-04-30_13-30-20.JPG', 'Jeans', 'White'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'White Distressed Jeans');

INSERT INTO products (name, description, price, image_url, category, color)
SELECT 'Charcoal Loose-Fit Jeans', 'Dark charcoal washed denim with a loose, baggy silhouette. Stacked at the ankle.', 89.99, '/images/photo_2025-03-06_00-19-05 (2).JPG', 'Jeans', 'Charcoal'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Charcoal Loose-Fit Jeans');

INSERT INTO products (name, description, price, image_url, category, color)
SELECT 'Dark Grey Washed Jeans', 'Faded dark grey denim with a relaxed fit. Vintage-inspired wash.', 87.99, '/images/photo_2025-02-13_13-36-21 (2).JPG', 'Jeans', 'Charcoal'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Dark Grey Washed Jeans');

INSERT INTO products (name, description, price, image_url, category, color)
SELECT 'Charcoal Gray Denim Jeans', 'Classic charcoal gray denim in a regular fit. Timeless five-pocket styling.', 79.99, '/images/photo_2025-01-18_12-14-22 (2).JPG', 'Jeans', 'Charcoal'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Charcoal Gray Denim Jeans')
  AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Blue Denim Regular Fit');

INSERT INTO products (name, description, price, image_url, category, color)
SELECT 'Black Distressed Jeans', 'Black washed denim with rips and distressing. Tapered fit, cropped hem.', 99.99, '/images/photo_2025-01-02_09-34-19.JPG', 'Jeans', 'Black'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Black Distressed Jeans');

UPDATE products SET image_url = '/images/tshirts.png', color = 'White' WHERE name = 'Classic White T-Shirt';
UPDATE products SET image_url = '/images/jeans.png', color = 'Indigo' WHERE name = 'Slim Fit Denim Jeans';
UPDATE products SET image_url = '/images/hoodies.png', color = 'Charcoal' WHERE name = 'Oversized Hoodie';
UPDATE products SET image_url = 'https://images.pexels.com/photos/9558579/pexels-photo-9558579.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop', color = 'Camel' WHERE name = 'Wool Winter Sweater';

UPDATE products SET name = 'Charcoal Gray Denim Jeans', description = 'Classic charcoal gray denim in a regular fit. Timeless five-pocket styling.', color = 'Charcoal' WHERE name = 'Blue Denim Regular Fit';

UPDATE products SET additional_image_urls = '/images/photo_2025-01-18_12-14-21.JPG,/images/photo_2025-01-18_12-14-22.JPG' WHERE name = 'Charcoal Gray Denim Jeans';

INSERT INTO products (name, description, price, image_url, category, color)
SELECT 'Camel & Navy Quilted Jacket', 'Two-tone quilted jacket with camel body and navy sleeves. Sporty casual style with ribbed collar and zippered pockets.', 149.99, '/images/A9C0AFA5-B129-4D89-8EE6-EC5C28086A2E.JPG', 'Jackets', 'Camel'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Camel & Navy Quilted Jacket');

INSERT INTO products (name, description, price, image_url, category, color)
SELECT 'Grey Leaf Print Puffer Jacket', 'Hooded puffer jacket with subtle botanical pattern. Lightweight insulation with orange accent pulls.', 129.99, '/images/774C473F-D190-44DE-90C4-9F190FCAE47A.JPG', 'Jackets', 'Grey'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Grey Leaf Print Puffer Jacket');

INSERT INTO products (name, description, price, image_url, category, color)
SELECT 'Navy Blue Hooded Puffer', 'Solid navy puffer jacket with horizontal quilting. Hood with adjustable toggles and zippered side pockets.', 134.99, '/images/85D40A96-0613-40E4-B5F3-6F469CA5001A.JPG', 'Jackets', 'Navy'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Navy Blue Hooded Puffer');

INSERT INTO products (name, description, price, image_url, category, color)
SELECT 'Beige Lightweight Jacket', 'Full-zip lightweight jacket in neutral beige. Stand-up collar, raglan sleeves, and elasticated cuffs and hem.', 169.99, '/images/46B53675-2D59-4DEB-A9B5-28433DAEB22B.JPG', 'Jackets', 'Beige'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Beige Lightweight Jacket');

INSERT INTO products (name, description, price, image_url, category, color)
SELECT 'Navy Windbreaker Jacket', 'Lightweight navy windbreaker with stand-up collar. Raglan sleeves and sporty silhouette.', 159.99, '/images/1A32119E-6200-44D7-B69D-8B446D1619B7.PNG', 'Jackets', 'Navy'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Navy Windbreaker Jacket');

-- Default sizes for all products (XS,S,M,L,XL)
UPDATE products SET sizes = 'XS,S,M,L,XL' WHERE sizes IS NULL OR sizes = '';
