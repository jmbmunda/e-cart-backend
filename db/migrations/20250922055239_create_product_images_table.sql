-- migrate:up
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_thumbnail BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX unique_thumbnail_per_product
ON product_images(product_id)
WHERE is_thumbnail = TRUE;


-- migrate:down
DROP INDEX IF EXISTS unique_thumbnail_per_product;
DROP TABLE IF EXISTS product_images;

