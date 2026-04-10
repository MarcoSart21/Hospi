import { useState, useEffect } from 'react'
import { api } from '../api'
import { Users, Stethoscope, CalendarDays, Clock } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/citas/stats').then(setStats).catch(() => {})
  }, [])

  const cards = stats ? [
    { label: 'Pacientes',        value: stats.pacientes,        icon: Users,        color: 'green' },
    { label: 'Doctores',         value: stats.doctores,         icon: Stethoscope,  color: 'blue' },
    { label: 'Citas pendientes', value: stats.citas_pendientes, icon: Clock,        color: 'yellow' },
    { label: 'Citas hoy',        value: stats.citas_hoy,        icon: CalendarDays, color: 'red' },
  ] : []

  return (
    <>
      <div className="page-header">
        <h2>Dashboard</h2>
      </div>

      {!stats ? (
        <div className="loader"><div className="spinner" /></div>
      ) : (
        <div className="stat-grid">
          {cards.map(c => (
            <div className="stat-card" key={c.label}>
              <div className={`stat-card__icon stat-card__icon--${c.color}`}>
                <c.icon size={20} />
              </div>
              <div>
                <div className="stat-card__value">{c.value}</div>
                <div className="stat-card__label">{c.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
