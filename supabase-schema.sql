-- Create payments table in Supabase
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  total_amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ALGO',
  participants INTEGER NOT NULL,
  receiver_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiry_date TIMESTAMP WITH TIME ZONE,
  collected NUMERIC DEFAULT 0,
  contributors JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active',
  tx_hash TEXT,
  contract_app_id INTEGER,
  contract_address TEXT,
  CONSTRAINT status_check CHECK (status IN ('active', 'completed'))
);

-- Enable Row Level Security (RLS)
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read payments
CREATE POLICY "Anyone can read payments" ON payments
  FOR SELECT USING (true);

-- Create a policy that allows anyone to insert payments
CREATE POLICY "Anyone can insert payments" ON payments
  FOR INSERT WITH CHECK (true);

-- Create a policy that allows anyone to update payments
CREATE POLICY "Anyone can update payments" ON payments
  FOR UPDATE USING (true);

-- Create an index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Create claim_links table for claim/redeem links
CREATE TABLE IF NOT EXISTS claim_links (
  id TEXT PRIMARY KEY,
  sender_address TEXT NOT NULL,
  receiver_address TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ALGO',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiry_date TIMESTAMP WITH TIME ZONE,
  claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  claimed_by TEXT,
  status TEXT DEFAULT 'active',
  tx_hash TEXT,
  claim_tx_hash TEXT,
  contract_app_id INTEGER,
  contract_address TEXT,
  CONSTRAINT claim_status_check CHECK (status IN ('active', 'claimed', 'expired', 'cancelled'))
);

-- Enable Row Level Security (RLS) for claim_links
ALTER TABLE claim_links ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read claim links
CREATE POLICY "Anyone can read claim links" ON claim_links
  FOR SELECT USING (true);

-- Create a policy that allows anyone to insert claim links
CREATE POLICY "Anyone can insert claim links" ON claim_links
  FOR INSERT WITH CHECK (true);

-- Create a policy that allows anyone to update claim links
CREATE POLICY "Anyone can update claim links" ON claim_links
  FOR UPDATE USING (true);

-- Create an index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_claim_links_status ON claim_links(status);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_claim_links_created_at ON claim_links(created_at);

-- Create an index on sender_address for filtering
CREATE INDEX IF NOT EXISTS idx_claim_links_sender ON claim_links(sender_address);

-- Create an index on claimed_by for filtering
CREATE INDEX IF NOT EXISTS idx_claim_links_claimed_by ON claim_links(claimed_by);

