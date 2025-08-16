import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const inputClass = 'w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#808000]'
const labelClass = 'block text-sm text-gray-800 mb-1'
const btnClass = 'w-full bg-[#808000] text-white rounded px-4 py-2 hover:opacity-90 transition'

const Login = () => {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email) return setError('Email is required')
    if (!password) return setError('Password is required')
    setSubmitting(true)
    const { error } = await signIn({ email, password })
    setSubmitting(false)
    if (error) return setError(error)
    navigate('/')
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded border border-gray-200">
      <h1 className="text-xl font-semibold mb-4 text-black">Login</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Email</label>
          <input type="email" className={inputClass} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Password</label>
          <input type="password" className={inputClass} placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={submitting} className={btnClass}>{submitting ? 'Please wait...' : 'Login'}</button>
      </form>
      <div className="mt-4 text-sm text-gray-800">
        <p>
          New here? <Link className="text-[#6B4C3B] underline" to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  )
}

export default Login


