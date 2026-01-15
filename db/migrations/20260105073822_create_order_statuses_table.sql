-- migrate:up
CREATE TABLE order_statuses (
    status VARCHAR(50) PRIMARY KEY
);

-- migrate:down
DROP TABLE IF EXISTS order_statuses;
