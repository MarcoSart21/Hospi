import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import { ToastProvider } from './components/Toast'
import Dashboard from './pages/Dashboard'
import Pacientes from './pages/Pacientes'
import Doctores from './pages/Doctores'
import Citas from './pages/Citas'
import Especialidades from './pages/Especialidades'
import Login from './pages/Login'
import { auth } from './api'

/** Protege rutas: si no hay sesión, redirige a /login */
function PrivateRoute({ children }) {
  return auth.isAuthenticated() ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas — todas dentro del layout con Sidebar */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <div className="app-layout">
                  <Sidebar />
                  <main className="main">
                    <Routes>
                      <Route path="/"               element={<Dashboard />} />
                      <Route path="/pacientes"      element={<Pacientes />} />
                      <Route path="/doctores"       element={<Doctores />} />
                      <Route path="/citas"          element={<Citas />} />
                      <Route path="/especialidades" element={<Especialidades />} />
                    </Routes>
                  </main>
                </div>
              </PrivateRoute>
            }
          />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  )
}
