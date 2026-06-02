import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ordersApi } from '../api/orders'
import { useApi } from '../hooks/useApi'
import { LoadingCenter, StockBadge } from '../components/UI'

export default function OrderDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: order, loading, error, fetch } = useApi(() => ordersApi.getById(id))

  useEffect(() => { fetch() }, [fetch])

  const fmtMoney = (n) => Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  const handleDelete = async () => {
    if (!confirm('Cancel this order? This cannot be undone.')) return
    try {
      await ordersApi.delete(id)
      toast.success('Order cancelled')
      navigate('/orders')
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (loading) return <LoadingCenter />
  if (error) return (
    <div style={{ padding: 24 }}>
      <div style={{ color: 'var(--red)', marginBottom: 16 }}>Error: {error}</div>
      <Link to="/orders" className="btn btn-ghost">← Back to Orders</Link>
    </div>
  )
  if (!order) return null

  const o = order

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link to="/orders" className="btn btn-ghost btn-sm">← Back</Link>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700 }}>
              Order <span className="mono text-accent">#{String(o.id).padStart(5, '0')}</span>
            </h1>
            <div className="text-muted text-sm" style={{ marginTop: 2 }}>
              {new Date(o.created_at).toLocaleString()}
            </div>
          </div>
        </div>
        <button className="btn btn-danger btn-sm" onClick={handleDelete}>Cancel Order</button>
      </div>

      {/* Customer info */}
      <div className="card mb-6">
        <div className="card-header">
          <span className="card-title">Customer</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 32 }}>
            <div>
              <div className="text-muted text-sm" style={{ marginBottom: 2 }}>Name</div>
              <div className="fw-600">{o.customer_name || `Customer #${o.customer_id}`}</div>
            </div>
            <div>
              <div className="text-muted text-sm" style={{ marginBottom: 2 }}>Customer ID</div>
              <div className="mono">{o.customer_id}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Order items */}
      <div className="card mb-6">
        <div className="card-header">
          <span className="card-title">Order Items</span>
          <span className="badge badge-blue">{o.items.length} item{o.items.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Unit Price</th>
                <th>Quantity</th>
                <th style={{ textAlign: 'right' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {o.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="fw-600">{item.product_name || `Product #${item.product_id}`}</div>
                    <div className="mono text-sm text-muted">ID: {item.product_id}</div>
                  </td>
                  <td>{fmtMoney(item.unit_price)}</td>
                  <td>
                    <span className="badge badge-blue">× {item.quantity}</span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    {fmtMoney(Number(item.unit_price) * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 16,
          padding: '16px 20px',
          borderTop: '1px solid var(--border)',
        }}>
          <span className="text-muted">Total Amount:</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>
            {fmtMoney(o.total_amount)}
          </span>
        </div>
      </div>
    </div>
  )
}
