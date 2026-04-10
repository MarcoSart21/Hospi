import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../api'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm]     = useState({ username: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await auth.login(form.username, form.password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">🏥</div>
          <h1 className="login-title">Clínica Médica</h1>
          <p className="login-subtitle">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              autoFocus
              value={form.username}
              onChange={handleChange}
              placeholder="Ingresa tu usuario"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>

          {error && <p className="login-error">⚠️ {error}</p>}

          <button
            type="submit"
            className="btn btn--primary login-btn"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="login-hint">
          Usuario por defecto: <strong>admin</strong> / <strong>admin123</strong>
        </p>
      </div>
    </div>
  )
}
