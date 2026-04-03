import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Hook personalizado que verifica si el usuario está autenticado
 * Si no está autenticado, lo redirige automáticamente al login
 * Si está autenticado, no hace nada
 */
export const useAuthGuard = () => {
  const { currentUser, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login')
    }
  }, [currentUser, loading, navigate])
}
