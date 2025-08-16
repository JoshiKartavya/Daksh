// Imports
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home, Account, Trivia, Leaderboard } from './pages/indexPages'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Navbar from './components/Navbar'
import ProtectedRoute from './routes/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-white text-black">
          <Navbar />
          <main className="max-w-5xl mx-auto px-4 py-6">
            <Routes>
              <Route element={<ProtectedRoute />}> 
                <Route path="/" element={<Home />} />
                <Route path="/trivia" element={<Trivia />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route element={<ProtectedRoute />}> 
                <Route path="/account" element={<Account />} />
              </Route>
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
