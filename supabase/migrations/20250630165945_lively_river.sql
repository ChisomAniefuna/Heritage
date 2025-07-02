/*
  # Add Stripe Customer ID to Users Table

  1. Changes
    - Add stripe_customer_id column to users table
    - This column will store the Stripe customer ID for each user
    - Used for subscription management and payment processing
*/

-- Add stripe_customer_id column to users table
ALTER TABLE IF EXISTS users
ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- Create index for faster lookups by stripe_customer_id
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);