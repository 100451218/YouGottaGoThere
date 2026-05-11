import PropTypes from 'prop-types'

/**
 * ====================================================================
 * TierListSection
 * ====================================================================
 * Componente presentacional que muestra la tier list (top 5 restaurantes).
 * 
 * RESPONSABILIDADES:
 * - Renderizar 5 slots (del #1 al #5)
 * - Permitir seleccionar un restaurante para cada slot mediante select
 * - Mostrar información del restaurante seleccionado
 * 
 * PROPS:
 * - userRestaurants: array de restaurantes { id, name, locationx, locationy, ranking, description }
 * - tierSelections: objeto { 1: restaurantId, 2: restaurantId, ... }
 * - onChangeRanking: callback(ranking, restaurantId) cuando cambia un select
 * 
 * COMPONENTES INTERNOS:
 * - TierSlot: Cada uno de los 5 slots del tier list
 * 
 * NOTAS TÉCNICAS:
 * - Este es un componente presentacional (sin lógica de negocio)
 * - No hace API calls directamente
 * - Toda la lógica de cambio está en ProfilePage.jsx
 */
function TierListSection({ userRestaurants, tierSelections, onChangeRanking }) {
  return (
    <section className="tier-list-section">
      <h2>Mi Top 5 Restaurantes</h2>
      <div className="tier-list">
        {/* Renderizar 5 slots, uno por cada ranking */}
        {[1, 2, 3, 4, 5].map((ranking) => (
          <TierSlot
            key={ranking}
            ranking={ranking}
            selectedRestaurantId={tierSelections[ranking]}
            restaurants={userRestaurants}
            onChange={(restaurantId) => onChangeRanking(ranking, restaurantId)}
          />
        ))}
      </div>
    </section>
  )
}

/**
 * ====================================================================
 * TierSlot
 * ====================================================================
 * Sub-componente: Un slot individual del tier list.
 * 
 * RESPONSABILIDADES:
 * - Mostrar un label con el ranking (#1, #2, etc.)
 * - Renderizar un select para elegir restaurante
 * - Mostrar la descripción del restaurante seleccionado
 * - Disparar onChange cuando se selecciona un restaurante
 * 
 * PROPS:
 * - ranking: número 1-5 para este slot
 * - selectedRestaurantId: id del restaurante actualmente seleccionado (o undefined)
 * - restaurants: array de todos los restaurantes disponibles
 * - onChange: callback cuando se selecciona un restaurante
 * 
 * LÓGICA DE SELECT:
 * 1. Si hay un restaurante seleccionado, mostrarlo como opción deshabilitada (para no deseleccionar accidentalmente)
 * 2. Mostrar todas las opciones disponibles excepto la que ya está seleccionada
 * 3. Si hace clic en el restaurante seleccionado, se deselecciona (manejo en ProfilePage)
 */
function TierSlot({ ranking, selectedRestaurantId, restaurants, onChange }) {
  // Buscar el objeto restaurante completo usando el ID
  const selectedRestaurant = restaurants.find((r) => r.id === selectedRestaurantId)

  return (
    <div className="tier-slot">
      {/* Label del ranking: #1, #2, etc. */}
      <label>#{ranking}</label>

      {/* SELECT: Permitir elegir restaurante */}
      <select
        value={selectedRestaurantId || ''}
        onChange={(e) => onChange(parseInt(e.target.value) || null)}
        aria-label={`Selecciona restaurante para ranking ${ranking}`}
      >
        {/* Si no hay restaurante seleccionado, mostrar placeholder */}
        {!selectedRestaurant && (
          <option value="">-- Selecciona un restaurante --</option>
        )}

        {/* Si hay restaurante seleccionado, mostrarlo como opción deshabilitada */}
        {/* Esto previene deselecciones accidentales y muestra claramente cuál está seleccionado */}
        {selectedRestaurant && (
          <option value={selectedRestaurant.id} disabled>
            {selectedRestaurant.name} ({selectedRestaurant.locationx}, {selectedRestaurant.locationy})
          </option>
        )}

        {/* Mostrar todos los restaurantes disponibles EXCEPTO el ya seleccionado */}
        {/* Cuando se selecciona uno, onChange se dispara y ProfilePage maneja el cambio */}
        {restaurants
          .filter((restaurant) => !selectedRestaurant || restaurant.id !== selectedRestaurant.id)
          .map((restaurant) => (
            <option key={restaurant.id} value={restaurant.id}>
              {restaurant.name} ({restaurant.locationx}, {restaurant.locationy})
            </option>
          ))}
      </select>

      {/* Mostrar información del restaurante seleccionado */}
      {/* La descripción viene de la review que escribió el usuario */}
      {selectedRestaurant && (
        <div className="restaurant-info">
          <p className="description">{selectedRestaurant.description}</p>
        </div>
      )}
    </div>
  )
}

/**
 * ====================================================================
 * PropTypes: Validación de tipos
 * ====================================================================
 * React verificará que los props sean del tipo correcto en desarrollo
 * y mostrará warnings en la consola si hay errores.
 */TierListSection.propTypes = {
  userRestaurants: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      ranking: PropTypes.number,
    })
  ).isRequired,
  tierSelections: PropTypes.objectOf(PropTypes.number).isRequired,
  onChangeRanking: PropTypes.func.isRequired,
}

TierSlot.propTypes = {
  ranking: PropTypes.number.isRequired,
  selectedRestaurantId: PropTypes.number,
  restaurants: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default TierListSection
