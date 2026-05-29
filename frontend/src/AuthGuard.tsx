import * as React from 'react'
import { Outlet } from 'react-router-dom'
import { getMe } from './api'

interface User { id: string; phone: string }

const AuthContext = React.createContext<{ user: User | null; logout: () => void }>({ user: null, logout: () => {} })

export function useAuth() { return React.useContext(AuthContext) }

export default function AuthGuard() {
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)
  const token = localStorage.getItem('token')

  React.useEffect(() => {
    if (!token) {
      setUser({ id: 'local', phone: 'local' })
      setLoading(false)
      return
    }
    getMe()
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem('token')
        setUser({ id: 'local', phone: 'local' })
      })
      .finally(() => setLoading(false))
  }, [token])

  const logout = () => {
    localStorage.removeItem('token')
    setUser({ id: 'local', phone: 'local' })
    window.location.hash = '#/dashboard'
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div className="apple-skeleton" style={{ height: 24, width: 128 }} />
          <div className="apple-skeleton" style={{ height: 16, width: 96 }} />
        </div>
      </div>
    )
  }

  if (!user) return null

  return <AuthContext.Provider value={{ user, logout }}><Outlet /></AuthContext.Provider>
}
