-- Migration: Create CONTACTS table
-- Created: 2025-10-19T23:48:00Z
-- Description: People and businesses for payments

CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_name VARCHAR(200) NOT NULL,
    contact_type VARCHAR(20) CHECK (contact_type IN ('person', 'business', 'utility', 'government', 'other')),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    account_number_with_them VARCHAR(100),
    website VARCHAR(255),
    payment_portal_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'merged')),
    merged_into_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contacts_user ON contacts(user_id);
CREATE INDEX idx_contacts_name ON contacts(current_name);
CREATE INDEX idx_contacts_type ON contacts(contact_type);
CREATE INDEX idx_contacts_status ON contacts(status) WHERE status = 'active';

COMMENT ON TABLE contacts IS 'People and businesses for bill payments';

