/*
  # Create expense tracker database schema

  1. New Tables
    - `expenses`
      - `id` (bigint, primary key)
      - `user_id` (uuid, references auth.users)
      - `purpose` (text)
      - `amount` (decimal)
      - `category` (text)
      - `date` (date)
      - `description` (text, optional)
      - `created_at` (timestamp)
    
    - `bills`
      - `id` (bigint, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `amount` (decimal)
      - `due_date` (date)
      - `frequency` (text)
      - `category` (text)
      - `is_active` (boolean)
      - `last_paid` (date, optional)
      - `created_at` (timestamp)
    
    - `subscriptions`
      - `id` (bigint, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `amount` (decimal)
      - `billing_cycle` (text)
      - `next_payment` (date)
      - `category` (text)
      - `is_active` (boolean)
      - `description` (text, optional)
      - `color` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  purpose text NOT NULL,
  amount decimal(10,2) NOT NULL,
  category text NOT NULL,
  date date NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create bills table
CREATE TABLE IF NOT EXISTS bills (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  amount decimal(10,2) NOT NULL,
  due_date date NOT NULL,
  frequency text NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  category text NOT NULL,
  is_active boolean DEFAULT true,
  last_paid date,
  created_at timestamptz DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  amount decimal(10,2) NOT NULL,
  billing_cycle text NOT NULL CHECK (billing_cycle IN ('weekly', 'monthly', 'yearly')),
  next_payment date NOT NULL,
  category text NOT NULL,
  is_active boolean DEFAULT true,
  description text,
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for expenses
CREATE POLICY "Users can view own expenses"
  ON expenses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON expenses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON expenses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for bills
CREATE POLICY "Users can view own bills"
  ON bills
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bills"
  ON bills
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bills"
  ON bills
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bills"
  ON bills
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON subscriptions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS expenses_user_id_idx ON expenses(user_id);
CREATE INDEX IF NOT EXISTS expenses_date_idx ON expenses(date);
CREATE INDEX IF NOT EXISTS expenses_category_idx ON expenses(category);

CREATE INDEX IF NOT EXISTS bills_user_id_idx ON bills(user_id);
CREATE INDEX IF NOT EXISTS bills_due_date_idx ON bills(due_date);
CREATE INDEX IF NOT EXISTS bills_is_active_idx ON bills(is_active);

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_next_payment_idx ON subscriptions(next_payment);
CREATE INDEX IF NOT EXISTS subscriptions_is_active_idx ON subscriptions(is_active);