import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

/**
 * ====================================================================
 * WizardStep2
 * ====================================================================
 * Segundo paso del wizard: Escribir review, seleccionar ranking y tags.
 * 
 * RESPONSABILIDADES:
 * 1. Mostrar campo de texto para la review/descripción
 * 2. Mostrar select para elegir ranking (Top 5 o no)
 * 3. Mostrar selector de tags (NUEVO)
 * 4. Permitir guardar la review completa o volver atrás
 * 
 * PROPS:
 * - wizardState: objeto con name, description, ranking, tags
 * - onStateChange: callback para actualizar fields
 * - onSave: callback para guardar todo a la base de datos
 * - onBack: callback para volver al paso 1
 * 
 * NUEVO: Sistema de Tags
 * - Carga todas las tags disponibles de la BD
 * - Muestra checkboxes para seleccionar múltiples tags
 * - Guarda los IDs de tags seleccionados en wizardState.tags
 * - Los tags se relacionan con la review en la BD
 */
function WizardStep2({ wizardState, onStateChange, onSave, onBack }) {
  // Estado para almacenar todas las tags disponibles
  const [allTags, setAllTags] = useState([])
  const [loadingTags, setLoadingTags] = useState(false)

  // Cargar tags cuando se monta el componente
  useEffect(() => {
    loadAvailableTags()
  }, [])

  /**
   * loadAvailableTags
   * API Call: GET /tags
   * 
   * Obtiene todas las tags disponibles de la BD
   * Las muestra como checkboxes para que el usuario pueda seleccionar
   */
  const loadAvailableTags = async () => {
    setLoadingTags(true)
    try {
      // TODO: Cambiar esto cuando el endpoint esté disponible
      // Por ahora, hardcodeamos algunas tags de ejemplo
      // const response = await fetch('/tags')
      // const data = await response.json()
      // setAllTags(data)
      
      // Tags de ejemplo
      setAllTags([
        { id: 1, name: 'Comida rápida' },
        { id: 2, name: 'Italiano' },
        { id: 3, name: 'Asiático' },
        { id: 4, name: 'Mexicano' },
        { id: 5, name: 'Vegano' },
        { id: 6, name: 'Caro' },
        { id: 7, name: 'Barato' },
        { id: 8, name: 'Buena atención' },
      ])
    } finally {
      setLoadingTags(false)
    }
  }

  /**
   * handleTagToggle
   * Llamado cuando el usuario marca/desmarca un tag
   * 
   * Proceso:
   * 1. Si el tag está marcado, lo añade a wizardState.tags
   * 2. Si está desmarcado, lo quita
   * 3. Dispara onStateChange para actualizar el estado padre
   * 
   * Parámetro: tagId (número)
   */
  const handleTagToggle = (tagId) => {
    const currentTags = wizardState.tags || []
    const isSelected = currentTags.includes(tagId)
    
    let newTags
    if (isSelected) {
      // Si está seleccionado, quitarlo
      newTags = currentTags.filter(id => id !== tagId)
    } else {
      // Si no está seleccionado, añadirlo
      newTags = [...currentTags, tagId]
    }
    
    onStateChange('tags', newTags)
  }

  return (
    <div className="wizard-step-2">
      <h3>Paso 2: Escribir Review - {wizardState.name}</h3>

      {/* ================================================================
          SECCIÓN 1: DESCRIPCIÓN DE LA REVIEW
          ================================================================ */}
      <div className="form-group">
        <label>Descripción de tu experiencia</label>
        <textarea
          placeholder="Describe tu experiencia en este restaurante..."
          rows="4"
          value={wizardState.description}
          onChange={(e) => onStateChange('description', e.target.value)}
        />
      </div>

      {/* ================================================================
          SECCIÓN 2: RANKING (¿ESTÁ EN EL TOP 5?)
          ================================================================ */}
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

      {/* ================================================================
          SECCIÓN 3: TAGS (NUEVO)
          Permite seleccionar múltiples características del restaurante
          ================================================================ */}
      <div className="form-group tags-section">
        <label>Etiquetas del restaurante</label>
        <p className="section-description">
          Selecciona las etiquetas que mejor describen este restaurante
        </p>
        
        {loadingTags ? (
          <p className="loading">Cargando etiquetas...</p>
        ) : (
          <div className="tags-container">
            {allTags.map((tag) => (
              <label key={tag.id} className="tag-checkbox">
                <input
                  type="checkbox"
                  checked={(wizardState.tags || []).includes(tag.id)}
                  onChange={() => handleTagToggle(tag.id)}
                />
                <span className="tag-label">{tag.name}</span>
              </label>
            ))}
          </div>
        )}

        {/* Mostrar etiquetas seleccionadas (feedback visual) */}
        {(wizardState.tags || []).length > 0 && (
          <div className="selected-tags-preview">
            <p><strong>Etiquetas seleccionadas:</strong></p>
            <div className="tags-list">
              {(wizardState.tags || []).map((tagId) => {
                const tag = allTags.find(t => t.id === tagId)
                return tag ? (
                  <span key={tagId} className="selected-tag">
                    {tag.name}
                  </span>
                ) : null
              })}
            </div>
          </div>
        )}
      </div>

      {/* ================================================================
          ACCIONES: Guardar o Volver
          ================================================================ */}
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

/**
 * ====================================================================
 * PropTypes: Validación de tipos
 * ====================================================================
 */

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
