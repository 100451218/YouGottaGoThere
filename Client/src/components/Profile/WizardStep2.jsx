import { useState } from 'react'
import PropTypes from 'prop-types'
import { useFetch } from '../../hooks/useFetch'
import { useTags } from '../../hooks/useTags'

/**
 * ====================================================================
 * WizardStep2
 * ====================================================================
 * Segundo paso del wizard: Escribir review, seleccionar ranking y tags.
 * 
 * RESPONSABILIDADES:
 * 1. Mostrar campo de texto para la review/descripción
 * 2. Mostrar select para elegir ranking (Top 5 o no)
 * 3. Mostrar selector de tags
 * 4. Permitir guardar la review completa o volver atrás
 * 
 * PROPS:
 * - wizardState: objeto con name, description, ranking, tags
 * - onStateChange: callback para actualizar fields
 * - onSave: callback para guardar todo a la base de datos
 * - onBack: callback para volver al paso 1
 * 
 * SISTEMA DE TAGS:
 * - Usa el hook useTags para cargar todas las tags disponibles
 * - Muestra checkboxes para seleccionar múltiples tags
 * - Guarda los IDs de tags seleccionados en wizardState.tags
 * - Los tags se relacionan con la review en la BD via API
 */
function WizardStep2({ wizardState, onStateChange, onSave, onBack }) {
  // Hook para fetch autenticado
  const { fetchRequest } = useFetch()

  // Hook personalizado que carga todas las tags disponibles
  const { allTags, loading: loadingTags } = useTags(fetchRequest)

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
          <div className="tags-container" >
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
