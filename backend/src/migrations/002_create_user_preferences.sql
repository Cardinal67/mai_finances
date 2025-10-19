-- Migration: Create USER_PREFERENCES table
-- Created: 2025-10-19T23:46:00Z
-- Description: Detailed user preferences and customization settings

CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    timezone VARCHAR(100) DEFAULT 'America/New_York',
    date_range_preference INTEGER DEFAULT 30,
    safety_buffer_type VARCHAR(20) DEFAULT 'fixed' CHECK (safety_buffer_type IN ('fixed', 'percentage')),
    safety_buffer_amount DECIMAL(12, 2) DEFAULT 100.00,
    default_currency VARCHAR(10) DEFAULT 'USD',
    dashboard_widgets JSONB DEFAULT '{"visible": ["safe_to_spend", "upcoming_bills", "upcoming_income", "recent_activity", "accounts", "alerts"], "order": [0,1,2,3,4,5], "sizes": {}}'::jsonb,
    table_columns JSONB DEFAULT '{}'::jsonb,
    display_density VARCHAR(20) DEFAULT 'comfortable' CHECK (display_density IN ('compact', 'comfortable', 'spacious')),
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    notification_preferences JSONB DEFAULT '{"show_overdue": true, "show_due_soon": true, "days_before": 3}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE INDEX idx_user_preferences_user ON user_preferences(user_id);

COMMENT ON TABLE user_preferences IS 'Detailed user customization settings';

