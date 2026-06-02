import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ordersApi } from '../api/orders'
import { usePaginated } from '../hooks/useApi'
import { LoadingCenter, EmptyState, ConfirmDialog, Pagination } from '../components/UI'
import OrderForm from '../components/OrderForm'

export default function Orders() {
  const { items, total, totalPages, page, perPage, loading, error, setPage, refresh } =
    usePaginated((p) => ordersApi.getAll(p), { per_page: 20 })

  const [showCreate, setShowCreate] = useState(false)
  const [deleteOrder, setDeleteOrder] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fmtMoney = (n) => Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  const handleCreate = async (data) => {
    try {
      await ordersApi.create(data)
      toast.success('Order placed successfully')
      setShowCreate(false)
      refresh()
    } catch (err) {
      toast.error(err.message)
      throw err
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await ordersApi.delete(deleteOrder.id)
      toast.success('Order cancelled')
      setDeleteOrder(null)
      refresh()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Orders</span>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Order</button>
        </div>

        {loading ? <LoadingCenter /> : error ? (
          <div style={{ padding: 24, color: 'var(--red)' }}>Error: {error}</div>
        ) : items.length === 0 ? (
          <EmptyState icon="◈" title="No orders yet" description="Create your first order to get started." />
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <span className="mono text-accent">#{String(o.id).padStart(5, '0')}</span>
                      </td>
                      <td className="fw-600">{o.customer_name || `Customer #${o.customer_id}`}</td>
                      <td className="text-muted">{o.items.length} item{o.items.length !== 1 ? 's' : ''}</td>
                      <td className="fw-600">{fmtMoney(o.total_amount)}</td>
                      <td className="text-muted text-sm">{new Date(o.created_at).toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Link to={`/orders/${o.id}`} className="btn btn-ghost btn-sm">View</Link>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteOrder(o)}>Cancel</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} total={total} perPage={perPage} onPage={setPage} />
          </>
        )}
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Create New Order</span>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowCreate(false)}>✕</button>
            </div>
            <OrderForm onSubmit={handleCreate} onClose={() => setShowCreate(false)} />
          </div>
        </div>
      )}

      {deleteOrder && (
        <ConfirmDialog
          title="Cancel Order"
          message={`Cancel order #${String(deleteOrder.id).padStart(5, '0')}? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteOrder(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
