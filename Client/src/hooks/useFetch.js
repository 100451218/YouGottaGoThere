import { useState } from 'react'

// Helper hook para hacer fetch requests autenticados (con cookies)
export const useFetch = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchRequest = async (url, options = {}) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`http://localhost:8800${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include', // Include cookies para autenticación
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData || 'Error en la petición')
      }

      const data = await response.json()
      setLoading(false)
      return { success: true, data }
    } catch (err) {
      const errorMsg = err.message || 'Error desconocido'
      setError(errorMsg)
      setLoading(false)
      return { success: false, error: errorMsg }
    }
  }

  return { fetchRequest, loading, error }
}
