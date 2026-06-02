import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { customersApi } from '../api/customers'
import { usePaginated } from '../hooks/useApi'
import { LoadingCenter, EmptyState, ConfirmDialog, Pagination } from '../components/UI'
import CustomerForm from '../components/CustomerForm'

export default function Customers() {
  const { items, total, totalPages, page, perPage, loading, error, setPage, refresh, updateParams } =
    usePaginated((p) => customersApi.getAll(p), { per_page: 20 })

  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [deleteCustomer, setDeleteCustomer] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const searchTimeout = useRef(null)

  useEffect(() => {
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      updateParams({ search: search || undefined })
    }, 300)
    return () => clearTimeout(searchTimeout.current)
  }, [search])

  const handleAdd = async (data) => {
    try {
      await customersApi.create(data)
      toast.success('Customer added successfully')
      setShowAdd(false)
      refresh()
    } catch (err) {
      toast.error(err.message)
      throw err
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await customersApi.delete(deleteCustomer.id)
      toast.success('Customer deleted')
      setDeleteCustomer(null)
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
          <span className="card-title">Customers</span>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-bar">
              <span className="search-bar-icon">⌕</span>
              <input
                className="form-control"
                placeholder="Search name or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Customer</button>
          </div>
        </div>

        {loading ? <LoadingCenter /> : error ? (
          <div style={{ padding: 24, color: 'var(--red)' }}>Error: {error}</div>
        ) : items.length === 0 ? (
          <EmptyState icon="◎" title="No customers found" description="Add your first customer to get started." />
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => (
                    <tr key={c.id}>
                      <td className="fw-600">{c.full_name}</td>
                      <td className="text-muted">{c.email}</td>
                      <td className="text-muted">{c.phone || '—'}</td>
                      <td className="text-muted text-sm">{new Date(c.created_at).toLocaleDateString()}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteCustomer(c)}>Delete</button>
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

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Add Customer</span>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <CustomerForm onSubmit={handleAdd} onClose={() => setShowAdd(false)} />
          </div>
        </div>
      )}

      {deleteCustomer && (
        <ConfirmDialog
          title="Delete Customer"
          message={`Delete "${deleteCustomer.full_name}"? All their orders will also be deleted.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteCustomer(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
