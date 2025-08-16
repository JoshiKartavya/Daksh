-- Simple database update for trivia scoring system
-- Run this in your Supabase SQL Editor

-- Add new columns to the trivia_results table
ALTER TABLE trivia_results 
ADD COLUMN IF NOT EXISTS correct_answers INTEGER DEFAULT 0;

ALTER TABLE trivia_results 
ADD COLUMN IF NOT EXISTS wrong_answers INTEGER DEFAULT 0;

-- Update existing records (if any) to calculate correct_answers and wrong_answers
-- This assumes the existing score column represents the number of correct answers
UPDATE trivia_results 
SET 
  correct_answers = score,
  wrong_answers = total_questions - score
WHERE correct_answers IS NULL OR wrong_answers IS NULL;

-- Create an index for better leaderboard performance
CREATE INDEX IF NOT EXISTS idx_trivia_results_score ON trivia_results(score DESC);
