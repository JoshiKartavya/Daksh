import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const activeClass = 'border-b-2 border-[#808000]'

const Navbar = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <NavLink to="/" className={({ isActive }) => `text-black hover:opacity-80 ${isActive ? activeClass : ''}`}>Home</NavLink>
          <NavLink to="/trivia" className={({ isActive }) => `text-black hover:opacity-80 ${isActive ? activeClass : ''}`}>Trivia</NavLink>
          <NavLink to="/leaderboard" className={({ isActive }) => `text-black hover:opacity-80 ${isActive ? activeClass : ''}`}>Leaderboard</NavLink>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <NavLink to="/account" className={({ isActive }) => `text-black hover:opacity-80 ${isActive ? activeClass : ''}`}>Account</NavLink>
              <button onClick={handleLogout} className="px-3 py-1.5 rounded border border-[#808000] text-black hover:bg-[#808000] hover:text-white transition">Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => `text-black hover:opacity-80 ${isActive ? activeClass : ''}`}>Login</NavLink>
              <NavLink to="/signup" className={({ isActive }) => `text-black hover:opacity-80 ${isActive ? activeClass : ''}`}>Signup</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar


