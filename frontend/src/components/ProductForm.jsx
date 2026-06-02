import { useState } from 'react'
import { Spinner } from './UI'

const EMPTY = { name: '', sku: '', price: '', stock_quantity: '' }

export default function ProductForm({ initial, onSubmit, onClose }) {
  const [form, setForm] = useState(initial ? {
    name: initial.name,
    sku: initial.sku,
    price: String(initial.price),
    stock_quantity: String(initial.stock_quantity),
  } : EMPTY)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => ({ ...e, [k]: null }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.sku.trim()) e.sku = 'SKU is required'
    const price = parseFloat(form.price)
    if (isNaN(price) || price <= 0) e.price = 'Price must be greater than 0'
    const qty = parseInt(form.stock_quantity)
    if (isNaN(qty) || qty < 0) e.stock_quantity = 'Stock quantity cannot be negative'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    try {
      await onSubmit({
        name: form.name.trim(),
        sku: form.sku.trim().toUpperCase(),
        price: parseFloat(form.price),
        stock_quantity: parseInt(form.stock_quantity),
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label">Product Name *</label>
          <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Wireless Mouse" />
          {errors.name && <div className="form-error">{errors.name}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">SKU *</label>
          <input className="form-control" value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="e.g. WMOUSE-001" style={{ fontFamily: 'var(--mono)' }} />
          {errors.sku && <div className="form-error">{errors.sku}</div>}
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Price ($) *</label>
            <input className="form-control" type="number" step="0.01" min="0.01" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" />
            {errors.price && <div className="form-error">{errors.price}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Stock Quantity *</label>
            <input className="form-control" type="number" min="0" value={form.stock_quantity} onChange={e => set('stock_quantity', e.target.value)} placeholder="0" />
            {errors.stock_quantity && <div className="form-error">{errors.stock_quantity}</div>}
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? <Spinner size={14} /> : null}
          {initial ? 'Save Changes' : 'Add Product'}
        </button>
      </div>
    </form>
  )
}
