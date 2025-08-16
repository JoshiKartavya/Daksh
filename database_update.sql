-- Update the trivia_results table to support the new scoring system
-- This script adds new columns for tracking correct and wrong answers

-- Add new columns to the trivia_results table
ALTER TABLE trivia_results 
ADD COLUMN IF NOT EXISTS correct_answers INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS wrong_answers INTEGER DEFAULT 0;

-- Update existing records to calculate correct_answers and wrong_answers
-- This assumes the existing score column represents the number of correct answers
UPDATE trivia_results 
SET 
  correct_answers = score,
  wrong_answers = total_questions - score
WHERE correct_answers IS NULL OR wrong_answers IS NULL;

-- Create an index on the score column for better leaderboard performance
CREATE INDEX IF NOT EXISTS idx_trivia_results_score ON trivia_results(score DESC);

-- Create an index on user_id for user-specific queries
CREATE INDEX IF NOT EXISTS idx_trivia_results_user_id ON trivia_results(user_id);

-- Create an index on played_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_trivia_results_played_at ON trivia_results(played_at DESC);
