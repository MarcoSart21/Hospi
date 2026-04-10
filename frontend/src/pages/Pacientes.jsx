import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { useToast } from '../components/Toast'
import Modal from '../components/Modal'

const empty = { nombre: '', apellido: '', fecha_nacimiento: '', telefono: '', email: '', direccion: '' }

export default function Pacientes() {
  const { data, loading, create, update, remove } = useApi('/pacientes')
  const notify = useToast()
  const [modal, setModal] = useState(null) // null | 'new' | paciente obj
  const [form, setForm]   = useState(empty)

  const open = (p = null) => {
    setForm(p ? { ...p } : { ...empty })
    setModal(p || 'new')
  }

  const save = async () => {
    try {
      if (modal === 'new') {
        await create(form)
        notify('Paciente creado')
      } else {
        await update(modal.id, form)
        notify('Paciente actualizado')
      }
      setModal(null)
    } catch (e) { notify(e.message, 'error') }
  }

  const del = async (id) => {
    if (!confirm('¿Eliminar este paciente?')) return
    try { await remove(id); notify('Paciente eliminado') }
    catch (e) { notify(e.message, 'error') }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <>
      <div className="page-header">
        <h2>Pacientes</h2>
        <button className="btn btn--primary" onClick={() => open()}>
          <Plus size={16} /> Nuevo
        </button>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : !data.length ? (
        <div className="empty">No hay pacientes registrados.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th><th>Teléfono</th><th>Email</th><th>Fecha Nac.</th><th></th>
              </tr>
            </thead>
            <tbody>
              {data.map(p => (
                <tr key={p.id}>
                  <td>{p.nombre} {p.apellido}</td>
                  <td>{p.telefono || '—'}</td>
                  <td>{p.email || '—'}</td>
                  <td>{p.fecha_nacimiento ? String(p.fecha_nacimiento).slice(0,10) : '—'}</td>
                  <td>
                    <div className="btn-group">
                      <button className="btn--icon" onClick={() => open(p)}><Pencil size={15} /></button>
                      <button className="btn--icon" onClick={() => del(p.id)}><Trash2 size={15} /></button>
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
          title={modal === 'new' ? 'Nuevo Paciente' : 'Editar Paciente'}
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
          <div className="form-row">
            <div className="form-group">
              <label>Fecha de nacimiento</label>
              <input type="date" value={form.fecha_nacimiento || ''} onChange={e => set('fecha_nacimiento', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Dirección</label>
            <input value={form.direccion} onChange={e => set('direccion', e.target.value)} />
          </div>
        </Modal>
      )}
    </>
  )
}
