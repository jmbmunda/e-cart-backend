-- migrate:up
CREATE TABLE product_categories(
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

CREATE INDEX idx_product_categories_product_id ON product_categories(product_id);
CREATE INDEX idx_product_categories_category_id ON product_categories(category_id);

-- migrate:down
DROP INDEX IF EXISTS idx_product_categories_product_id;
DROP INDEX IF EXISTS idx_product_categories_category_id;
DROP TABLE IF EXISTS product_categories;
