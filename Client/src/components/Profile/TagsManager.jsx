import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useTags } from '../../hooks/useTags'

/**
 * ====================================================================
 * TagsManager
 * ====================================================================
 * Componente para gestionar las tags de una review desde la vista Profile.
 * 
 * RESPONSABILIDADES:
 * 1. Mostrar las tags actuales de una review
 * 2. Permitir quitar tags rápidamente (hover + X)
 * 3. Mostrar un botón para abrir modal de búsqueda/añadir tags
 * 4. Hacer API calls para añadir/quitar tags
 * 
 * PROPS:
 * - restaurantId: ID del restaurante
 * - restaurantName: Nombre del restaurante (solo para mostrar)
 * - initialTags: Array de tags actuales { id, name }
 * - onTagsUpdated: callback cuando se actualizen las tags
 * - fetchRequest: función para hacer API calls
 * 
 * FLUJO:
 * 1. Carga las tags disponibles de la BD (via hook useTags)
 * 2. Muestra las tags actuales como chips/badges
 * 3. Al pasar ratón sobre una tag, muestra una X
 * 4. Clic en X quita la tag (API call)
 * 5. Botón "+" abre modal de búsqueda
 * 6. En el modal, busca tags y añade nuevas
 * 
 * NOTAS TÉCNICAS:
 * - Usa hook useTags para cargar todas las tags disponibles
 * - Usa state para tags actuales
 * - Las tags actuales se pueden quitar rápidamente
 * - Las nuevas se añaden desde el modal de búsqueda
 */
function TagsManager({ restaurantId, restaurantName, initialTags = [], onTagsUpdated, fetchRequest }) {
  // Hook personalizado que carga todas las tags disponibles
  const { allTags, loading } = useTags(fetchRequest)

  // Estado: Tags actuales de esta review
  const [currentTags, setCurrentTags] = useState(initialTags)
  
  // Estado: Modal para añadir tags
  const [showAddModal, setShowAddModal] = useState(false)
  
  // Estado: Búsqueda dentro del modal
  const [searchQuery, setSearchQuery] = useState('')
  
  // Estado: Tags que no están ya seleccionadas (para mostrar en la búsqueda)
  const [availableTags, setAvailableTags] = useState([])

  // Sincronizar cuando cambien las tags iniciales
  useEffect(() => {
    setCurrentTags(initialTags)
  }, [initialTags])

  // Actualizar lista de tags disponibles cuando cambien las actuales o todas
  useEffect(() => {
    updateAvailableTags()
  }, [currentTags, allTags, searchQuery])

  const updateAvailableTags = () => {
    const currentTagIds = currentTags.map(t => t.id)
    const filtered = allTags
      .filter(tag => !currentTagIds.includes(tag.id))
      .filter(tag => 
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    setAvailableTags(filtered)
  }

  /**
   * handleRemoveTag
   * El usuario hace clic en la X de una tag para quitarla
   * 
   * Proceso:
   * 1. Llama a API para quitar la tag
   * 2. Si éxito, actualiza estado local
   * 3. Notifica al padre con callback
   * 
   * Parámetro: tagId (número)
   */
  const handleRemoveTag = async (tagId) => {
    try {
      const result = await fetchRequest(
        `/restaurants/${restaurantId}/tags/${tagId}`,
        { method: 'DELETE' }
      )
      
      if (result.success) {
        const updated = currentTags.filter(t => t.id !== tagId)
        setCurrentTags(updated)
        onTagsUpdated(updated)
      }
    } catch (error) {
      console.error('Error removing tag:', error)
    }
  }

  /**
   * handleAddTag
   * El usuario hace clic en una tag disponible en el modal para añadirla
   * 
   * Proceso:
   * 1. Llama a API para añadir la tag
   * 2. Si éxito, actualiza estado local
   * 3. Limpia el campo de búsqueda
   * 4. Notifica al padre con callback
   * 
   * Parámetro: tag (objeto { id, name })
   */
  const handleAddTag = async (tag) => {
    try {
      console.log("Add tag to ", restaurantId, " adding tag", tag.id)
      const result = await fetchRequest(
        `/restaurants/${restaurantId}/tags/${tag.id}`,
        { method: 'POST' }
      )
      console.log(result)
      
      if (result.success) {
        const updated = [...currentTags, tag]
        setCurrentTags(updated)
        setSearchQuery('')
        onTagsUpdated(updated)
      }
    } catch (error) {
      console.error('Error adding tag:', error)
    }
  }

  return (
    <div className="tags-manager">
      {/* ================================================================
          SECCIÓN: Tags actuales
          Muestra las tags como chips/badges con opción de quitar
          ================================================================ */}
      <div className="tags-section">
        <div className="tags-list">
          {currentTags.length === 0 ? (
            <p className="no-tags">Sin etiquetas</p>
          ) : (
            currentTags.map((tag) => (
              <div key={tag.id} className="tag-chip">
                {/* Nombre de la tag */}
                <span className="tag-name">{tag.name}</span>
                
                {/* Botón X para quitar (aparece al hover) */}
                <button
                  className="tag-remove"
                  onClick={() => handleRemoveTag(tag.id)}
                  aria-label={`Quitar etiqueta ${tag.name}`}
                  title="Quitar etiqueta"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* Botón para abrir modal de añadir tags */}
        <button
          className="btn-add-tags"
          onClick={() => setShowAddModal(true)}
          disabled={loading}
        >
          ➕ Añadir Etiqueta
        </button>
      </div>

      {/* ================================================================
          MODAL: Búsqueda y selección de nuevas tags
          ================================================================ */}
      {showAddModal && (
        <div className="tags-modal-overlay">
          <div className="tags-modal">
            {/* Encabezado */}
            <div className="modal-header">
              <h4>Añadir Etiqueta a {restaurantName}</h4>
              <button
                className="close-btn"
                onClick={() => {
                  setShowAddModal(false)
                  setSearchQuery('')
                }}
              >
                ✕
              </button>
            </div>

            {/* Búsqueda */}
            <div className="modal-search">
              <input
                type="text"
                placeholder="Buscar etiqueta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>

            {/* Lista de tags disponibles */}
            <div className="modal-content">
              {availableTags.length === 0 ? (
                <p className="no-results">
                  {allTags.length === 0 
                    ? 'No hay etiquetas disponibles'
                    : 'No se encontraron etiquetas'}
                </p>
              ) : (
                <ul className="available-tags-list">
                  {availableTags.map((tag) => (
                    <li key={tag.id}>
                      <button
                        className="tag-option"
                        onClick={() => handleAddTag(tag)}
                      >
                        {tag.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * ====================================================================
 * PropTypes: Validación de tipos
 * ====================================================================
 */
TagsManager.propTypes = {
  restaurantId: PropTypes.number.isRequired,
  restaurantName: PropTypes.string.isRequired,
  initialTags: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  onTagsUpdated: PropTypes.func.isRequired,
  fetchRequest: PropTypes.func.isRequired,
}

export default TagsManager
