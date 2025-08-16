import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

type LeaderboardEntry = {
  id: string
  user_id: string
  score: number
  total_questions: number
  correct_answers: number
  wrong_answers: number
  played_at: string
  user_email: string // This will actually contain the display name
}

type UserBestScore = {
  user_id: string
  id: string
  score: number
  total_questions: number
  correct_answers: number
  wrong_answers: number
  played_at: string
}

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [userRank, setUserRank] = useState<number | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      try {
        // 1. Fetch all results, but only keep the best (highest score) per user
        //    (If tie, keep the most recent one)
        const { data: allResults, error } = await supabase
          .from('trivia_results')
          .select('*')
          .order('score', { ascending: false })
          .order('played_at', { ascending: false })

        if (error) {
          console.error('Error fetching leaderboard:', error)
          setLeaderboard([])
          return
        }

        // 2. Reduce to best score per user
        const bestByUser = new Map<string, UserBestScore>()
        for (const entry of allResults || []) {
          if (!bestByUser.has(entry.user_id)) {
            bestByUser.set(entry.user_id, entry)
          }
        }
        // 3. Convert to array and sort by score descending, then by played_at descending
        const bestScores = Array.from(bestByUser.values())
          .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score
            return new Date(b.played_at).getTime() - new Date(a.played_at).getTime()
          })
          .slice(0, 50) // Limit to top 50

        // 4. Fetch user emails for all users in the leaderboard
        const uniqueUserIds = bestScores.map(entry => entry.user_id)
        let userEmailMap = new Map<string, string>()
        if (uniqueUserIds.length > 0) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, email')
            .in('id', uniqueUserIds)
          if (userError) {
            console.error('Error fetching user data:', userError)
          }
          userData?.forEach(u => {
            userEmailMap.set(u.id, u.email)
          })
        }

        // 5. Transform data to include user names
        const transformedData: LeaderboardEntry[] = bestScores.map(entry => {
          const userEmail = userEmailMap.get(entry.user_id) || 'Unknown User'
          const displayName = entry.user_id === user?.id ? 'You' : userEmail.split('@')[0]
          return {
            ...entry,
            user_email: displayName
          }
        })

        setLeaderboard(transformedData)

        // 6. Find user's rank
        if (user) {
          const rank = transformedData.findIndex(entry => entry.user_id === user.id)
          setUserRank(rank !== -1 ? rank + 1 : null)
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
        setLeaderboard([])
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [user])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#808000] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dental Field Leaderboard</h1>
        <Link
          to="/trivia"
          className="px-4 py-2 bg-[#808000] text-white rounded hover:opacity-90 transition"
        >
          Play Again
        </Link>
      </div>

      {/* Leaderboard summary */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Dental Field Summary</h2>
        <p className="text-gray-700">
          Total game entries: <span className="font-bold text-blue-600">{leaderboard.length}</span> | 
          Active dental students: <span className="font-bold text-blue-600">{leaderboard.length}</span>
        </p>
      </div>

      {/* User's current rank */}
      {userRank && (
        <div className="bg-gradient-to-r from-[#FFC0CB] to-[#FFE4E1] p-4 rounded-lg border border-[#FFC0CB]">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Your Ranking</h2>
          <p className="text-gray-700">
            You are currently ranked <span className="font-bold text-[#808000]">#{userRank}</span> on the leaderboard!
          </p>
        </div>
      )}

      {/* Leaderboard table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Player
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Correct
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wrong
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaderboard.map((entry, index) => (
                <tr 
                  key={entry.id} 
                  className={`hover:bg-gray-50 ${
                    entry.user_id === user?.id ? 'bg-[#FFC0CB]/10 border-l-4 border-[#808000]' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{getRankIcon(index + 1)}</span>
                      <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {entry.user_email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-bold ${
                      entry.score >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {entry.score > 0 ? '+' : ''}{entry.score}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof entry.correct_answers === 'number' && typeof entry.total_questions === 'number'
                      ? `${entry.correct_answers}/${entry.total_questions}`
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof entry.wrong_answers === 'number' ? entry.wrong_answers : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(entry.played_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No trivia results yet.</p>
          <Link
            to="/trivia"
            className="px-4 py-2 bg-[#808000] text-white rounded hover:opacity-90 transition"
          >
            Be the first to play!
          </Link>
        </div>
      )}

      {/* Scoring explanation */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Scoring System</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p><span className="font-semibold text-green-600">+100 points</span> for each correct answer</p>
          </div>
          <div>
            <p><span className="font-semibold text-red-600">-10 points</span> for each wrong answer</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Leaderboard
