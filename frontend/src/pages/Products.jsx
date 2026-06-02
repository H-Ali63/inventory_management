import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { productsApi } from '../api/products'
import { usePaginated } from '../hooks/useApi'
import { LoadingCenter, EmptyState, ConfirmDialog, Pagination, StockBadge } from '../components/UI'
import ProductForm from '../components/ProductForm'

export default function Products() {
  const { items, total, totalPages, page, perPage, loading, error, setPage, refresh, updateParams } =
    usePaginated((p) => productsApi.getAll(p), { per_page: 20 })

  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [showAdd, setShowAdd] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [deleteProduct, setDeleteProduct] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const searchTimeout = useRef(null)

  useEffect(() => {
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      updateParams({ search: search || undefined, sort_by: sortBy, sort_order: sortOrder })
    }, 300)
    return () => clearTimeout(searchTimeout.current)
  }, [search, sortBy, sortOrder])

  const fmtMoney = (n) => Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  const handleAdd = async (data) => {
    try {
      await productsApi.create(data)
      toast.success('Product created successfully')
      setShowAdd(false)
      refresh()
    } catch (err) {
      toast.error(err.message)
      throw err
    }
  }

  const handleEdit = async (data) => {
    try {
      await productsApi.update(editProduct.id, data)
      toast.success('Product updated successfully')
      setEditProduct(null)
      refresh()
    } catch (err) {
      toast.error(err.message)
      throw err
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await productsApi.delete(deleteProduct.id)
      toast.success('Product deleted')
      setDeleteProduct(null)
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
          <span className="card-title">Products</span>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-bar">
              <span className="search-bar-icon">⌕</span>
              <input
                className="form-control"
                placeholder="Search name or SKU…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="form-control" style={{ width: 'auto' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="created_at">Date</option>
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="stock_quantity">Stock</option>
            </select>
            <select className="form-control" style={{ width: 'auto' }} value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
              <option value="desc">↓ Desc</option>
              <option value="asc">↑ Asc</option>
            </select>
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Product</button>
          </div>
        </div>

        {loading ? <LoadingCenter /> : error ? (
          <div style={{ padding: 24, color: 'var(--red)' }}>Error: {error}</div>
        ) : items.length === 0 ? (
          <EmptyState icon="⬡" title="No products found" description="Add your first product to get started." />
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => (
                    <tr key={p.id}>
                      <td className="fw-600">{p.name}</td>
                      <td><span className="mono">{p.sku}</span></td>
                      <td>{fmtMoney(p.price)}</td>
                      <td><StockBadge quantity={p.stock_quantity} /></td>
                      <td className="text-muted text-sm">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEditProduct(p)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteProduct(p)}>Delete</button>
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

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Add Product</span>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <ProductForm onSubmit={handleAdd} onClose={() => setShowAdd(false)} />
          </div>
        </div>
      )}

      {editProduct && (
        <div className="modal-overlay" onClick={() => setEditProduct(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Edit Product</span>
              <button className="btn btn-icon btn-ghost" onClick={() => setEditProduct(null)}>✕</button>
            </div>
            <ProductForm initial={editProduct} onSubmit={handleEdit} onClose={() => setEditProduct(null)} />
          </div>
        </div>
      )}

      {deleteProduct && (
        <ConfirmDialog
          title="Delete Product"
          message={`Delete "${deleteProduct.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteProduct(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
