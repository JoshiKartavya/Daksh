// Imports
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom'

type UserStats = {
  totalPlayed: number
  bestScore: number
  averageScore: number
  totalCorrect: number
  totalWrong: number
}

const Home = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<UserStats>({
    totalPlayed: 0,
    bestScore: 0,
    averageScore: 0,
    totalCorrect: 0,
    totalWrong: 0
  })

  useEffect(() => {
    const load = async () => {
      if (!user) return
      
      // Get user's trivia results
      const { data, error } = await supabase
        .from('trivia_results')
        .select('*')
        .eq('user_id', user.id)
        .order('played_at', { ascending: false })
      
      if (error) {
        console.error('Error loading user stats:', error)
        return
      }

      if (data && data.length > 0) {
        const totalPlayed = data.length
        const bestScore = Math.max(...data.map(r => r.score))
        const averageScore = Math.round(data.reduce((sum, r) => sum + r.score, 0) / totalPlayed)
        const totalCorrect = data.reduce((sum, r) => sum + (r.correct_answers || 0), 0)
        const totalWrong = data.reduce((sum, r) => sum + (r.wrong_answers || 0), 0)

        setStats({
          totalPlayed,
          bestScore,
          averageScore,
          totalCorrect,
          totalWrong
        })
      }
    }
    load()
  }, [user])
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-black">{user ? `Welcome, ${user.email ?? 'User'}!` : 'Welcome!'}</h1>
      
      {user && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded border border-gray-200 p-4 bg-white">
            <h3 className="font-semibold text-gray-800 mb-2">Games Played</h3>
            <p className="text-2xl font-bold text-[#808000]">{stats.totalPlayed}</p>
          </div>
          <div className="rounded border border-gray-200 p-4 bg-white">
            <h3 className="font-semibold text-gray-800 mb-2">Best Score</h3>
            <p className="text-2xl font-bold text-green-600">{stats.bestScore > 0 ? `+${stats.bestScore}` : stats.bestScore}</p>
          </div>
          <div className="rounded border border-gray-200 p-4 bg-white">
            <h3 className="font-semibold text-gray-800 mb-2">Average Score</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.averageScore > 0 ? `+${stats.averageScore}` : stats.averageScore}</p>
          </div>
          <div className="rounded border border-gray-200 p-4 bg-white">
            <h3 className="font-semibold text-gray-800 mb-2">Total Correct</h3>
            <p className="text-2xl font-bold text-green-600">{stats.totalCorrect}</p>
          </div>
          <div className="rounded border border-gray-200 p-4 bg-white">
            <h3 className="font-semibold text-gray-800 mb-2">Total Wrong</h3>
            <p className="text-2xl font-bold text-red-600">{stats.totalWrong}</p>
          </div>
          <div className="rounded border border-gray-200 p-4 bg-white">
            <h3 className="font-semibold text-gray-800 mb-2">Accuracy</h3>
            <p className="text-2xl font-bold text-purple-600">
              {stats.totalCorrect + stats.totalWrong > 0 
                ? `${Math.round((stats.totalCorrect / (stats.totalCorrect + stats.totalWrong)) * 100)}%`
                : '0%'
              }
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <Link
          to="/trivia"
          className="px-6 py-3 bg-[#808000] text-white rounded-lg hover:opacity-90 transition font-semibold"
        >
          Play Trivia
        </Link>
        <Link
          to="/leaderboard"
          className="px-6 py-3 border border-[#808000] text-[#808000] rounded-lg hover:bg-[#808000] hover:text-white transition font-semibold"
        >
          View Leaderboard
        </Link>
      </div>

      {!user && (
        <p className="text-gray-700">Please login or sign up to personalize your dashboard and play trivia games.</p>
      )}
    </div>
  )
}

export default Home
