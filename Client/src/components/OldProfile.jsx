import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFetch } from '../hooks/useFetch'
import '../css/Profile.css'

function Profile() {
  const { currentUser } = useAuth()
  const { fetchRequest, loading: fetchLoading, error: fetchError } = useFetch()

  // Estado: Restaurantes del usuario
  const [userRestaurants, setUserRestaurants] = useState([])
  const [topRestaurants, setTopRestaurants] = useState([])

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
  const [wizardStep, setWizardStep] = useState(1) // 1: buscar/crear, 2: escribir review
  const [wizardState, setWizardState] = useState({
    restaurantId: null,
    name: '',
    locationx: '',
    locationy: '',
    description: '',
    ranking: null,
    suggestions: [],
  })

  // Cargar restaurantes del usuario al montar
  useEffect(() => {
    loadUserRestaurants()
  }, [currentUser])

  // Cargar restaurantes cuando cambien
  useEffect(() => {
    if (userRestaurants.length > 0) {
      // Llenar los tier selections basados en restaurantes que ya tienen ranking
      const selections = {}
      userRestaurants.forEach((rest) => {
        if (rest.ranking && rest.ranking >= 1 && rest.ranking <= 5) {
          selections[rest.ranking] = rest.id
        }
      })
      setTierSelections(selections)
    }
  }, [userRestaurants])

  // API: Cargar todos los restaurantes del usuario
  const loadUserRestaurants = async () => {
    const result = await fetchRequest('/restaurants/my-restaurants')
    if (result.success) {
      setUserRestaurants(result.data)
    }
  }

  // Buscar restaurants por nombre + coordenadas
  const handleSearchRestaurants = async (name, locationx, locationy) => {
    if (!name || !locationx || !locationy) return

    const query = `/restaurants/search?name=${name}&locationx=${locationx}&locationy=${locationy}`
    const result = await fetchRequest(query)
    if (result.success) {
      setWizardState((prev) => ({ ...prev, suggestions: result.data }))
    }
  }

  // Wizard: Seleccionar un restaurante existente de las sugerencias
  const handleSelectExistingRestaurant = (restaurant) => {
    setWizardState((prev) => ({
      ...prev,
      restaurantId: restaurant.id,
      name: restaurant.name,
      locationx: restaurant.locationx,
      locationy: restaurant.locationy,
      suggestions: [],
    }))
    setWizardStep(2)
  }

  // Wizard: Crear un nuevo restaurante
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
      const newRestaurant = result.data
      setWizardState((prev) => ({
        ...prev,
        restaurantId: newRestaurant.id,
        suggestions: [],
      }))
      setWizardStep(2)
    }
  }

  // Wizard: Guardar la review (crear o actualizar)
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
      loadUserRestaurants()
    }
  }

  // Tier list: Cambiar la selección de un slot
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

  // Cerrar wizard
  const closeWizard = () => {
    setShowWizard(false)
    setWizardStep(1)
    setWizardState({
      restaurantId: null,
      name: '',
      locationx: '',
      locationy: '',
      description: '',
      ranking: null,
      suggestions: [],
    })
  }

  // Helper: obtener nombre del restaurante por ID
  const getRestaurantNameById = (id) => {
    const rest = userRestaurants.find((r) => r.id === id)
    return rest ? rest.name : 'No seleccionado'
  }

  if (!currentUser) {
    return <div>Debes iniciar sesión</div>
  }

  return (
    <div className="profile-container">
      <h1>Mi Perfil - {currentUser.username}</h1>

      {/* PARTE 1: TIER LIST (Top 5) */}
      <section className="tier-list-section">
        <h2>Mi Top 5 Restaurantes</h2>
        <div className="tier-list">
          {[1, 2, 3, 4, 5].map((ranking) => (
            <div key={ranking} className="tier-slot">
              <label>#{ranking}</label>
              <select
                value={tierSelections[ranking] || ''}
                onChange={(e) =>
                  handleChangeRanking(ranking, parseInt(e.target.value) || null)
                }
              >
                <option value="">-- Selecciona un restaurante --</option>
                {userRestaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name} ({restaurant.locationx}, {restaurant.locationy})
                  </option>
                ))}
              </select>
              {tierSelections[ranking] && (
                <div className="restaurant-info">
                  <p className="description">
                    {
                      userRestaurants.find((r) => r.id === tierSelections[ranking])
                        ?.description
                    }
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* PARTE 2: AÑADIR NUEVO RESTAURANTE */}
      <section className="add-restaurant-section">
        <h2>Mis Restaurantes</h2>
        <p>Total restaurantes visitados: {userRestaurants.length}</p>
        <button className="btn-add" onClick={() => setShowWizard(true)}>
          ➕ Añadir Nuevo Restaurante
        </button>
      </section>

      {/* WIZARD MODAL */}
      {showWizard && (
        <div className="wizard-modal-overlay">
          <div className="wizard-modal">
            <button className="close-btn" onClick={closeWizard}>
              ✕
            </button>

            {wizardStep === 1 ? (
              // PASO 1: Buscar o crear restaurante
              <div className="wizard-step-1">
                <h3>Paso 1: Buscar o Crear Restaurante</h3>

                <div className="form-group">
                  <label>Nombre del Restaurante</label>
                  <input
                    type="text"
                    placeholder="ej: McDonald's, Italian Place"
                    value={wizardState.name}
                    onChange={(e) => {
                      const newName = e.target.value
                      setWizardState((prev) => ({ ...prev, name: newName }))
                      // Buscar en tiempo real
                      if (wizardState.locationx && wizardState.locationy) {
                        handleSearchRestaurants(
                          newName,
                          wizardState.locationx,
                          wizardState.locationy
                        )
                      }
                    }}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Localización X</label>
                    <input
                      type="number"
                      placeholder="ej: 100"
                      value={wizardState.locationx}
                      onChange={(e) => {
                        const newLocX = e.target.value
                        setWizardState((prev) => ({
                          ...prev,
                          locationx: newLocX,
                        }))
                        // Buscar en tiempo real
                        if (wizardState.name && wizardState.locationy) {
                          handleSearchRestaurants(
                            wizardState.name,
                            newLocX,
                            wizardState.locationy
                          )
                        }
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Localización Y</label>
                    <input
                      type="number"
                      placeholder="ej: 100"
                      value={wizardState.locationy}
                      onChange={(e) => {
                        const newLocY = e.target.value
                        setWizardState((prev) => ({
                          ...prev,
                          locationy: newLocY,
                        }))
                        // Buscar en tiempo real
                        if (wizardState.name && wizardState.locationx) {
                          handleSearchRestaurants(
                            wizardState.name,
                            wizardState.locationx,
                            newLocY
                          )
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Sugerencias */}
                {wizardState.suggestions.length > 0 && (
                  <div className="suggestions">
                    <h4>Restaurantes encontrados:</h4>
                    <ul>
                      {wizardState.suggestions.map((rest) => (
                        <li key={rest.id}>
                          <button
                            className="suggestion-btn"
                            onClick={() => handleSelectExistingRestaurant(rest)}
                          >
                            {rest.name} ({rest.locationx}, {rest.locationy})
                            <br />
                            <small>Distancia: {rest.distance?.toFixed(2)}</small>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Crear nuevo */}
                <div className="wizard-actions">
                  <button
                    className="btn-primary"
                    onClick={handleCreateNewRestaurant}
                    disabled={!wizardState.name || !wizardState.locationx || !wizardState.locationy}
                  >
                    ➕ Crear Nuevo Restaurante
                  </button>
                  <button className="btn-secondary" onClick={closeWizard}>
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              // PASO 2: Escribir review
              <div className="wizard-step-2">
                <h3>Paso 2: Escribir Review - {wizardState.name}</h3>

                <div className="form-group">
                  <label>Descripción de tu experiencia</label>
                  <textarea
                    placeholder="Describe tu experiencia en este restaurante..."
                    rows="4"
                    value={wizardState.description}
                    onChange={(e) =>
                      setWizardState((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="form-group">
                  <label>¿Está en tu Top 5?</label>
                  <select
                    value={wizardState.ranking || ''}
                    onChange={(e) =>
                      setWizardState((prev) => ({
                        ...prev,
                        ranking: e.target.value ? parseInt(e.target.value) : null,
                      }))
                    }
                  >
                    <option value="">-- No, está en mi lista general --</option>
                    <option value="1">🥇 #1 - Mi favorito</option>
                    <option value="2">🥈 #2</option>
                    <option value="3">🥉 #3</option>
                    <option value="4">#4</option>
                    <option value="5">#5</option>
                  </select>
                </div>

                <div className="wizard-actions">
                  <button className="btn-primary" onClick={handleSaveReview}>
                    ✅ Guardar Review
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => setWizardStep(1)}
                  >
                    ← Volver
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading & Error states */}
      {fetchLoading && <div className="loading">Cargando...</div>}
      {fetchError && <div className="error">Error: {fetchError}</div>}
    </div>
  )
}

export default Profile