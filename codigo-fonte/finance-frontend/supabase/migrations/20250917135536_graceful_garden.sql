/*
  # Create financial goals table

  1. New Tables
    - `goals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `category_id` (uuid, references categories, optional)
      - `title` (text)
      - `target_amount` (decimal)
      - `current_amount` (decimal, default 0)
      - `deadline` (date)
      - `is_completed` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `goals` table
    - Add policies for users to manage their own goals

  3. Functions
    - Function to automatically update completion status
*/

CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  target_amount decimal(12,2) NOT NULL CHECK (target_amount > 0),
  current_amount decimal(12,2) DEFAULT 0 NOT NULL CHECK (current_amount >= 0),
  deadline date NOT NULL,
  is_completed boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Users can manage their own goals
CREATE POLICY "Users can read own goals"
  ON goals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON goals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON goals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON goals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update goal completion status
CREATE OR REPLACE FUNCTION update_goal_completion()
RETURNS trigger AS $$
BEGIN
  NEW.is_completed = (NEW.current_amount >= NEW.target_amount);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update completion status when amounts change
CREATE TRIGGER update_goal_completion_trigger
  BEFORE INSERT OR UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_goal_completion();

-- Trigger to update updated_at on goal changes
CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_deadline ON goals(deadline);
CREATE INDEX IF NOT EXISTS idx_goals_is_completed ON goals(is_completed);