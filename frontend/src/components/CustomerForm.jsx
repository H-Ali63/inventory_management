import { useState } from 'react'
import { Spinner } from './UI'

const EMPTY = { full_name: '', email: '', phone: '' }

export default function CustomerForm({ onSubmit, onClose }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => ({ ...e, [k]: null }))
  }

  const validate = () => {
    const e = {}
    if (!form.full_name.trim()) e.full_name = 'Full name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    try {
      await onSubmit({
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input className="form-control" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Jane Doe" />
          {errors.full_name && <div className="form-error">{errors.full_name}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Email Address *</label>
          <input className="form-control" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@example.com" />
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Phone</label>
          <input className="form-control" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 555-0100" />
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? <Spinner size={14} /> : null}
          Add Customer
        </button>
      </div>
    </form>
  )
}
