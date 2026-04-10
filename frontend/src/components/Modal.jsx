import { X } from 'lucide-react'

export default function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h3>{title}</h3>
          <button className="btn--icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>
  )
}
