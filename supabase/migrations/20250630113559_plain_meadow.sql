/*
  # Initial Heritage Vault Database Schema

  1. New Tables
    - `users` - User profiles and account information
    - `assets` - User assets (financial, property, digital, etc.)
    - `contacts` - Beneficiaries and emergency contacts
    - `documents` - Important documents and files
    - `checkin_records` - 6-month check-in tracking
    - `bank_statements` - Bank statement NFT records
    - `inheritance_events` - Inheritance process tracking
    - `notification_rules` - Automated notification settings

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
    - Secure user isolation

  3. Indexes
    - Performance indexes for common queries
    - Foreign key indexes
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  date_of_birth date,
  address text,
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relationship text,
  security_question_1 text,
  security_answer_1 text,
  security_question_2 text,
  security_answer_2 text,
  two_factor_enabled boolean DEFAULT false,
  account_status text DEFAULT 'active' CHECK (account_status IN ('active', 'inactive', 'suspended')),
  subscription_plan text DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'forever')),
  profile_completed boolean DEFAULT false,
  privacy_preferences jsonb DEFAULT '{}',
  notification_preferences jsonb DEFAULT '{}',
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('financial', 'property', 'digital', 'personal', 'legal')),
  type text NOT NULL,
  value text,
  location text,
  instructions text,
  beneficiaries text[] DEFAULT '{}',
  account_info text,
  access_instructions text,
  required_documents text,
  voice_messages jsonb DEFAULT '[]',
  avatar_messages jsonb DEFAULT '[]',
  release_conditions jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  relationship text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text,
  is_primary_beneficiary boolean DEFAULT false,
  is_emergency_contact boolean DEFAULT false,
  is_professional boolean DEFAULT false,
  verification_method text DEFAULT 'email' CHECK (verification_method IN ('email', 'phone', 'legal', 'biometric')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('legal', 'financial', 'insurance', 'personal', 'medical')),
  type text NOT NULL,
  size text,
  location text,
  description text,
  access_level text DEFAULT 'conditional' CHECK (access_level IN ('immediate', 'conditional', 'restricted')),
  file_url text,
  file_hash text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Check-in records table
CREATE TABLE IF NOT EXISTS checkin_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  checkin_date timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('completed', 'missed', 'overdue')),
  next_checkin_due timestamptz NOT NULL,
  reminders_sent integer DEFAULT 0,
  max_reminders integer DEFAULT 4,
  grace_period_days integer DEFAULT 30,
  privacy_preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Bank statements table (for NFT tracking)
CREATE TABLE IF NOT EXISTS bank_statements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  bank_name text NOT NULL,
  account_number text NOT NULL,
  statement_date date NOT NULL,
  statement_period text,
  balance text,
  transaction_count integer DEFAULT 0,
  file_hash text UNIQUE NOT NULL,
  ipfs_hash text,
  nft_token_id integer,
  nft_contract_address text,
  blockchain_network text DEFAULT 'ethereum',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Inheritance events table
CREATE TABLE IF NOT EXISTS inheritance_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('asset_release', 'document_access', 'notification_sent', 'verification_required', 'knowledge_test_required')),
  asset_id uuid REFERENCES assets(id) ON DELETE SET NULL,
  document_id uuid REFERENCES documents(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  status text NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  triggered_date timestamptz NOT NULL,
  completed_date timestamptz,
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notification rules table
CREATE TABLE IF NOT EXISTS notification_rules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  trigger_type text NOT NULL CHECK (trigger_type IN ('immediate', 'time_based', 'condition_met', 'manual')),
  recipients text[] NOT NULL,
  message text NOT NULL,
  frequency text DEFAULT 'once' CHECK (frequency IN ('once', 'daily', 'weekly', 'monthly')),
  is_active boolean DEFAULT true,
  last_sent timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkin_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE inheritance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Assets policies
CREATE POLICY "Users can manage own assets"
  ON assets
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Contacts policies
CREATE POLICY "Users can manage own contacts"
  ON contacts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Documents policies
CREATE POLICY "Users can manage own documents"
  ON documents
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Check-in records policies
CREATE POLICY "Users can manage own checkin records"
  ON checkin_records
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Bank statements policies
CREATE POLICY "Users can manage own bank statements"
  ON bank_statements
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Inheritance events policies
CREATE POLICY "Users can manage own inheritance events"
  ON inheritance_events
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Notification rules policies
CREATE POLICY "Users can manage own notification rules"
  ON notification_rules
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_is_primary ON contacts(is_primary_beneficiary);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_checkin_records_user_id ON checkin_records(user_id);
CREATE INDEX IF NOT EXISTS idx_checkin_records_next_due ON checkin_records(next_checkin_due);
CREATE INDEX IF NOT EXISTS idx_bank_statements_user_id ON bank_statements(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_statements_file_hash ON bank_statements(file_hash);
CREATE INDEX IF NOT EXISTS idx_inheritance_events_user_id ON inheritance_events(user_id);
CREATE INDEX IF NOT EXISTS idx_inheritance_events_status ON inheritance_events(status);
CREATE INDEX IF NOT EXISTS idx_notification_rules_user_id ON notification_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_rules_active ON notification_rules(is_active);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_checkin_records_updated_at BEFORE UPDATE ON checkin_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bank_statements_updated_at BEFORE UPDATE ON bank_statements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inheritance_events_updated_at BEFORE UPDATE ON inheritance_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_rules_updated_at BEFORE UPDATE ON notification_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();