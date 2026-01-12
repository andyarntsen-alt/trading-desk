-- =====================================================
-- Trading Desk Database Schema
-- Run this in Supabase SQL Editor
-- =====================================================

-- Users (linked to Supabase Auth - id matches auth.uid())
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  trader_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trading Accounts
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'default',
  starting_balance DECIMAL(15,2) DEFAULT 0,
  current_balance DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);

-- Trades/Journal
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  symbol TEXT NOT NULL,
  direction TEXT CHECK (direction IN ('long', 'short')),
  entry_price DECIMAL(15,8),
  exit_price DECIMAL(15,8),
  quantity DECIMAL(15,8),
  pnl DECIMAL(15,2),
  fees DECIMAL(15,2) DEFAULT 0,
  notes TEXT,
  tags TEXT[],
  screenshot_url TEXT,
  trade_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for trades
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_trade_date ON trades(trade_date);
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);

-- Playbook Setups
CREATE TABLE IF NOT EXISTS playbook_setups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  rules TEXT[],
  screenshot_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_playbook_user_id ON playbook_setups(user_id);

-- Daily Archives (prep, checklist, review)
CREATE TABLE IF NOT EXISTS daily_archives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  archive_date DATE NOT NULL,
  prep_data JSONB,
  checklist_data JSONB,
  review_data JSONB,
  screenshots JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, archive_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_archives_user_date ON daily_archives(user_id, archive_date);

-- User Settings
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  theme JSONB DEFAULT '{"accent": "emerald", "mode": "dark"}',
  goals JSONB,
  daily_loss_limit JSONB,
  tilt_settings JSONB,
  widget_settings JSONB,
  prep_config JSONB,
  checklist_config JSONB
);

-- Symbols/Watchlist
CREATE TABLE IF NOT EXISTS symbols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_symbols_user_id ON symbols(user_id);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_archives ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE symbols ENABLE ROW LEVEL SECURITY;

-- Users policies (auth.uid() = users.id directly)
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (id = auth.uid());

-- Accounts policies
CREATE POLICY "Users can manage own accounts" ON accounts
  FOR ALL USING (user_id = auth.uid());

-- Trades policies
CREATE POLICY "Users can manage own trades" ON trades
  FOR ALL USING (user_id = auth.uid());

-- Playbook policies
CREATE POLICY "Users can manage own playbook" ON playbook_setups
  FOR ALL USING (user_id = auth.uid());

-- Daily archives policies
CREATE POLICY "Users can manage own archives" ON daily_archives
  FOR ALL USING (user_id = auth.uid());

-- User settings policies
CREATE POLICY "Users can manage own settings" ON user_settings
  FOR ALL USING (user_id = auth.uid());

-- Symbols policies
CREATE POLICY "Users can manage own symbols" ON symbols
  FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- Trigger to auto-create user profile on signup
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
