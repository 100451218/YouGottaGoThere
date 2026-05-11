import PropTypes from 'prop-types'

/**
 * ====================================================================
 * AddRestaurantSection
 * ====================================================================
 * Componente presentacional simple que muestra:
 * 1. Un heading "Mis Restaurantes"
 * 2. Contador total de restaurantes visitados
 * 3. Botón para abrir el wizard de crear restaurante
 * 
 * RESPONSABILIDADES:
 * - Solo mostrar información y disparar el callback cuando se presiona el botón
 * 
 * PROPS:
 * - restaurantCount: número total de restaurantes que ha revisado el usuario
 * - onAddClick: callback cuando se presiona el botón de añadir
 * 
 * NOTAS:
 * - Componente muy simple, sin estado interno
 * - No hace API calls
 * - La lógica está 100% en ProfilePage.jsx
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
