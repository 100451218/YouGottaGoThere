import PropTypes from 'prop-types'

/**
 * WizardStep1
 * Paso 1 del wizard: buscar o crear restaurante
 *
 * Props:
 * - wizardState: estado del wizard
 * - onStateChange: callback para cambiar estado
 * - onSearch: callback para buscar restaurantes
 * - onSelectExisting: callback para seleccionar restaurante existente
 * - onCreateNew: callback para crear nuevo restaurante
 * - onClose: callback para cerrar wizard
 */
function WizardStep1({
  wizardState,
  onStateChange,
  onSearch,
  onSelectExisting,
  onCreateNew,
  onClose,
}) {
  const handleNameChange = (value) => {
    onStateChange('name', value)
    if (wizardState.locationx && wizardState.locationy) {
      onSearch(value, wizardState.locationx, wizardState.locationy)
    }
  }

  const handleLocXChange = (value) => {
    onStateChange('locationx', value)
    if (wizardState.name && wizardState.locationy) {
      onSearch(wizardState.name, value, wizardState.locationy)
    }
  }

  const handleLocYChange = (value) => {
    onStateChange('locationy', value)
    if (wizardState.name && wizardState.locationx) {
      onSearch(wizardState.name, wizardState.locationx, value)
    }
  }

  const isFormValid =
    wizardState.name && wizardState.locationx && wizardState.locationy

  return (
    <div className="wizard-step-1">
      <h3>Paso 1: Buscar o Crear Restaurante</h3>

      <div className="form-group">
        <label>Nombre del Restaurante</label>
        <input
          type="text"
          placeholder="ej: McDonald's, Italian Place"
          value={wizardState.name}
          onChange={(e) => handleNameChange(e.target.value)}
        />
      </div>

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

      {/* Sugerencias */}
      {wizardState.suggestions.length > 0 && (
        <div className="suggestions">
          <h4>Restaurantes encontrados:</h4>
          <ul>
            {wizardState.suggestions.map((rest) => (
              <li key={rest.id}>
                <button
                  className="suggestion-btn"
                  onClick={() => onSelectExisting(rest)}
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

      {/* Acciones */}
      <div className="wizard-actions">
        <button
          className="btn-primary"
          onClick={onCreateNew}
          disabled={!isFormValid}
        >
          ➕ Crear Nuevo Restaurante
        </button>
        <button className="btn-secondary" onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

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
