import { useState, useEffect, useCallback } from 'react'
import { api } from '../api'

/**
 * Hook genérico para CRUD contra la API.
 * @param {string} endpoint — ej. '/doctores'
 */
export function useApi(endpoint) {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const rows = await api.get(endpoint)
      setData(rows)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => { load() }, [load])

  const create = async (body) => {
    await api.post(endpoint, body)
    await load()
  }

  const update = async (id, body) => {
    await api.put(`${endpoint}/${id}`, body)
    await load()
  }

  const remove = async (id) => {
    await api.delete(`${endpoint}/${id}`)
    await load()
  }

  return { data, loading, error, reload: load, create, update, remove }
}
