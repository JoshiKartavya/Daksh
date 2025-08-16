# Trivia Game Features

## Dynamic Question Generation
- **Fresh Questions Every Time**: Each time a user enters the trivia page, 10 random questions are selected from a pool of 25 dental questions
- **No Repetition**: Questions are shuffled and selected randomly to ensure variety
- **Large Question Pool**: 25 comprehensive dental questions covering various topics

## New Scoring System
- **Correct Answer**: +100 points
- **Wrong Answer**: -10 points
- **Example**: If a user gets 3 correct and 2 wrong answers:
  - Score = (3 × 100) + (2 × -10) = 300 - 20 = 280 points

## Enhanced Database Schema
The `trivia_results` table now includes:
- `correct_answers`: Number of correct answers
- `wrong_answers`: Number of wrong answers
- `score`: Total calculated score (can be negative)
- `total_questions`: Total number of questions in the quiz
- `user_id`: User who took the quiz
- `played_at`: Timestamp of when the quiz was taken

## Leaderboard Features
- **Real-time Rankings**: Shows top 50 players sorted by score
- **User Highlighting**: Current user's entries are highlighted
- **Detailed Statistics**: Shows correct/wrong answers for each attempt
- **Date Tracking**: Displays when each quiz was taken
- **Medal System**: Gold (🥇), Silver (🥈), Bronze (🥉) for top 3 positions

## Home Dashboard Enhancements
- **Personal Statistics**: Shows user's trivia performance
- **Key Metrics**:
  - Total games played
  - Best score achieved
  - Average score
  - Total correct answers
  - Total wrong answers
  - Overall accuracy percentage
- **Quick Actions**: Direct links to play trivia or view leaderboard

## Navigation Updates
- **Leaderboard Link**: Added to main navigation
- **Protected Routes**: Leaderboard requires authentication
- **Seamless Flow**: After completing trivia, users are redirected to leaderboard

## Database Optimization
- **Indexes**: Added for better query performance
- **Score Index**: Optimized for leaderboard sorting
- **User Index**: Fast user-specific queries
- **Time Index**: Efficient date-based filtering

## Usage Instructions
1. **Play Trivia**: Click "Play Trivia" to start a new game
2. **Answer Questions**: Select your answers (10 questions per game)
3. **View Results**: See your score breakdown after completion
4. **Check Leaderboard**: View your ranking and compare with others
5. **Track Progress**: Monitor your statistics on the home dashboard

## Technical Implementation
- **React Hooks**: Uses `useEffect` for dynamic question generation
- **State Management**: Local state for questions, answers, and scores
- **Supabase Integration**: Real-time database updates
- **Responsive Design**: Works on desktop and mobile devices
- **TypeScript**: Full type safety for all components
