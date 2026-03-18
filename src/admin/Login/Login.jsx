// ============================================================
// TRC Ministries — Admin Login
// admin/Login/Login.jsx
// ============================================================

import { useState }          from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth }              from '../../services/firebase'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/admin/dashboard')
    } catch (err) {
      setError('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__deco login-page__deco--1" aria-hidden="true" />
      <div className="login-page__deco login-page__deco--2" aria-hidden="true" />

      <div className="login-page__box">
        <div className="login-page__logo">
          <div className="login-page__logo-mark" aria-hidden="true">
            <span className="login-page__logo-cross" />
          </div>
          <div>
            <p className="login-page__logo-name">TRC Ministries</p>
            <p className="login-page__logo-sub">Admin portal</p>
          </div>
        </div>

        <h1 className="login-page__title">Welcome back</h1>
        <p className="login-page__sub">Sign in to access the admin dashboard</p>

        <form className="login-page__form" onSubmit={handleSubmit}>
          <div className="login-page__field">
            <label className="login-page__label" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className="login-page__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@trcministries.org"
              required
              autoComplete="email"
            />
          </div>

          <div className="login-page__field">
            <label className="login-page__label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="login-page__input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="login-page__error" role="alert">{error}</p>
          )}

          <button
            type="submit"
            className="login-page__btn"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in to dashboard'}
          </button>
        </form>

        <p className="login-page__note">
          Access is restricted to authorised staff only.
        </p>

        <div className="login-page__roles">
          <strong>Access levels:</strong> Super Admin (Senior Pastor) · Staff Admin (Dedicated staff). Accounts managed by Super Admin.
        </div>

        <Link to="/" className="login-page__back">← Back to website</Link>
      </div>
    </div>
  )
}

export default Login
