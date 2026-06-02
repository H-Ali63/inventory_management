import { useState, useEffect, useCallback } from 'react'

export function useApi(apiFn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFn(...args)
      setData(res.data)
      return res.data
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error, fetch, setData }
}

export function usePaginated(apiFn, initialParams = {}) {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [perPage] = useState(initialParams.per_page || 20)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [params, setParams] = useState(initialParams)

  const load = useCallback(async (overrideParams = {}) => {
    setLoading(true)
    setError(null)
    try {
      const merged = { ...params, ...overrideParams, page, per_page: perPage }
      const res = await apiFn(merged)
      setItems(res.data.items)
      setTotal(res.data.total)
      setTotalPages(res.data.total_pages)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage, params])

  useEffect(() => { load() }, [load])

  const refresh = () => load()
  const updateParams = (p) => { setParams(prev => ({ ...prev, ...p })); setPage(1) }

  return { items, total, totalPages, page, perPage, loading, error, setPage, refresh, updateParams }
}
