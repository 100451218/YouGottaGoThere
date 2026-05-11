const express = require("express")
const router = express.Router()
const tagsController = require("../controllers/tags")

/**
 * ====================================================================
 * RUTAS - TAGS
 * ====================================================================
 * Todas las rutas para gestionar etiquetas de restaurantes
 */

/**
 * GET /tags
 * Obtiene TODAS las tags disponibles en el sistema
 * Pública (no requiere autenticación)
 * 
 * Ruta completa: GET /tags
 * Respuesta: Array de { id, name }
 */
router.get("/tags", tagsController.getAllTags)

/**
 * POST /tags
 * Crea una nueva tag
 * Body: { name }
 * 
 * Ruta completa: POST /tags
 * Respuesta: { id, name }
 */
router.post("/tags", tagsController.createTag)

/**
 * GET /:restaurantId/reviews/:userId/tags
 * Obtiene las tags de una review específica
 * Requiere autenticación (y ser el propietario de la review)
 * 
 * Ruta completa: GET /restaurants/:restaurantId/reviews/:userId/tags
 * Parámetros:
 *   restaurantId: ID del restaurante
 *   userId: ID del usuario (dueño de la review)
 * 
 * Respuesta: Array de { id, name }
 */
router.get("/:restaurantId/reviews/:userId/tags", tagsController.getTagsForReview)

/**
 * POST /:restaurantId/tags/:tagId
 * Añade una tag a la review del usuario
 * Requiere autenticación
 * 
 * Ruta completa: POST /restaurants/:restaurantId/tags/:tagId
 * Parámetros:
 *   restaurantId: ID del restaurante
 *   tagId: ID de la tag a añadir
 * 
 * Respuesta: { success: true }
 */
router.post("/:restaurantId/tags/:tagId", tagsController.addTagToReview)

/**
 * DELETE /:restaurantId/tags/:tagId
 * Quita una tag de la review del usuario
 * Requiere autenticación
 * 
 * Ruta completa: DELETE /restaurants/:restaurantId/tags/:tagId
 * Parámetros:
 *   restaurantId: ID del restaurante
 *   tagId: ID de la tag a quitar
 * 
 * Respuesta: { success: true }
 */
router.delete("/:restaurantId/tags/:tagId", tagsController.removeTagFromReview)

module.exports = router
