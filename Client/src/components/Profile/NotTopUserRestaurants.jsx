import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import TagsManager from './TagsManager'

/**
 * ====================================================================
 * NotTopUserRestaurants
 * ====================================================================
 * Componente presentacional que muestra restaurantes sin ranking (no están en el top 5).
 * 
 * RESPONSABILIDADES:
 * - Filtrar y mostrar solo restaurantes con ranking = null
 * - Mostrar un select para asignarles ranking
 * - Integrar TagsManager para editar tags de cada restaurante
 * - Disparar callback cuando se cambia el ranking
 * 
 * PROPS:
 * - restaurants: array de todos los restaurantes del usuario
 * - onChangeRanking: callback(ranking, id) cuando se selecciona un ranking
 * - fetchRequest: función para hacer API calls (para TagsManager)
 * 
 * ESTRUCTURA:
 * Para cada restaurante sin ranking:
 * 1. Nombre y select para ranking
 * 2. TagsManager para editar tags
 * 3. Estilos CSS para mejor presentación
 * 
 * TODO FUTURO:
 * - Añadir descripción de la review
 * - Expandir/contraer restaurante
 * - Ver más detalles
 */
function NotTopUserRestaurants({ restaurants, onChangeRanking, fetchRequest }) {
  // Estado: Expandir/contraer restaurante
  const [expandedRestaurants, setExpandedRestaurants] = useState(new Set())

  /**
   * Manejador de cambio de ranking
   * 
   * @param {string} ranking - Valor del select ('1', '2', '3', '4', '5', o '')
   * @param {number} id - ID del restaurante
   * 
   * Validación:
   * - Solo llamar a onChangeRanking si hay ranking e ID
   * - Si el usuario selecciona "no top", ranking será ''
   */
  function onRankRestaurant(ranking, id) {
    console.log('restaurant', id, 'is now rated', ranking)
    if (ranking && id) {
      onChangeRanking(ranking, id)
    }
  }

  /**
   * toggleExpanded
   * Expande/contrae un restaurante para mostrar más detalles
   * (Ej: tags)
   */
  const toggleExpanded = (restaurantId) => {
    const newExpanded = new Set(expandedRestaurants)
    if (newExpanded.has(restaurantId)) {
      newExpanded.delete(restaurantId)
    } else {
      newExpanded.add(restaurantId)
    }
    setExpandedRestaurants(newExpanded)
  }

  // Filtrar restaurantes sin ranking
  const restaurantesNoRanked = restaurants.filter(
    (restaurant) => restaurant.ranking == null
  )


  return (
    <section className="not-top-restaurants-section">
      <h2>Otros Restaurantes</h2>
      
      {restaurantesNoRanked.length === 0 ? (
        <p className="no-restaurants-message">
          ¡Todos tus restaurantes están en el top 5! 🎉
        </p>
      ) : (
        <ul className="not-top-restaurants-list">
          {restaurantesNoRanked.map((restaurant) => (
            <li key={restaurant.id} className="restaurant-item">
              {/* ============================================================
                  FILA 1: Nombre, Select y Botón expandir
                  ============================================================ */}
              <div className="restaurant-header">
                <div className="restaurant-name-section">
                  <span className="restaurant-name">{restaurant.name}</span>
                  <span className="restaurant-location">
                    ({restaurant.locationx}, {restaurant.locationy})
                  </span>
                </div>

                {/* Select para asignar ranking */}
                <select
                  value=""
                  onChange={(e) => onRankRestaurant(e.target.value, restaurant.id)}
                  className="ranking-select"
                  title="Añadir a Top 5"
                >
                  <option value="">➕ Añadir a Top 5</option>
                  <option value="1">🥇 #1 - Mi favorito</option>
                  <option value="2">🥈 #2</option>
                  <option value="3">🥉 #3</option>
                  <option value="4">#4</option>
                  <option value="5">#5</option>
                </select>

                {/* Botón para expandir/contraer */}
                <button
                  className="expand-btn"
                  onClick={() => toggleExpanded(restaurant.id)}
                  title={expandedRestaurants.has(restaurant.id) ? 'Contraer' : 'Expandir'}
                >
                  {expandedRestaurants.has(restaurant.id) ? '▼' : '▶'}
                </button>
              </div>

              {/* ============================================================
                  FILA 2: Descripción de la review (si está expandido)
                  ============================================================ */}
              {expandedRestaurants.has(restaurant.id) && (
                <div className="restaurant-details">
                  {/* Descripción de la review */}
                  {restaurant.description && (
                    <div className="review-description">
                      <p className="description-text">{restaurant.description}</p>
                    </div>
                  )}

                  {/* Gestor de tags (NUEVO) */}
                  {fetchRequest && (
                    <div className="tags-manager-wrapper">
                      <TagsManager
                        restaurantId={restaurant.id}
                        restaurantName={restaurant.name}
                        initialTags={restaurant.tags || []}
                        onTagsUpdated={(newTags) => {
                          console.log('Tags updated:', newTags)
                        }}
                        fetchRequest={fetchRequest}
                      />
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/**
 * ====================================================================
 * PropTypes: Validación de tipos
 * ====================================================================
 */
NotTopUserRestaurants.propTypes = {
  restaurants: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      locationx: PropTypes.number.isRequired,
      locationy: PropTypes.number.isRequired,
      ranking: PropTypes.number,
      description: PropTypes.string,
      tags: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number,
          name: PropTypes.string,
        })
      ),
    })
  ).isRequired,
  onChangeRanking: PropTypes.func.isRequired,
  fetchRequest: PropTypes.func,
}



export default NotTopUserRestaurants