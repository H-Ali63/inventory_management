import { useState, useEffect } from 'react'
import { customersApi } from '../api/customers'
import { productsApi } from '../api/products'
import { Spinner } from './UI'

export default function OrderForm({ onSubmit, onClose }) {
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [loadingData, setLoadingData] = useState(true)

  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([
      customersApi.getAll({ per_page: 100 }),
      productsApi.getAll({ per_page: 100, in_stock_only: true }),
    ]).then(([c, p]) => {
      setCustomers(c.data.items)
      setProducts(p.data.items)
    }).finally(() => setLoadingData(false))
  }, [])

  const addItem = () => setItems(prev => [...prev, { product_id: '', quantity: 1 }])
  const removeItem = (i) => setItems(prev => prev.filter((_, idx) => idx !== i))
  const updateItem = (i, key, value) => {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [key]: value } : item))
    if (errors[`item_${i}`]) setErrors(e => ({ ...e, [`item_${i}`]: null }))
  }

  const getProduct = (id) => products.find(p => p.id === Number(id))

  const total = items.reduce((sum, item) => {
    const p = getProduct(item.product_id)
    return sum + (p ? p.price * (parseInt(item.quantity) || 0) : 0)
  }, 0)

  const validate = () => {
    const e = {}
    if (!customerId) e.customer_id = 'Please select a customer'
    items.forEach((item, i) => {
      if (!item.product_id) e[`item_${i}`] = 'Select a product'
      else if (!item.quantity || parseInt(item.quantity) <= 0) e[`item_${i}`] = 'Quantity must be ≥ 1'
    })
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    try {
      await onSubmit({
        customer_id: Number(customerId),
        items: items.map(item => ({
          product_id: Number(item.product_id),
          quantity: parseInt(item.quantity),
        })),
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingData) return (
    <div className="modal-body" style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
      <Spinner size={28} />
    </div>
  )

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label">Customer *</label>
          <select
            className="form-control"
            value={customerId}
            onChange={e => { setCustomerId(e.target.value); if (errors.customer_id) setErrors(er => ({ ...er, customer_id: null })) }}
          >
            <option value="">Select a customer…</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
            ))}
          </select>
          {errors.customer_id && <div className="form-error">{errors.customer_id}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Order Items *</label>
          {items.map((item, i) => {
            const prod = getProduct(item.product_id)
            return (
              <div key={i} className="order-item-row">
                <select
                  className="form-control"
                  value={item.product_id}
                  onChange={e => updateItem(i, 'product_id', e.target.value)}
                >
                  <option value="">Select product…</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ${Number(p.price).toFixed(2)} (stock: {p.stock_quantity})
                    </option>
                  ))}
                </select>
                <input
                  className="form-control"
                  type="number"
                  min="1"
                  max={prod ? prod.stock_quantity : undefined}
                  value={item.quantity}
                  onChange={e => updateItem(i, 'quantity', e.target.value)}
                  placeholder="Qty"
                />
                <div style={{ fontSize: 13, color: 'var(--text-2)', textAlign: 'right' }}>
                  {prod ? `$${(prod.price * (parseInt(item.quantity) || 0)).toFixed(2)}` : '—'}
                </div>
                <button
                  type="button"
                  className="btn btn-icon btn-ghost"
                  onClick={() => removeItem(i)}
                  disabled={items.length === 1}
                  title="Remove item"
                >✕</button>
                {errors[`item_${i}`] && (
                  <div className="form-error" style={{ gridColumn: '1 / -1', marginTop: -6 }}>
                    {errors[`item_${i}`]}
                  </div>
                )}
              </div>
            )
          })}
          <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={addItem}>
            + Add Item
          </button>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10 }}>
          <span className="text-muted text-sm">Order Total:</span>
          <span style={{ fontSize: 18, fontWeight: 700 }}>${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? <Spinner size={14} /> : null}
          Place Order
        </button>
      </div>
    </form>
  )
}
