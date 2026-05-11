const db = require("../db")
const jwt = require("jsonwebtoken")

/**
 * ====================================================================
 * HELPERS
 * ====================================================================
 */

/**
 * getUserIdFromToken
 * Extrae el ID del usuario del JWT token en las cookies
 * 
 * Retorna: ID del usuario o null si no hay token válido
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
 * ====================================================================
 * CONTROLADORES - Restaurantes
 * ====================================================================
 */

/**
 * getRestaurantsForUser
 * GET /restaurants/my-restaurants
 * 
 * Obtiene TODOS los restaurantes que el usuario ha revisado (con o sin ranking)
 * 
 * Query: JOIN entre restaurant y restaurant_review
 * Retorna: id, name, locationx, locationy, ranking, description de cada restaurante
 */
const getRestaurantsForUser = (req, res) => {
    const userId = getUserIdFromToken(req)
    if (!userId) return res.status(401).json("Not authenticated")
    
    const q = `
        SELECT r.id, r.name, r.locationx, r.locationy, rr.ranking, rr.description
        FROM restaurant r
        JOIN restaurant_review rr ON r.id = rr.restaurant_id
        WHERE rr.user_id = ?
        ORDER BY rr.updated_at DESC
    `
    
    db.query(q, [userId], (err, data) => {
        if (err) return res.status(500).json(err)
        return res.json(data)
    })
}

// Get top 5 restaurants for current user (ranking 1-5)
const getTopRestaurantsForUser = (req, res) => {
    const userId = getUserIdFromToken(req)
    if (!userId) return res.status(401).json("Not authenticated")
    
    const q = `
        SELECT r.id, r.name, r.locationx, r.locationy, rr.ranking, rr.description
        FROM restaurant r
        JOIN restaurant_review rr ON r.id = rr.restaurant_id
        WHERE rr.user_id = ? AND rr.ranking IS NOT NULL
        ORDER BY rr.ranking ASC
        LIMIT 5
    `
    
    db.query(q, [userId], (err, data) => {
        if (err) return res.status(500).json(err)
        return res.json(data)
    })
}

// Search restaurants by name (fuzzy match) and location (within radius)
const searchRestaurants = (req, res) => {
    const { name, locationx, locationy, radius = 20 } = req.query
    
    if (!name || locationx === undefined || locationy === undefined) {
        return res.status(400).json("Missing query parameters: name, locationx, locationy")
    }
    
    const q = `
        SELECT id, name, locationx, locationy,
               SQRT(POWER(locationx - ?, 2) + POWER(locationy - ?, 2)) AS distance
        FROM restaurant
        WHERE LOWER(name) LIKE LOWER(CONCAT('%', ?, '%'))
        AND SQRT(POWER(locationx - ?, 2) + POWER(locationy - ?, 2)) <= ?
        ORDER BY distance ASC, name ASC
        LIMIT 10
    `
    
    db.query(q, [locationx, locationy, name, locationx, locationy, radius], (err, data) => {
        if (err) return res.status(500).json(err)
        return res.json(data)
    })
}

// Create a new restaurant
const createRestaurant = (req, res) => {
    const userId = getUserIdFromToken(req)
    if (!userId) return res.status(401).json("Not authenticated")
    
    const { name, locationx, locationy } = req.body
    
    if (!name || locationx === undefined || locationy === undefined) {
        return res.status(400).json("Missing fields: name, locationx, locationy")
    }
    
    const q = "INSERT INTO restaurant (name, locationx, locationy, created_by) VALUES (?, ?, ?, ?)"
    const values = [name, locationx, locationy, userId]
    
    db.query(q, values, (err, data) => {
        if (err) return res.status(500).json(err)
        return res.status(201).json({ id: data.insertId, name, locationx, locationy })
    })
}

// Add or update a review for a restaurant
/**
 * addReview
 * POST /restaurants/:restaurantId/reviews
 * Body: { description, ranking, tags: [tagId1, tagId2, ...] }
 * 
 * Crea o actualiza una review para un restaurante
 * TAMBIÉN gestiona las tags asociadas a esa review
 * 
 * PROCESO:
 * 1. Valida que el usuario esté autenticado y que el restaurante exista
 * 2. Si la review ya existe, la actualiza
 * 3. Si no existe, la crea
 * 4. Gestiona las tags:
 *    - Elimina todas las tags anteriores
 *    - Añade las nuevas tags que envió el usuario
 * 
 * Parámetros:
 *   restaurantId: ID del restaurante (en URL)
 *   description: Descripción de la review
 *   ranking: 1-5 o null
 *   tags: Array de tag IDs a asociar con la review
 */
/**
 * addReview
 * POST /restaurants/:restaurantId/reviews
 * Body: { description, ranking, tags: [tagId1, tagId2, ...] }
 * 
 * Crea o actualiza una review para un restaurante
 * TAMBIÉN gestiona las tags asociadas a esa review
 * 
 * PROCESO:
 * 1. Valida que el usuario esté autenticado y que el restaurante exista
 * 2. Si la review ya existe, la actualiza
 * 3. Si no existe, la crea
 * 4. Gestiona las tags:
 *    - Elimina todas las tags anteriores
 *    - Añade las nuevas tags que envió el usuario
 * 
 * Parámetros:
 *   restaurantId: ID del restaurante (en URL)
 *   description: Descripción de la review
 *   ranking: 1-5 o null
 *   tags: Array de tag IDs a asociar con la review
 */
const addReview = (req, res) => {
    const userId = getUserIdFromToken(req)
    if (!userId) return res.status(401).json("Not authenticated")
    
    const { restaurantId } = req.params
    const { description, ranking, tags = [] } = req.body
    
    if (!restaurantId) {
        return res.status(400).json("Missing restaurantId")
    }
    
    // PASO 1: Verificar que el restaurante existe
    const checkQ = "SELECT id FROM restaurant WHERE id = ?"
    db.query(checkQ, [restaurantId], (err, data) => {
        if (err) return res.status(500).json(err)
        if (data.length === 0) return res.status(404).json("Restaurant not found")
        
        // PASO 2: Verificar si la review ya existe
        const reviewCheckQ = "SELECT * FROM restaurant_review WHERE user_id = ? AND restaurant_id = ?"
        db.query(reviewCheckQ, [userId, restaurantId], (err, reviewData) => {
            if (err) return res.status(500).json(err)
            
            if (reviewData.length > 0) {
                // CASO: Review ya existe -> ACTUALIZAR
                const updateQ = "UPDATE restaurant_review SET description = ?, ranking = ? WHERE user_id = ? AND restaurant_id = ?"
                db.query(updateQ, [description, ranking || null, userId, restaurantId], (err) => {
                    if (err) return res.status(500).json(err)
                    
                    // PASO 3: Gestionar tags
                    updateReviewTags(restaurantId, userId, tags, res)
                })
            } else {
                // CASO: Review no existe -> CREAR
                const insertQ = "INSERT INTO restaurant_review (user_id, restaurant_id, description, ranking) VALUES (?, ?, ?, ?)"
                db.query(insertQ, [userId, restaurantId, description, ranking || null], (err) => {
                    if (err) return res.status(500).json(err)
                    
                    // PASO 3: Gestionar tags
                    updateReviewTags(restaurantId, userId, tags, res)
                })
            }
        })
    })
}

/**
 * updateReviewTags
 * Función interna para gestionar las tags de una review
 * 
 * PROCESO:
 * 1. Elimina todas las tags anteriores de esta review
 * 2. Inserta las nuevas tags que el usuario seleccionó
 * 3. Retorna respuesta de éxito
 * 
 * Parámetros:
 *   restaurantId: ID del restaurante
 *   userId: ID del usuario
 *   tags: Array de tag IDs a asociar
 *   res: Objeto response de Express para enviar resultado
 */
const updateReviewTags = (restaurantId, userId, tags, res) => {
    // PASO 1: Eliminar todas las tags anteriores de esta review
    // Para ello necesitamos el ID de la review
    const getReviewIdQ = "SELECT * FROM restaurant_review WHERE user_id = ? AND restaurant_id = ?"
    db.query(getReviewIdQ, [userId, restaurantId], (err, reviewData) => {
        if (err) return res.status(500).json(err)
        if (reviewData.length === 0) return res.status(404).json("Review not found")
        
        const reviewId = reviewData[0].id
        
        // Eliminar todas las tags anteriores
        const deleteTagsQ = "DELETE FROM review_tag WHERE review_id = ?"
        db.query(deleteTagsQ, [reviewId], (err) => {
            if (err) return res.status(500).json(err)
            
            // PASO 2: Si hay tags nuevas, insertarlas
            if (tags && tags.length > 0) {
                // Preparar valores para insert múltiple
                const tagValues = tags.map(tagId => [reviewId, tagId])
                const insertTagsQ = "INSERT INTO review_tag (review_id, tag_id) VALUES ?"
                
                db.query(insertTagsQ, [tagValues], (err) => {
                    if (err) return res.status(500).json(err)
                    return res.status(201).json({ success: true, message: "Review created with tags" })
                })
            } else {
                // No hay tags nuevas
                return res.status(201).json({ success: true, message: "Review created without tags" })
            }
        })
    })
}

// Update only the ranking of a review (for tier list changes in Profile)
const updateReviewRanking = (req, res) => {
    const userId = getUserIdFromToken(req)
    if (!userId) return res.status(401).json("Not authenticated")
    
    const { restaurantId } = req.params
    const { ranking } = req.body
    
    if (!restaurantId) {
        return res.status(400).json("Missing restaurantId")
    }
    
    if (ranking !== null && (ranking < 1 || ranking > 5)) {
        return res.status(400).json("Ranking must be between 1 and 5 or null")
    }
    
    const q = "UPDATE restaurant_review SET ranking = ? WHERE user_id = ? AND restaurant_id = ?"
    db.query(q, [ranking || null, userId, restaurantId], (err, result) => {
        if (err) return res.status(500).json(err)
        if (result.affectedRows === 0) return res.status(404).json("Review not found")
        return res.status(200).json("Ranking updated")
    })
}

module.exports = {
    getRestaurantsForUser,
    getTopRestaurantsForUser,
    searchRestaurants,
    createRestaurant,
    addReview,
    updateReviewRanking
}
