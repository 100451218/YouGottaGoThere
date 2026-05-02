import PropTypes from 'prop-types'

/**
 * TierListSection
 * Componente presentacional que muestra la tier list (top 5 restaurantes)
 *
 * Props:
 * - userRestaurants: array de restaurantes del usuario
 * - tierSelections: objeto con las selecciones actuales (ranking -> restaurantId)
 * - onChangeRanking: callback cuando cambia la selección de un slot
 */
function TierListSection({ userRestaurants, tierSelections, onChangeRanking }) {
  return (
    <section className="tier-list-section">
      <h2>Mi Top 5 Restaurantes</h2>
      <div className="tier-list">
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
 * TierSlot
 * Sub-componente: un slot individual de la tier list
 */
function TierSlot({ ranking, selectedRestaurantId, restaurants, onChange }) {
  const selectedRestaurant = restaurants.find((r) => r.id === selectedRestaurantId)

  return (
    <div className="tier-slot">
      <label>#{ranking}</label>
      <select
        value={selectedRestaurantId || ''}
        onChange={(e) => onChange(parseInt(e.target.value) || null)}
        aria-label={`Selecciona restaurante para ranking ${ranking}`}
      >
        {!selectedRestaurant && (
          <option value="">-- Selecciona un restaurante --</option>
        )}

        {selectedRestaurant && (
          <option value={selectedRestaurant.id} disabled>
            {selectedRestaurant.name} ({selectedRestaurant.locationx}, {selectedRestaurant.locationy})
          </option>
        )}

        {restaurants
          .filter((restaurant) => !selectedRestaurant || restaurant.id !== selectedRestaurant.id)
          .map((restaurant) => (
            <option key={restaurant.id} value={restaurant.id}>
              {restaurant.name} ({restaurant.locationx}, {restaurant.locationy})
            </option>
          ))}
      </select>

      {selectedRestaurant && (
        <div className="restaurant-info">
          <p className="description">{selectedRestaurant.description}</p>
        </div>
      )}
    </div>
  )
}

// PropTypes para validación
TierListSection.propTypes = {
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
