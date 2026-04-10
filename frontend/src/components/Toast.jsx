import { createContext, useContext, useState, useCallback } from 'react'

const Ctx = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const notify = useCallback((msg, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000)
  }, [])

  return (
    <Ctx.Provider value={notify}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast--${t.type}`}>{t.msg}</div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export const useToast = () => useContext(Ctx)
