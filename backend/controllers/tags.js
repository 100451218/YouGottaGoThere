const db = require("../db")
const jwt = require("jsonwebtoken")

/**
 * ====================================================================
 * CONTROLADORES - TAGS
 * ====================================================================
 * Funciones para gestionar las etiquetas de restaurantes
 */

/**
 * Helper: Extract user ID from JWT token
 */
const getUserIdFromToken = (req) => {
    const token = req.cookies.access_token
    if (!token) return null
    
    try {
        const decoded = jwt.verify(token, "jwtkey")
        return decoded.id
    } catch (err) {
        return null
    }
}

/**
 * getAllTags
 * GET /tags
 * 
 * Obtiene TODAS las tags disponibles en el sistema
 * No requiere autenticación (son públicas)
 * 
 * Retorna: Array de { id, name } de todas las tags
 */
const getAllTags = (req, res) => {
    const q = "SELECT id, name FROM tags ORDER BY name ASC"
    
    db.query(q, (err, data) => {
        console.log(err)
        if (err) return res.status(500).json(err)
        console.log(data)
        return res.json(data)
    })
}

/**
 * getTagsForReview
 * GET /restaurants/:restaurantId/reviews/:userId/tags
 * 
 * Obtiene las tags asociadas a una review específica de un usuario
 * 
 * NOTA: También retorna información de la review para validaciones
 * 
 * Parámetros:
 *   restaurantId: ID del restaurante (en URL)
 *   userId: ID del usuario (en URL)
 * 
 * Retorna: Array de tags { id, name }
 */
const getTagsForReview = (req, res) => {
    console.log("AAA")
    const userId = getUserIdFromToken(req)
    if (!userId) return res.status(401).json("Not authenticated")
    
    const { restaurantId, reviewUserId } = req.params
    
    // Verificar que el usuario está pidiendo sus propias tags (privacidad)
    if (userId !== parseInt(reviewUserId)) {
        return res.status(403).json("Cannot access other user's tags")
    }
    
    const q = `
        SELECT t.id, t.name
        FROM tags t
        JOIN review_tag rt ON t.id = rt.tag_id
        JOIN restaurant_review rr ON rt.review_id = rr.id
        WHERE rr.user_id = ? AND rr.restaurant_id = ?
        ORDER BY t.name ASC
    `
    
    db.query(q, [userId, restaurantId], (err, data) => {
        console.log(err)
        if (err) return res.status(500).json(err)
        return res.json(data)
    })
}

/**
 * addTagToReview
 * POST /restaurants/:restaurantId/tags/:tagId
 * 
 * Añade una tag específica a la review del usuario para un restaurante
 * 
 * NOTA: Si la relación ya existe, no hace nada (idempotente)
 * 
 * Parámetros:
 *   restaurantId: ID del restaurante (en URL)
 *   tagId: ID de la tag a añadir (en URL)
 * 
 * Retorna: { success: true }
 */
const addTagToReview = (req, res) => {
    const userId = getUserIdFromToken(req)
    if (!userId) return res.status(401).json("Not authenticated")
    console.log("addTagToReview")
    const { restaurantId, tagId } = req.params
    
    // PASO 1: Obtener el ID de la review del usuario
    const getReviewIdQ = "SELECT id FROM restaurant_review WHERE user_id = ? AND restaurant_id = ?"
    db.query(getReviewIdQ, [userId, restaurantId], (err, reviewData) => {
        if (err) return res.status(500).json(err)
        console.log("reviewData",reviewData)
        if (reviewData.length === 0) return res.status(404).json("Review not found")
        
        const reviewId = reviewData[0].id
        
        // PASO 2: Verificar que la tag existe
        const checkTagQ = "SELECT id FROM tags WHERE id = ?"
        db.query(checkTagQ, [tagId], (err, tagData) => {
            if (err) return res.status(500).json(err)
            console.log("tagData", tagData)
            if (tagData.length === 0) return res.status(404).json("Tag not found")
            
            // PASO 3: Insertar la relación (si no existe ya)
            // Usar INSERT IGNORE para que no falle si ya existe
            const insertQ = "INSERT IGNORE INTO review_tag (review_id, tag_id) VALUES (?, ?)"
            db.query(insertQ, [reviewId, tagId], (err) => {
                
                if (err) return res.status(500).json(err)
                return res.status(201).json({ success: true, message: "Tag added to review" })
            })
        })
    })
}

/**
 * removeTagFromReview
 * DELETE /restaurants/:restaurantId/tags/:tagId
 * 
 * Quita una tag específica de la review del usuario para un restaurante
 * 
 * NOTA: Si la relación no existe, no falla (idempotente)
 * 
 * Parámetros:
 *   restaurantId: ID del restaurante (en URL)
 *   tagId: ID de la tag a quitar (en URL)
 * 
 * Retorna: { success: true }
 */
const removeTagFromReview = (req, res) => {
    const userId = getUserIdFromToken(req)
    if (!userId) return res.status(401).json("Not authenticated")
    
    const { restaurantId, tagId } = req.params
    
    // PASO 1: Obtener el ID de la review del usuario
    const getReviewIdQ = "SELECT id FROM restaurant_review WHERE user_id = ? AND restaurant_id = ?"
    db.query(getReviewIdQ, [userId, restaurantId], (err, reviewData) => {
        if (err) return res.status(500).json(err)
        if (reviewData.length === 0) return res.status(404).json("Review not found")
        
        const reviewId = reviewData[0].id
        
        // PASO 2: Eliminar la relación
        const deleteQ = "DELETE FROM review_tag WHERE review_id = ? AND tag_id = ?"
        db.query(deleteQ, [reviewId, tagId], (err) => {
            if (err) return res.status(500).json(err)
            return res.status(200).json({ success: true, message: "Tag removed from review" })
        })
    })
}

/**
 * createTag
 * POST /tags
 * Body: { name }
 * 
 * Crea una nueva tag en el sistema
 * NOTA: Por ahora, solo para administradores (sin validación de rol)
 * 
 * Parámetros:
 *   name: Nombre de la nueva tag (ej: "Vegetariano", "Caro", etc.)
 * 
 * Retorna: { id, name }
 */
const createTag = (req, res) => {
    // TODO: Validar que el usuario sea administrador
    
    const { name } = req.body
    
    if (!name) {
        return res.status(400).json("Missing field: name")
    }
    
    const q = "INSERT INTO tags (name) VALUES (?)"
    db.query(q, [name], (err, data) => {
        if (err) return res.status(500).json(err)
        return res.status(201).json({ id: data.insertId, name })
    })
}

module.exports = {
    getAllTags,
    getTagsForReview,
    addTagToReview,
    removeTagFromReview,
    createTag,
}
