import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { useToast } from '../components/Toast'
import { api } from '../api'
import Modal from '../components/Modal'

const empty = { paciente_id: '', doctor_id: '', fecha: '', hora: '', motivo: '', estado: 'pendiente' }

export default function Citas() {
  const { data, loading, create, update, remove } = useApi('/citas')
  const [pacientes, setPacientes] = useState([])
  const [doctores, setDoctores]   = useState([])
  const notify = useToast()
  const [modal, setModal] = useState(null)
  const [form, setForm]   = useState(empty)

  useEffect(() => {
    api.get('/pacientes').then(setPacientes).catch(() => {})
    api.get('/doctores').then(setDoctores).catch(() => {})
  }, [])

  const open = (c = null) => {
    setForm(c ? {
      ...c,
      fecha: c.fecha ? String(c.fecha).slice(0,10) : '',
      hora: c.hora || '',
    } : { ...empty })
    setModal(c || 'new')
  }

  const save = async () => {
    try {
      if (modal === 'new') {
        await create(form)
        notify('Cita creada')
      } else {
        await update(modal.id, form)
        notify('Cita actualizada')
      }
      setModal(null)
    } catch (e) { notify(e.message, 'error') }
  }

  const del = async (id) => {
    if (!confirm('¿Eliminar esta cita?')) return
    try { await remove(id); notify('Cita eliminada') }
    catch (e) { notify(e.message, 'error') }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <>
      <div className="page-header">
        <h2>Citas</h2>
        <button className="btn btn--primary" onClick={() => open()}>
          <Plus size={16} /> Nueva
        </button>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : !data.length ? (
        <div className="empty">No hay citas registradas.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Paciente</th><th>Doctor</th><th>Fecha</th><th>Hora</th><th>Estado</th><th></th>
              </tr>
            </thead>
            <tbody>
              {data.map(c => (
                <tr key={c.id}>
                  <td>{c.paciente}</td>
                  <td>{c.doctor}</td>
                  <td>{c.fecha ? String(c.fecha).slice(0,10) : '—'}</td>
                  <td>{c.hora ? String(c.hora).slice(0,5) : '—'}</td>
                  <td><span className={`badge badge--${c.estado}`}>{c.estado}</span></td>
                  <td>
                    <div className="btn-group">
                      <button className="btn--icon" onClick={() => open(c)}><Pencil size={15} /></button>
                      <button className="btn--icon" onClick={() => del(c.id)}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal
          title={modal === 'new' ? 'Nueva Cita' : 'Editar Cita'}
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="btn btn--secondary" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn btn--primary" onClick={save}>Guardar</button>
            </>
          }
        >
          <div className="form-group">
            <label>Paciente</label>
            <select value={form.paciente_id} onChange={e => set('paciente_id', e.target.value)}>
              <option value="">— Seleccionar —</option>
              {pacientes.map(p => (
                <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Doctor</label>
            <select value={form.doctor_id} onChange={e => set('doctor_id', e.target.value)}>
              <option value="">— Seleccionar —</option>
              {doctores.map(d => (
                <option key={d.id} value={d.id}>{d.nombre} {d.apellido}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Fecha</label>
              <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Hora</label>
              <input type="time" value={form.hora} onChange={e => set('hora', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Motivo</label>
            <textarea rows={2} value={form.motivo} onChange={e => set('motivo', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Estado</label>
            <select value={form.estado} onChange={e => set('estado', e.target.value)}>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </Modal>
      )}
    </>
  )
}
