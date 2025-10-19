-- Migration: Create SAVED_SEARCHES table
-- Created: 2025-10-20T00:02:00Z
-- Description: Save frequently used search queries

CREATE TABLE IF NOT EXISTS saved_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    search_name VARCHAR(100) NOT NULL,
    search_criteria JSONB NOT NULL,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX idx_saved_searches_favorite ON saved_searches(is_favorite) WHERE is_favorite = true;

COMMENT ON TABLE saved_searches IS 'Saved search queries for quick access';

