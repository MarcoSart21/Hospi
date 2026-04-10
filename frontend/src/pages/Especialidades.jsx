import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { useToast } from '../components/Toast'
import Modal from '../components/Modal'

const empty = { nombre: '', descripcion: '' }

export default function Especialidades() {
  const { data, loading, create, update, remove } = useApi('/especialidades')
  const notify = useToast()
  const [modal, setModal] = useState(null)
  const [form, setForm]   = useState(empty)

  const open = (e = null) => {
    setForm(e ? { ...e } : { ...empty })
    setModal(e || 'new')
  }

  const save = async () => {
    try {
      if (modal === 'new') {
        await create(form)
        notify('Especialidad creada')
      } else {
        await update(modal.id, form)
        notify('Especialidad actualizada')
      }
      setModal(null)
    } catch (e) { notify(e.message, 'error') }
  }

  const del = async (id) => {
    if (!confirm('¿Eliminar esta especialidad?')) return
    try { await remove(id); notify('Especialidad eliminada') }
    catch (e) { notify(e.message, 'error') }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <>
      <div className="page-header">
        <h2>Especialidades</h2>
        <button className="btn btn--primary" onClick={() => open()}>
          <Plus size={16} /> Nueva
        </button>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : !data.length ? (
        <div className="empty">No hay especialidades registradas.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Nombre</th><th>Descripción</th><th></th></tr>
            </thead>
            <tbody>
              {data.map(e => (
                <tr key={e.id}>
                  <td>{e.nombre}</td>
                  <td>{e.descripcion || '—'}</td>
                  <td>
                    <div className="btn-group">
                      <button className="btn--icon" onClick={() => open(e)}><Pencil size={15} /></button>
                      <button className="btn--icon" onClick={() => del(e.id)}><Trash2 size={15} /></button>
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
          title={modal === 'new' ? 'Nueva Especialidad' : 'Editar Especialidad'}
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="btn btn--secondary" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn btn--primary" onClick={save}>Guardar</button>
            </>
          }
        >
          <div className="form-group">
            <label>Nombre</label>
            <input value={form.nombre} onChange={e => set('nombre', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea rows={3} value={form.descripcion} onChange={e => set('descripcion', e.target.value)} />
          </div>
        </Modal>
      )}
    </>
  )
}
