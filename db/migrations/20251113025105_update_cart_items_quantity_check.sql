-- migrate:up
ALTER TABLE cart_items DROP CONSTRAINT cart_items_quantity_check;
ALTER TABLE cart_items ADD CONSTRAINT cart_items_quantity_check CHECK (quantity >= 0);

-- migrate:down
ALTER TABLE cart_items DROP CONSTRAINT cart_items_quantity_check;
ALTER TABLE cart_items ADD CONSTRAINT cart_items_quantity_check CHECK (quantity > 0);