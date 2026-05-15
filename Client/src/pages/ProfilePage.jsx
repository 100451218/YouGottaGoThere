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
 * ====================================================================
 * ProfilePage
 * ====================================================================
 * Página contenedora principal del perfil del usuario.
 * 
 * RESPONSABILIDADES:
 * 1. Gestionar todo el estado local de restaurantes y tier list
 * 2. Realizar todas las llamadas API al backend
 * 3. Distribuir props a componentes presentacionales (TierListSection, 
 *    NotTopUserRestaurants, etc.)
 * 4. Manejar la lógica de actualización de rankings (tier list)
 * 5. Controlar el ciclo de vida del wizard modal (abrir/cerrar)
 *
 * FLUJO DE DATOS:
 * ProfilePage (contenedor - lógica) -> Componentes presentacionales
 * Los componentes presentacionales son puros: solo reciben props y 
 * disparan callbacks cuando el usuario interactúa.
 */
function ProfilePage() {
  // ====================================================================
  // HOOKS - Contexto y funciones reutilizables
  // ====================================================================
  
  const { currentUser } = useAuth()
  // useAuthGuard: Hook personalizado que redirige a login si no está autenticado
  useAuthGuard()

  // useFetch: Hook personalizado que proporciona fetchRequest con headers y autenticación
  const { fetchRequest, loading: fetchLoading, error: fetchError } = useFetch()

  // ====================================================================
  // ESTADO - Variables de estado React
  // ====================================================================

  /**
   * userRestaurants: Array de todos los restaurantes revisados por el usuario
   * Estructura de cada restaurante:
   * {
   *   id: número,
   *   name: string,
   *   locationx: número,
   *   locationy: número,
   *   ranking: número (1-5) o null,
   *   description: string (la review del usuario)
   * }
   */
  const [userRestaurants, setUserRestaurants] = useState([])

  /**
   * tierSelections: Mapeo de ranking -> restaurant ID
   * Ejemplo: { 1: 42, 2: 15, 3: null, 4: null, 5: null }
   * Significa: Restaurante 42 está en el #1, Restaurante 15 en el #2, etc.
   * 
   * Se usa para:
   * 1. Mostrar qué restaurante está en cada posición del top 5
   * 2. Detectar si cambia un ranking para actualizar solo lo necesario
   * 3. Prevenir que dos restaurantes tengan el mismo ranking
   */
  const [tierSelections, setTierSelections] = useState({
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
  })

  /**
   * showWizard: Controla si el modal del wizard está visible
   * El wizard es el modal de 2 pasos para añadir nuevo restaurante + review
   */
  const [showWizard, setShowWizard] = useState(false)

  // ====================================================================
  // EFECTOS - useEffect para efectos secundarios
  // ====================================================================

  /**
   * EFECTO 1: Cargar restaurantes al montar el componente
   * Se ejecuta cuando currentUser cambia
   * 
   * Lógica:
   * 1. Espera a que haya un usuario autenticado (currentUser)
   * 2. Llama a loadUserRestaurants() para obtener todos sus restaurantes, reviews y tags de las reviews
   * 3. Popula userRestaurants con la respuesta
   * 
   * Dependencias: [currentUser]
   * Se ejecutará cada vez que el usuario se autentique o cierre sesión
   */
  useEffect(() => {
    if (currentUser) {
      loadUserRestaurants()
    }
  }, [currentUser])

  /**
   * EFECTO 2: Sincronizar tier selections cuando cambien los restaurantes
   * Se ejecuta después de que cambien los restaurantes
   * 
   * Lógica:
   * 1. Lee todos los restaurantes
   * 2. Extrae los que tienen ranking 1-5
   * 3. Actualiza tierSelections con el mapeo ranking -> restaurantId
   * 
   * Dependencias: [userRestaurants]
   * Se ejecutará automáticamente cada vez que carguen o cambien los restaurantes
   * Esto asegura que tierSelections siempre está sincronizado con los datos reales
   */
  useEffect(() => {
    updateTierSelections()
  }, [userRestaurants])

  // ====================================================================
  // FUNCIONES API - Comunicación con el backend
  // ====================================================================

  /**
   * loadUserRestaurants
   * API Call: GET /restaurants/my-restaurants
   * 
   * Obtiene todos los restaurantes que el usuario ha revisado.
   * Incluye: id, name, locationx, locationy, ranking, description
   * 
   * Actualiza: userRestaurants (estado local)
   */
  const loadUserRestaurants = async () => {
    const result = await fetchRequest('/restaurants/my-restaurants')
    if (result.success) {
      setUserRestaurants(result.data)
    }
  }

  /**
   * updateTierSelections
   * Función auxiliar (sin API call)
   * 
   * Sincroniza el estado local tierSelections con los datos reales en userRestaurants.
   * 
   * Proceso:
   * 1. Crea un objeto vacío selections
   * 2. Itera cada restaurante
   * 3. Si tiene ranking 1-5, lo añade: selections[ranking] = restaurantId
   * 4. Actualiza tierSelections con el resultado
   * 
   * Importancia: Mantiene sincronizados los datos locales con el servidor
   * Se ejecuta después de cada cambio en userRestaurants (via useEffect)
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

  // ====================================================================
  // CONTROLADORES - Manejan eventos y cambios de estado
  // ====================================================================

  /**
   * handleChangeRanking
   * Se ejecuta cuando el usuario cambia un ranking en la tier list
   * 
   * CASOS QUE MANEJA:
   * 
   * CASO 1: El usuario hace clic en el mismo restaurante que ya tiene ese ranking
   *   -> Deselecciona (quita el ranking)
   *   -> Actualiza server: PATCH /restaurants/:id/ranking con ranking: null
   *   -> Recarga la lista completa
   * 
   * CASO 2: El usuario selecciona un restaurante diferente para ese slot
   *   -> Si había otro restaurante en ese slot, lo deselecciona primero
   *   -> Actualiza server para el viejo (si existe)
   *   -> Actualiza server para el nuevo: PATCH /restaurants/:id/ranking con nuevo ranking
   *   -> Recarga la lista completa
   * 
   * Parámetros:
   *   ranking: número 1-5 del slot que se está cambiando
   *   restaurantId: id del restaurante que se está asignando al slot
   * 
   * API Calls:
   *   PATCH /restaurants/:restaurantId/ranking { ranking: número o null }
   */
  const handleChangeRanking = async (ranking, restaurantId) => {
    // CASO 1: Deseleccionar si es el mismo restaurante
    // El usuario hace clic en el mismo select -> deselecciona
    console.log("handleChangeRanking", ranking, restaurantId)
    if (tierSelections[ranking] === restaurantId) {
      const result = await fetchRequest(`/restaurants/${restaurantId}/ranking`, {
        method: 'PATCH',
        body: JSON.stringify({ ranking: null }),
      })

      if (result.success) {
        setTierSelections((prev) => ({ ...prev, [ranking]: null }))
        loadUserRestaurants() // Recarga para reflejar cambios
      }
      return
    }

    // CASO 2: Seleccionar un restaurante diferente
    // Si otro slot tenía este ranking, liberarlo primero
    const oldRestaurantId = tierSelections[ranking]
    if (oldRestaurantId && oldRestaurantId !== restaurantId) {
      // Deselecciona el viejo restaurante de este slot
      await fetchRequest(`/restaurants/${oldRestaurantId}/ranking`, {
        method: 'PATCH',
        body: JSON.stringify({ ranking: null }),
      })
    }

    // Asignar el nuevo ranking al restaurante seleccionado
    const result = await fetchRequest(`/restaurants/${restaurantId}/ranking`, {
      method: 'PATCH',
      body: JSON.stringify({ ranking }),
    })

    if (result.success) {
      setTierSelections((prev) => ({ ...prev, [ranking]: restaurantId }))
      loadUserRestaurants() // Recarga para reflejar cambios
    }
  }

  /**
   * handleOpenWizard
   * Muestra el modal del wizard (pasos 1 y 2)
   * Parámetro: ninguno
   */
  const handleOpenWizard = () => {
    setShowWizard(true)
  }

  /**
   * handleCloseWizard
   * Oculta el modal del wizard
   * Parámetro: ninguno
   */
  const handleCloseWizard = () => {
    setShowWizard(false)
  }

  /**
   * handleReviewSaved
   * Se ejecuta después de que el usuario guarde una review en el wizard
   * 
   * Proceso:
   * 1. Cierra el wizard
   * 2. Recarga la lista de restaurantes para mostrar el nuevo
   * 
   * Parámetro: ninguno
   */
  const handleReviewSaved = () => {
    handleCloseWizard()
    
    loadUserRestaurants()
  }

  // ====================================================================
  // RENDER
  // ====================================================================

  if (!currentUser) {
    return <div className="profile-container">Cargando...</div>
  }

  return (
    <div className="profile-container">
      <h1>Mi Perfil - {currentUser.username}</h1>

      {/* ========================================================================
          SECCIÓN 1: TIER LIST (Top 5 Restaurantes)
          
          Componente: TierListSection
          Props:
          - userRestaurants: array de todos los restaurantes del usuario
          - tierSelections: mapeo ranking -> restaurantId
          - onChangeRanking: callback cuando se cambiar un ranking
          
          Responsabilidad del componente:
          - Mostrar 5 slots (del #1 al #5)
          - Permitir seleccionar un restaurante para cada slot
          - Mostrar la descripción del restaurante seleccionado
          ======================================================================== */}
      <TierListSection
        userRestaurants={userRestaurants}
        tierSelections={tierSelections}
        onChangeRanking={handleChangeRanking}
      />

      {/* ========================================================================
          SECCIÓN 2: AÑADIR NUEVO RESTAURANTE
          
          Componente: AddRestaurantSection
          Props:
          - restaurantCount: cantidad total de restaurantes revisados
          - onAddClick: callback cuando se presiona el botón de añadir
          
          Responsabilidad del componente:
          - Mostrar botón para abrir el wizard
          - Mostrar el contador de restaurantes
          ======================================================================== */}
      <AddRestaurantSection
        restaurantCount={userRestaurants.length}
        onAddClick={handleOpenWizard}
      />

      {/* ========================================================================
          SECCIÓN 3: RESTAURANTES SIN TOP 5
          
          Componente: NotTopUserRestaurants
          Props:
          - restaurants: array de todos los restaurantes del usuario
          - onChangeRanking: callback cuando se cambia el ranking
          - fetchRequest: función para hacer API calls (para TagsManager)
          
          Responsabilidad del componente:
          - Filtrar y mostrar solo restaurantes sin ranking (ranking = null)
          - Mostrar un select para asignarles ranking
          - Integrar TagsManager para editar tags
          ======================================================================== */}
      <NotTopUserRestaurants
        restaurants={userRestaurants}
        onChangeRanking={handleChangeRanking}
        fetchRequest={fetchRequest}
      />

      {/* ========================================================================
          WIZARD MODAL: AÑADIR RESTAURANTE + REVIEW
          
          Componente: RestaurantWizard
          Props:
          - isOpen: boolean para mostrar/ocultar
          - onClose: callback cuando se cierra
          - onReviewSaved: callback después de guardar la review
          - fetchRequest: función para hacer API calls
          
          Estructura:
          - Paso 1: Buscar o crear restaurante
          - Paso 2: Escribir review y seleccionar ranking
          
          Responsabilidad del componente:
          - Gestionar los 2 pasos internamente
          - Hacer las API calls correspondientes
          ======================================================================== */}
      {showWizard && (
        <RestaurantWizard
          isOpen={showWizard}
          onClose={handleCloseWizard}
          onReviewSaved={handleReviewSaved}
          fetchRequest={fetchRequest}
          handleChangeRanking={handleChangeRanking}
        />
      )}

      {/* ESTADOS DE CARGA Y ERROR */}
      {fetchLoading && <div className="loading">Cargando...</div>}
      {fetchError && <div className="error">Error: {fetchError}</div>}
    </div>
  )
}

export default ProfilePage
