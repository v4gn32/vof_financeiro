/*
  # Create categories table

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `name` (text)
      - `type` (text, income or expense)
      - `color` (text, hex color)
      - `icon` (text, lucide icon name)
      - `is_default` (boolean, for system categories)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `categories` table
    - Add policies for users to manage their own categories
    - Allow reading default categories
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  color text NOT NULL DEFAULT '#6B7280',
  icon text NOT NULL DEFAULT 'Circle',
  is_default boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Users can read their own categories and default categories
CREATE POLICY "Users can read own categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_default = true);

-- Users can insert their own categories
CREATE POLICY "Users can insert own categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_default = false);

-- Users can update their own non-default categories
CREATE POLICY "Users can update own categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND is_default = false)
  WITH CHECK (auth.uid() = user_id AND is_default = false);

-- Users can delete their own non-default categories
CREATE POLICY "Users can delete own categories"
  ON categories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND is_default = false);

-- Insert default categories
INSERT INTO categories (name, type, color, icon, is_default) VALUES
  -- Income categories
  ('Salário', 'income', '#10B981', 'Briefcase', true),
  ('Freelance', 'income', '#06B6D4', 'Code', true),
  ('Investimentos', 'income', '#8B5CF6', 'TrendingUp', true),
  ('Outros', 'income', '#6B7280', 'Plus', true),
  
  -- Expense categories
  ('Alimentação', 'expense', '#F59E0B', 'UtensilsCrossed', true),
  ('Transporte', 'expense', '#EF4444', 'Car', true),
  ('Moradia', 'expense', '#8B5CF6', 'Home', true),
  ('Saúde', 'expense', '#EC4899', 'Heart', true),
  ('Educação', 'expense', '#3B82F6', 'GraduationCap', true),
  ('Lazer', 'expense', '#10B981', 'Gamepad2', true),
  ('Compras', 'expense', '#F97316', 'ShoppingBag', true),
  ('Outros', 'expense', '#6B7280', 'MoreHorizontal', true)
ON CONFLICT DO NOTHING;