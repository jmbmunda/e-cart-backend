-- migrate:up
ALTER TABLE order_items
ADD CONSTRAINT unique_order_product UNIQUE (order_id, product_id);


-- migrate:down
ALTER TABLE order_items
DROP CONSTRAINT IF EXISTS unique_order_product;
