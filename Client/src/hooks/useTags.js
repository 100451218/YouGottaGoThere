import { useState, useEffect } from 'react'

/**
 * ====================================================================
 * useTags
 * ====================================================================
 * Hook personalizado para cargar y gestionar todas las tags disponibles
 * en el sistema.
 * 
 * RESPONSABILIDADES:
 * - Cargar todas las tags de la API
 * - Mantener el estado de loading
 * - Cachear los datos (no recargar cada vez que se renderice)
 * 
 * RETORNA:
 * {
 *   allTags: Array de tags disponibles [{ id, name }, ...]
 *   loading: boolean (true mientras carga)
 * }
 * 
 * USO:
 * const { allTags, loading } = useTags(fetchRequest)
 * 
 * PARÁMETRO:
 * - fetchRequest: función proporcionada por useFetch hook
 */
export const useTags = (fetchRequest) => {
  const [allTags, setAllTags] = useState([])
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    const loadTags = async () => {
      setLoading(true)
      try {
        const result = await fetchRequest('/restaurants/tags')
        if (result.success) {
          setAllTags(result.data || [])
        }
      } finally {
        setLoading(false)
      }
    }
    loadTags()
  }, [])
  
  return { allTags, loading }
}