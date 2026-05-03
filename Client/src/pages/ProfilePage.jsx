import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFetch } from '../hooks/useFetch'
import { useAuthGuard } from '../hooks/useAuthGuard'
import TierListSection from '../components/Profile/TierListSection'
import RestaurantWizard from '../components/Profile/RestaurantWizard'
import AddRestaurantSection from '../components/Profile/AddRestaurantSection'
import '../css/Profile.css'
import NotTopUserRestaurants from '../components/Profile/NotTopUserRestaurants'

/**
 * ProfilePage
 * Página contenedora del perfil del usuario
 * Maneja toda la lógica de estado y API calls
 * Distribuye props a componentes presentacionales
 */
function ProfilePage() {
  const { currentUser } = useAuth()
  useAuthGuard() // Redirige al login si no está autenticado

  const { fetchRequest, loading: fetchLoading, error: fetchError } = useFetch()

  // Estado: Restaurantes del usuario
  const [userRestaurants, setUserRestaurants] = useState([])

  // Estado: Tier list selections (ranking 1-5 -> restaurant ID)
  const [tierSelections, setTierSelections] = useState({
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
  })

  // Estado: Wizard modal
  const [showWizard, setShowWizard] = useState(false)

  // Cargar restaurantes del usuario al montar
  useEffect(() => {
    if (currentUser) {
      loadUserRestaurants()
    }
  }, [currentUser])

  // Sincronizar tier selections cuando cambien los restaurantes
  useEffect(() => {
    updateTierSelections()
  }, [userRestaurants])

  /**
   * API: Cargar todos los restaurantes del usuario
   */
  const loadUserRestaurants = async () => {
    const result = await fetchRequest('/restaurants/my-restaurants')
    if (result.success) {
      setUserRestaurants(result.data)
    }
  }

  /**
   * Sincronizar estado local de tier selections con datos de BD
   */
  const updateTierSelections = () => {
    const selections = {}
    userRestaurants.forEach((rest) => {
      if (rest.ranking && rest.ranking >= 1 && rest.ranking <= 5) {
        selections[rest.ranking] = rest.id
      }
    })
    setTierSelections(selections)
  }

  /**
   * Tier list: Cambiar la selección de un slot
   */
  const handleChangeRanking = async (ranking, restaurantId) => {
    // Si es el mismo restaurant, deseleccionar
    if (tierSelections[ranking] === restaurantId) {
      const result = await fetchRequest(`/restaurants/${restaurantId}/ranking`, {
        method: 'PATCH',
        body: JSON.stringify({ ranking: null }),
      })

      if (result.success) {
        setTierSelections((prev) => ({ ...prev, [ranking]: null }))
        loadUserRestaurants()
      }
      return
    }

    // Si otro slot tenía este ranking, liberarlo
    const oldRestaurantId = tierSelections[ranking]
    if (oldRestaurantId && oldRestaurantId !== restaurantId) {
      await fetchRequest(`/restaurants/${oldRestaurantId}/ranking`, {
        method: 'PATCH',
        body: JSON.stringify({ ranking: null }),
      })
    }

    // Asignar el nuevo ranking
    const result = await fetchRequest(`/restaurants/${restaurantId}/ranking`, {
      method: 'PATCH',
      body: JSON.stringify({ ranking }),
    })

    if (result.success) {
      setTierSelections((prev) => ({ ...prev, [ranking]: restaurantId }))
      loadUserRestaurants()
    }
  }

  /**
   * Abre el modal del wizard
   */
  const handleOpenWizard = () => {
    setShowWizard(true)
  }

  /**
   * Cierra el modal del wizard
   */
  const handleCloseWizard = () => {
    setShowWizard(false)
  }

  /**
   * Se ejecuta después de guardar una review en el wizard
   */
  const handleReviewSaved = () => {
    handleCloseWizard()
    loadUserRestaurants()
  }

  if (!currentUser) {
    return <div className="profile-container">Cargando...</div>
  }

  return (
    <div className="profile-container">
      <h1>Mi Perfil - {currentUser.username}</h1>

      {/* PARTE 1: TIER LIST (Top 5) */}
      <TierListSection
        userRestaurants={userRestaurants}
        tierSelections={tierSelections}
        onChangeRanking={handleChangeRanking}
      />

      {/* PARTE 2: AÑADIR NUEVO RESTAURANTE */}
      <AddRestaurantSection
        restaurantCount={userRestaurants.length}
        onAddClick={handleOpenWizard}
      />

      {/* PARTE 3: VER LOS RESTAURANTES QUE NO SON TOP 5*/ }
      <NotTopUserRestaurants
        restaurants={userRestaurants}
        onChangeRanking={handleChangeRanking}
        />

      {/* WIZARD MODAL */}
      {showWizard && (
        <RestaurantWizard
          isOpen={showWizard}
          onClose={handleCloseWizard}
          onReviewSaved={handleReviewSaved}
          fetchRequest={fetchRequest}
        />
      )}

      {/* Loading & Error states */}
      {fetchLoading && <div className="loading">Cargando...</div>}
      {fetchError && <div className="error">Error: {fetchError}</div>}
    </div>
  )
}

export default ProfilePage
