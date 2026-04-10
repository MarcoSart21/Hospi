import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { useToast } from '../components/Toast'
import { api } from '../api'
import Modal from '../components/Modal'

const empty = { nombre: '', apellido: '', especialidad_id: '', telefono: '', email: '' }

export default function Doctores() {
  const { data, loading, create, update, remove } = useApi('/doctores')
  const [especialidades, setEspecialidades] = useState([])
  const notify = useToast()
  const [modal, setModal] = useState(null)
  const [form, setForm]   = useState(empty)

  useEffect(() => {
    api.get('/especialidades').then(setEspecialidades).catch(() => {})
  }, [])

  const open = (d = null) => {
    setForm(d ? { ...d, especialidad_id: d.especialidad_id || '' } : { ...empty })
    setModal(d || 'new')
  }

  const save = async () => {
    try {
      const body = { ...form, especialidad_id: form.especialidad_id || null }
      if (modal === 'new') {
        await create(body)
        notify('Doctor creado')
      } else {
        await update(modal.id, body)
        notify('Doctor actualizado')
      }
      setModal(null)
    } catch (e) { notify(e.message, 'error') }
  }

  const del = async (id) => {
    if (!confirm('¿Eliminar este doctor?')) return
    try { await remove(id); notify('Doctor eliminado') }
    catch (e) { notify(e.message, 'error') }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <>
      <div className="page-header">
        <h2>Doctores</h2>
        <button className="btn btn--primary" onClick={() => open()}>
          <Plus size={16} /> Nuevo
        </button>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : !data.length ? (
        <div className="empty">No hay doctores registrados.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th><th>Especialidad</th><th>Teléfono</th><th>Email</th><th></th>
              </tr>
            </thead>
            <tbody>
              {data.map(d => (
                <tr key={d.id}>
                  <td>{d.nombre} {d.apellido}</td>
                  <td>{d.especialidad || '—'}</td>
                  <td>{d.telefono || '—'}</td>
                  <td>{d.email || '—'}</td>
                  <td>
                    <div className="btn-group">
                      <button className="btn--icon" onClick={() => open(d)}><Pencil size={15} /></button>
                      <button className="btn--icon" onClick={() => del(d.id)}><Trash2 size={15} /></button>
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
          title={modal === 'new' ? 'Nuevo Doctor' : 'Editar Doctor'}
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="btn btn--secondary" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn btn--primary" onClick={save}>Guardar</button>
            </>
          }
        >
          <div className="form-row">
            <div className="form-group">
              <label>Nombre</label>
              <input value={form.nombre} onChange={e => set('nombre', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Apellido</label>
              <input value={form.apellido} onChange={e => set('apellido', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Especialidad</label>
            <select value={form.especialidad_id} onChange={e => set('especialidad_id', e.target.value)}>
              <option value="">— Seleccionar —</option>
              {especialidades.map(esp => (
                <option key={esp.id} value={esp.id}>{esp.nombre}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Teléfono</label>
              <input value={form.telefono} onChange={e => set('telefono', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
