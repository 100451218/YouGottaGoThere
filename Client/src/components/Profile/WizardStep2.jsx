import PropTypes from 'prop-types'

/**
 * WizardStep2
 * Paso 2 del wizard: escribir review y seleccionar ranking
 *
 * Props:
 * - wizardState: estado del wizard
 * - onStateChange: callback para cambiar estado
 * - onSave: callback para guardar review
 * - onBack: callback para volver al paso 1
 */
function WizardStep2({ wizardState, onStateChange, onSave, onBack }) {
  return (
    <div className="wizard-step-2">
      <h3>Paso 2: Escribir Review - {wizardState.name}</h3>

      <div className="form-group">
        <label>Descripción de tu experiencia</label>
        <textarea
          placeholder="Describe tu experiencia en este restaurante..."
          rows="4"
          value={wizardState.description}
          onChange={(e) => onStateChange('description', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>¿Está en tu Top 5?</label>
        <select
          value={wizardState.ranking || ''}
          onChange={(e) =>
            onStateChange('ranking', e.target.value ? parseInt(e.target.value) : null)
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
        <button className="btn-primary" onClick={onSave}>
          ✅ Guardar Review
        </button>
        <button className="btn-secondary" onClick={onBack}>
          ← Volver
        </button>
      </div>
    </div>
  )
}

WizardStep2.propTypes = {
  wizardState: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    ranking: PropTypes.number,
  }).isRequired,
  onStateChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
}

export default WizardStep2
