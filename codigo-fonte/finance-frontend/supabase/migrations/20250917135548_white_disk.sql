/*
  # Create monthly budgets table

  1. New Tables
    - `budgets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `category_id` (uuid, references categories)
      - `budget_amount` (decimal)
      - `spent_amount` (decimal, default 0)
      - `month` (integer, 1-12)
      - `year` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `budgets` table
    - Add policies for users to manage their own budgets

  3. Constraints
    - Unique constraint on user_id, category_id, month, year
*/

CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  budget_amount decimal(12,2) NOT NULL CHECK (budget_amount >= 0),
  spent_amount decimal(12,2) DEFAULT 0 NOT NULL CHECK (spent_amount >= 0),
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL CHECK (year >= 2020),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  UNIQUE(user_id, category_id, month, year)
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Users can manage their own budgets
CREATE POLICY "Users can read own budgets"
  ON budgets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets"
  ON budgets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
  ON budgets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
  ON budgets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update budget spent amount when transactions change
CREATE OR REPLACE FUNCTION update_budget_spent_amount()
RETURNS trigger AS $$
DECLARE
  budget_record budgets%ROWTYPE;
BEGIN
  -- Handle INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Only update for expense transactions
    IF NEW.type = 'expense' THEN
      -- Find the budget for this category and month/year
      SELECT * INTO budget_record
      FROM budgets
      WHERE user_id = NEW.user_id
        AND category_id = NEW.category_id
        AND month = EXTRACT(MONTH FROM NEW.date)
        AND year = EXTRACT(YEAR FROM NEW.date);
      
      IF FOUND THEN
        -- Recalculate spent amount for this budget
        UPDATE budgets
        SET spent_amount = (
          SELECT COALESCE(SUM(amount), 0)
          FROM transactions
          WHERE user_id = NEW.user_id
            AND category_id = NEW.category_id
            AND type = 'expense'
            AND EXTRACT(MONTH FROM date) = budget_record.month
            AND EXTRACT(YEAR FROM date) = budget_record.year
        )
        WHERE id = budget_record.id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;
  
  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    IF OLD.type = 'expense' THEN
      -- Find the budget for this category and month/year
      SELECT * INTO budget_record
      FROM budgets
      WHERE user_id = OLD.user_id
        AND category_id = OLD.category_id
        AND month = EXTRACT(MONTH FROM OLD.date)
        AND year = EXTRACT(YEAR FROM OLD.date);
      
      IF FOUND THEN
        -- Recalculate spent amount for this budget
        UPDATE budgets
        SET spent_amount = (
          SELECT COALESCE(SUM(amount), 0)
          FROM transactions
          WHERE user_id = OLD.user_id
            AND category_id = OLD.category_id
            AND type = 'expense'
            AND EXTRACT(MONTH FROM date) = budget_record.month
            AND EXTRACT(YEAR FROM date) = budget_record.year
        )
        WHERE id = budget_record.id;
      END IF;
    END IF;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update budget spent amounts when transactions change
CREATE TRIGGER update_budget_spent_trigger
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_budget_spent_amount();

-- Trigger to update updated_at on budget changes
CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_month_year ON budgets(month, year);
CREATE INDEX IF NOT EXISTS idx_budgets_category_id ON budgets(category_id);