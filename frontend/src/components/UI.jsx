// Spinner
export function Spinner({ size = 20 }) {
  return (
    <div
      className="spinner"
      style={{ width: size, height: size }}
    />
  )
}

// Loading center
export function LoadingCenter() {
  return (
    <div className="loading-center">
      <Spinner size={28} />
    </div>
  )
}

// Empty state
export function EmptyState({ icon = '📭', title = 'Nothing here yet', description = '' }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      {description && <div className="empty-desc">{description}</div>}
    </div>
  )
}

// Confirm dialog
export function ConfirmDialog({ title, message, onConfirm, onCancel, loading }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="btn btn-icon btn-ghost" onClick={onCancel}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <Spinner size={14} /> : null}
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// Pagination
export function Pagination({ page, totalPages, total, perPage, onPage }) {
  const start = (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)
  return (
    <div className="pagination">
      <span className="page-info">
        {total === 0 ? 'No results' : `Showing ${start}–${end} of ${total}`}
      </span>
      <div className="pagination-controls">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onPage(1)}
          disabled={page === 1}
        >«</button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
        >‹</button>
        <span style={{ padding: '0 8px', fontSize: 13, color: 'var(--text-2)' }}>
          {page} / {totalPages || 1}
        </span>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
        >›</button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onPage(totalPages)}
          disabled={page >= totalPages}
        >»</button>
      </div>
    </div>
  )
}

// Badge
export function Badge({ children, variant = 'blue' }) {
  return <span className={`badge badge-${variant}`}>{children}</span>
}

// Stock badge
export function StockBadge({ quantity }) {
  if (quantity === 0) return <Badge variant="red">Out of stock</Badge>
  if (quantity <= 5) return <Badge variant="yellow">Low: {quantity}</Badge>
  return <Badge variant="green">{quantity} in stock</Badge>
}
