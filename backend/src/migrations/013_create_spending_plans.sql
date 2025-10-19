-- Migration: Create SPENDING_PLANS table
-- Created: 2025-10-19T23:57:00Z
-- Description: Track planned purchases and what-if scenarios (NEW FEATURE)

CREATE TABLE IF NOT EXISTS spending_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_name VARCHAR(255),
    planned_amount DECIMAL(12, 2) NOT NULL,
    planned_date DATE,
    from_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_spending_plans_user ON spending_plans(user_id);
CREATE INDEX idx_spending_plans_date ON spending_plans(planned_date);
CREATE INDEX idx_spending_plans_status ON spending_plans(status);

COMMENT ON TABLE spending_plans IS 'Planned purchases and what-if spending scenarios';

