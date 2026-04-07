import PropTypes from 'prop-types'

/**
 * AddRestaurantSection
 * Componente presentacional para mostrar botón de añadir restaurante
 *
 * Props:
 * - restaurantCount: número total de restaurantes
 * - onAddClick: callback cuando se presiona el botón
 */
function AddRestaurantSection({ restaurantCount, onAddClick }) {
  return (
    <section className="add-restaurant-section">
      <h2>Mis Restaurantes</h2>
      <p>Total restaurantes visitados: {restaurantCount}</p>
      <button className="btn-add" onClick={onAddClick}>
        ➕ Añadir Nuevo Restaurante
      </button>
    </section>
  )
}

AddRestaurantSection.propTypes = {
  restaurantCount: PropTypes.number.isRequired,
  onAddClick: PropTypes.func.isRequired,
}

export default AddRestaurantSection
