import { useState } from 'react'
import PropTypes from 'prop-types'
import WizardStep1 from './WizardStep1'
import WizardStep2 from './WizardStep2'

/**
 * ====================================================================
 * RestaurantWizard
 * ====================================================================
 * Modal wizard de 2 pasos para añadir nuevo restaurante + review.
 * 
 * ESTRUCTURA:
 * PASO 1: Buscar o crear restaurante
 *   - Usuario escribe nombre y coordenadas
 *   - Sistema busca restaurantes existentes con eso
 *   - Puede seleccionar existente O crear uno nuevo
 * 
 * PASO 2: Escribir review + tags
 *   - Escribir descripción de la experiencia
 *   - Seleccionar ranking (1-5 o ninguno)
 *   - Seleccionar tags del restaurante (NUEVO)
 *   - Guardar
 * 
 * PROPS:
 * - isOpen: boolean para mostrar/ocultar
 * - onClose: callback para cerrar el modal
 * - onReviewSaved: callback después de guardar la review
 * - fetchRequest: función reutilizable para hacer API calls
 * 
 * ESTADO INTERNO:
 * - step: número del paso (1 o 2)
 * - wizardState: objeto con todos los datos acumulados
 * 
 * RESPONSABILIDADES:
 * 1. Gestionar navegación entre pasos
 * 2. Acumular datos en wizardState conforme el usuario avanza
 * 3. Hacer las API calls en cada paso
 * 4. Cerrar el modal y resetear cuando termina
 */
function RestaurantWizard({ isOpen, onClose, onReviewSaved, fetchRequest }) {
  // Número del paso actual (1 o 2)
  const [step, setStep] = useState(1)

  /**
   * wizardState: Objeto que acumula todos los datos del usuario
   * 
   * Estructura:
   * {
   *   restaurantId: número o null (asignado en paso 1)
   *   name: string (nombre del restaurante)
   *   locationx: número (coordenada X)
   *   locationy: número (coordenada Y)
   *   description: string (review del usuario, en paso 2)
   *   ranking: número o null (1-5, en paso 2)
   *   tags: array de números (IDs de tags, en paso 2 - NUEVO)
   *   suggestions: array (restaurantes sugeridos en paso 1)
   * }
   */
  const [wizardState, setWizardState] = useState({
    restaurantId: null,
    name: '',
    locationx: '',
    locationy: '',
    description: '',
    ranking: null,
    tags: [], // NUEVO: Array de tag IDs
    suggestions: [],
  })

  // ====================================================================
  // PASO 1: Buscar y seleccionar/crear restaurante
  // ====================================================================

  /**
   * handleSearchRestaurants
   * API Call: GET /restaurants/search
   * 
   * Busca restaurantes existentes por nombre y ubicación
   * Valida que todos los parámetros estén presentes
   * Guarda las sugerencias en wizardState.suggestions
   */
  const handleSearchRestaurants = async (name, locationx, locationy) => {
    if (!name || !locationx || !locationy) return

    const query = `/restaurants/search?name=${name}&locationx=${locationx}&locationy=${locationy}`
    const result = await fetchRequest(query)
    if (result.success) {
      setWizardState((prev) => ({ ...prev, suggestions: result.data }))
    }
  }

  /**
   * handleSelectExistingRestaurant
   * Llamado desde Paso 1 cuando el usuario selecciona un restaurante
   * 
   * Proceso:
   * 1. Rellena wizardState con los datos del restaurante
   * 2. Limpia las sugerencias (porque ya lo seleccionó)
   * 3. Avanza al paso 2
   */
  const handleSelectExistingRestaurant = (restaurant) => {
    setWizardState((prev) => ({
      ...prev,
      restaurantId: restaurant.id,
      name: restaurant.name,
      locationx: restaurant.locationx,
      locationy: restaurant.locationy,
      suggestions: [],
    }))
    setStep(2)
  }

  /**
   * handleCreateNewRestaurant
   * API Call: POST /restaurants
   * 
   * Crea un nuevo restaurante si no existe
   * 
   * Proceso:
   * 1. Valida que todos los campos estén rellenos
   * 2. Llama a API para crear el restaurante
   * 3. Guarda el restaurantId retornado
   * 4. Avanza al paso 2
   */
  const handleCreateNewRestaurant = async () => {
    const { name, locationx, locationy } = wizardState

    if (!name || !locationx || !locationy) {
      alert('Completa todos los campos')
      return
    }

    const result = await fetchRequest('/restaurants', {
      method: 'POST',
      body: JSON.stringify({
        name,
        locationx: parseInt(locationx),
        locationy: parseInt(locationy),
      }),
    })

    if (result.success) {
      setWizardState((prev) => ({
        ...prev,
        restaurantId: result.data.id,
        suggestions: [],
      }))
      setStep(2)
    }
  }

  // ====================================================================
  // PASO 2: Escribir review + tags
  // ====================================================================

  /**
   * handleSaveReview
   * API Call: POST /restaurants/:restaurantId/reviews
   * 
   * Guarda la review con descripción, ranking y tags
   * 
   * Proceso:
   * 1. Valida que haya restaurante seleccionado
   * 2. Prepara los datos (ranking como int, tags como array)
   * 3. Llama a API para guardar la review
   * 4. Si éxito: cierra wizard y notifica al padre
   */
  const handleSaveReview = async () => {
    const { restaurantId, description, ranking, tags } = wizardState

    if (!restaurantId) {
      alert('No hay restaurante seleccionado')
      return
    }

    const result = await fetchRequest(`/restaurants/${restaurantId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({
        description,
        ranking: ranking ? parseInt(ranking) : null,
        tags: tags, // Array de tag IDs (NUEVO)
      }),
    })

    if (result.success) {
      alert('Review guardada exitosamente')
      closeWizard()
      onReviewSaved()
    }
  }

  // ====================================================================
  // UTILIDADES
  // ====================================================================

  /**
   * closeWizard
   * Limpia estado y cierra el modal
   * 
   * Proceso:
   * 1. Resetea al paso 1
   * 2. Limpia todo wizardState
   * 3. Dispara callback onClose hacia el padre
   */
  const closeWizard = () => {
    setStep(1)
    setWizardState({
      restaurantId: null,
      name: '',
      locationx: '',
      locationy: '',
      description: '',
      ranking: null,
      tags: [],
      suggestions: [],
    })
    onClose()
  }

  /**
   * handleStateChange
   * Actualiza un campo específico en wizardState
   * 
   * Parámetros:
   *   field: nombre del campo a actualizar
   *   value: nuevo valor
   * 
   * Usado por WizardStep1 y WizardStep2 para cada input del usuario
   */
  const handleStateChange = (field, value) => {
    setWizardState((prev) => ({ ...prev, [field]: value }))
  }

  // ====================================================================
  // RENDER
  // ====================================================================

  // No mostrar nada si el modal no está abierto
  if (!isOpen) return null

  return (
    <div className="wizard-modal-overlay">
      <div className="wizard-modal">
        {/* Botón para cerrar el modal */}
        <button className="close-btn" onClick={closeWizard} aria-label="Cerrar">
          ✕
        </button>

        {/* Renderizar el paso actual */}
        {step === 1 ? (
          // PASO 1: Buscar/crear restaurante
          <WizardStep1
            wizardState={wizardState}
            onStateChange={handleStateChange}
            onSearch={handleSearchRestaurants}
            onSelectExisting={handleSelectExistingRestaurant}
            onCreateNew={handleCreateNewRestaurant}
            onClose={closeWizard}
          />
        ) : (
          // PASO 2: Escribir review + tags + ranking
          <WizardStep2
            wizardState={wizardState}
            onStateChange={handleStateChange}
            onSave={handleSaveReview}
            onBack={() => setStep(1)}
          />
        )}
      </div>
    </div>
  )
}

/**
 * ====================================================================
 * PropTypes: Validación de tipos
 * ====================================================================
 */

export default RestaurantWizard
