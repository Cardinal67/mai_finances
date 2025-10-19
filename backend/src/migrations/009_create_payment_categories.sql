-- Migration: Create PAYMENT_CATEGORIES junction table
-- Created: 2025-10-19T23:53:00Z
-- Description: Many-to-many relationship between payments and categories

CREATE TABLE IF NOT EXISTS payment_categories (
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (payment_id, category_id)
);

CREATE INDEX idx_payment_categories_payment ON payment_categories(payment_id);
CREATE INDEX idx_payment_categories_category ON payment_categories(category_id);

COMMENT ON TABLE payment_categories IS 'Junction table linking payments to multiple categories';

