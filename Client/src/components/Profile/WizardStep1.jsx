import PropTypes from 'prop-types'

/**
 * ====================================================================
 * WizardStep1
 * ====================================================================
 * Primer paso del wizard: Buscar o crear restaurante.
 * 
 * RESPONSABILIDADES:
 * 1. Mostrar campos para nombre y coordenadas
 * 2. Buscar restaurantes en tiempo real mientras escribe
 * 3. Mostrar sugerencias (búsqueda)
 * 4. Permitir seleccionar restaurante existente O crear uno nuevo
 * 
 * PROPS:
 * - wizardState: objeto con nombre, locationx, locationy, suggestions
 * - onStateChange: callback para actualizar fields
 * - onSearch: callback para buscar restaurantes
 * - onSelectExisting: callback cuando selecciona un restaurante sugerido
 * - onCreateNew: callback para crear nuevo restaurante
 * - onClose: callback para cancelar
 * 
 * FLUJO:
 * 1. Usuario escribe nombre
 * 2. Si tiene nombre + coordenadas, se buscan restaurantes automáticamente
 * 3. Se muestran las sugerencias
 * 4. Usuario puede:
 *    a) Seleccionar uno de las sugerencias -> ir a paso 2
 *    b) Crear nuevo (con los datos que escribió) -> ir a paso 2
 * 
 * BÚSQUEDA AUTOMÁTICA:
 * - La búsqueda se dispara cada vez que cambia nombre O coordenadas
 * - Solo se busca si están rellenos TODOS los campos
 * - Esto permite encontrar restaurantes cerca del usuario
 */
function WizardStep1({
  wizardState,
  onStateChange,
  onSearch,
  onSelectExisting,
  onCreateNew,
  onClose,
}) {
  /**
   * Manejador: Cambio en el campo "Nombre"
   * 
   * Proceso:
   * 1. Actualiza el estado con el nuevo nombre
   * 2. Si ya tiene coordenadas, dispara una búsqueda automática
   */
  const handleNameChange = (value) => {
    onStateChange('name', value)
    // Solo buscar si tenemos todos los datos
    if (wizardState.locationx && wizardState.locationy) {
      onSearch(value, wizardState.locationx, wizardState.locationy)
    }
  }

  /**
   * Manejador: Cambio en el campo "Localización X"
   * 
   * Proceso:
   * 1. Actualiza el estado con la nueva coordenada X
   * 2. Si ya tiene nombre y Y, dispara una búsqueda automática
   */
  const handleLocXChange = (value) => {
    onStateChange('locationx', value)
    if (wizardState.name && wizardState.locationy) {
      onSearch(wizardState.name, value, wizardState.locationy)
    }
  }

  /**
   * Manejador: Cambio en el campo "Localización Y"
   * 
   * Proceso:
   * 1. Actualiza el estado con la nueva coordenada Y
   * 2. Si ya tiene nombre y X, dispara una búsqueda automática
   */
  const handleLocYChange = (value) => {
    onStateChange('locationy', value)
    if (wizardState.name && wizardState.locationx) {
      onSearch(wizardState.name, wizardState.locationx, value)
    }
  }

  /**
   * Validación del formulario
   * El botón "Crear Nuevo" está deshabilitado hasta que rellene todo
   */
  const isFormValid =
    wizardState.name && wizardState.locationx && wizardState.locationy

  return (
    <div className="wizard-step-1">
      <h3>Paso 1: Buscar o Crear Restaurante</h3>

      {/* ================================================================
          CAMPO: NOMBRE DEL RESTAURANTE
          Dispara búsqueda automática cada vez que el usuario escribe
          ================================================================ */}
      <div className="form-group">
        <label>Nombre del Restaurante</label>
        <input
          type="text"
          placeholder="ej: McDonald's, Italian Place"
          value={wizardState.name}
          onChange={(e) => handleNameChange(e.target.value)}
        />
      </div>

      {/* ================================================================
          CAMPOS: COORDENADAS (X, Y)
          Disparan búsqueda automática junto con el nombre
          ================================================================ */}
      <div className="form-row">
        <div className="form-group">
          <label>Localización X</label>
          <input
            type="number"
            placeholder="ej: 100"
            value={wizardState.locationx}
            onChange={(e) => handleLocXChange(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Localización Y</label>
          <input
            type="number"
            placeholder="ej: 100"
            value={wizardState.locationy}
            onChange={(e) => handleLocYChange(e.target.value)}
          />
        </div>
      </div>

      {/* ================================================================
          SUGERENCIAS: Restaurantes encontrados
          Se muestran cuando la búsqueda retorna resultados
          ================================================================ */}
      {wizardState.suggestions.length > 0 && (
        <div className="suggestions">
          <h4>Restaurantes encontrados:</h4>
          <ul>
            {wizardState.suggestions.map((rest) => (
              <li key={rest.id}>
                {/* Botón para seleccionar este restaurante */}
                <button
                  className="suggestion-btn"
                  onClick={() => onSelectExisting(rest)}
                >
                  {rest.name} ({rest.locationx}, {rest.locationy})
                  <br />
                  {/* Muestra la distancia calculada por la API */}
                  <small>Distancia: {rest.distance?.toFixed(2)}</small>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ================================================================
          ACCIONES: Crear nuevo o Cancelar
          ================================================================ */}
      <div className="wizard-actions">
        {/* Crear nuevo: deshabilitado si falta algún campo */}
        <button
          className="btn-primary"
          onClick={onCreateNew}
          disabled={!isFormValid}
        >
          ➕ Crear Nuevo Restaurante
        </button>
        {/* Cancelar y cerrar el wizard */}
        <button className="btn-secondary" onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

/**
 * ====================================================================
 * PropTypes: Validación de tipos
 * ====================================================================
 */

WizardStep1.propTypes = {
  wizardState: PropTypes.shape({
    name: PropTypes.string,
    locationx: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    locationy: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    suggestions: PropTypes.array,
  }).isRequired,
  onStateChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onSelectExisting: PropTypes.func.isRequired,
  onCreateNew: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default WizardStep1
