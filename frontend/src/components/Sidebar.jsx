import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Stethoscope, CalendarDays, Heart, LogOut } from 'lucide-react'
import { auth } from '../api'

const links = [
  { to: '/',               icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pacientes',      icon: Users,           label: 'Pacientes' },
  { to: '/doctores',       icon: Stethoscope,     label: 'Doctores' },
  { to: '/citas',          icon: CalendarDays,    label: 'Citas' },
  { to: '/especialidades', icon: Heart,           label: 'Especialidades' },
]

export default function Sidebar() {
  const navigate  = useNavigate()
  const user      = auth.getUser()

  const handleLogout = () => {
    auth.logout()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <h1>Clínica</h1>
        <span>Sistema Médico</span>
      </div>

      <nav className="sidebar__nav">
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) =>
              `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
            }
          >
            <l.icon />
            {l.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer con usuario y botón de cerrar sesión */}
      <div className="sidebar__footer">
        {user && (
          <div className="sidebar__user">
            <div className="sidebar__avatar">
              {(user.nombre || user.username).charAt(0).toUpperCase()}
            </div>
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{user.nombre || user.username}</span>
              <span className="sidebar__user-rol">{user.rol}</span>
            </div>
          </div>
        )}
        <button className="sidebar__logout" onClick={handleLogout} title="Cerrar sesión">
          <LogOut size={16} />
          <span>Salir</span>
        </button>
      </div>
    </aside>
  )
}
