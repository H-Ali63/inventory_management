import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { dashboardApi } from '../api/dashboard'
import { useApi } from '../hooks/useApi'
import { LoadingCenter, StockBadge } from '../components/UI'

export default function Dashboard() {
  const { data, loading, error, fetch } = useApi(() => dashboardApi.get())

  useEffect(() => { fetch() }, [fetch])

  if (loading) return <LoadingCenter />
  if (error) return <div style={{ color: 'var(--red)', padding: 24 }}>Error: {error}</div>
  if (!data) return null

  const fmt = (n) => Number(n).toLocaleString()
  const fmtMoney = (n) =>
    Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">⬡</div>
          <div className="stat-info">
            <div className="stat-value">{fmt(data.total_products)}</div>
            <div className="stat-label">Total Products</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">◎</div>
          <div className="stat-info">
            <div className="stat-value">{fmt(data.total_customers)}</div>
            <div className="stat-label">Total Customers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow">◈</div>
          <div className="stat-info">
            <div className="stat-value">{fmt(data.total_orders)}</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">$</div>
          <div className="stat-info">
            <div className="stat-value" style={{ fontSize: 20 }}>{fmtMoney(data.total_revenue)}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">
            ⚠ Low Stock Products
            <span className="badge badge-yellow" style={{ marginLeft: 10 }}>
              ≤ {data.low_stock_threshold} units
            </span>
          </span>
          <Link to="/products" className="btn btn-ghost btn-sm">View all →</Link>
        </div>
        {data.low_stock_products.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px 24px' }}>
            <div className="empty-icon">✓</div>
            <div className="empty-title">All products well stocked</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {data.low_stock_products.map((p) => (
                  <tr key={p.id}>
                    <td className="fw-600">{p.name}</td>
                    <td><span className="mono">{p.sku}</span></td>
                    <td>{fmtMoney(p.price)}</td>
                    <td><StockBadge quantity={p.stock_quantity} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
