import { useState } from 'react'
import PropTypes from 'prop-types'
import WizardStep1 from './WizardStep1'
import WizardStep2 from './WizardStep2'

/**
 * RestaurantWizard
 * Modal wizard de 2 pasos para añadir nuevo restaurante + review
 *
 * Props:
 * - isOpen: boolean para mostrar/ocultar
 * - onClose: callback para cerrar
 * - onReviewSaved: callback cuando se guarda la review
 * - fetchRequest: función para hacer API calls
 */
function RestaurantWizard({ isOpen, onClose, onReviewSaved, fetchRequest }) {
  const [step, setStep] = useState(1)
  const [wizardState, setWizardState] = useState({
    restaurantId: null,
    name: '',
    locationx: '',
    locationy: '',
    description: '',
    ranking: null,
    suggestions: [],
  })

  /**
   * Buscar restaurants por nombre + coordenadas
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
   * Paso 1: Seleccionar restaurante existente de sugerencias
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
   * Paso 1: Crear nuevo restaurante
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

  /**
   * Paso 2: Guardar la review
   */
  const handleSaveReview = async () => {
    const { restaurantId, description, ranking } = wizardState

    if (!restaurantId) {
      alert('No hay restaurante seleccionado')
      return
    }

    const result = await fetchRequest(`/restaurants/${restaurantId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({
        description,
        ranking: ranking ? parseInt(ranking) : null,
      }),
    })

    if (result.success) {
      alert('Review guardada exitosamente')
      closeWizard()
      onReviewSaved()
    }
  }

  /**
   * Cerrar wizard y resetear estado
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
      suggestions: [],
    })
    onClose()
  }

  /**
   * Cambiar valor en wizardState
   */
  const handleStateChange = (field, value) => {
    setWizardState((prev) => ({ ...prev, [field]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="wizard-modal-overlay">
      <div className="wizard-modal">
        <button className="close-btn" onClick={closeWizard} aria-label="Cerrar">
          ✕
        </button>

        {step === 1 ? (
          <WizardStep1
            wizardState={wizardState}
            onStateChange={handleStateChange}
            onSearch={handleSearchRestaurants}
            onSelectExisting={handleSelectExistingRestaurant}
            onCreateNew={handleCreateNewRestaurant}
            onClose={closeWizard}
          />
        ) : (
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

RestaurantWizard.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onReviewSaved: PropTypes.func.isRequired,
  fetchRequest: PropTypes.func.isRequired,
}

export default RestaurantWizard
