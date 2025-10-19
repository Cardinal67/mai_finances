-- Migration: Create CONTACT_NAME_HISTORY table
-- Created: 2025-10-19T23:49:00Z
-- Description: Track contact name changes (business acquisitions, renames)

CREATE TABLE IF NOT EXISTS contact_name_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    old_name VARCHAR(200) NOT NULL,
    new_name VARCHAR(200) NOT NULL,
    change_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    change_reason TEXT,
    old_account_number VARCHAR(100),
    new_account_number VARCHAR(100),
    documentation TEXT,
    user_notified BOOLEAN DEFAULT false
);

CREATE INDEX idx_contact_history_contact ON contact_name_history(contact_id);
CREATE INDEX idx_contact_history_date ON contact_name_history(change_date);

COMMENT ON TABLE contact_name_history IS 'History of contact name changes for business acquisitions and renames';

