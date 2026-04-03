const db = require("../db")
const jwt = require("jsonwebtoken")

// Helper: Extract user ID from JWT token
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

// Get all restaurants that the current user has reviewed
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
const addReview = (req, res) => {
    const userId = getUserIdFromToken(req)
    if (!userId) return res.status(401).json("Not authenticated")
    
    const { restaurantId } = req.params
    const { description, ranking } = req.body
    
    if (!restaurantId) {
        return res.status(400).json("Missing restaurantId")
    }
    
    // Check if restaurant exists
    const checkQ = "SELECT id FROM restaurant WHERE id = ?"
    db.query(checkQ, [restaurantId], (err, data) => {
        if (err) return res.status(500).json(err)
        if (data.length === 0) return res.status(404).json("Restaurant not found")
        
        // Check if review already exists
        const reviewCheckQ = "SELECT * FROM restaurant_review WHERE user_id = ? AND restaurant_id = ?"
        db.query(reviewCheckQ, [userId, restaurantId], (err, reviewData) => {
            if (err) return res.status(500).json(err)
            
            if (reviewData.length > 0) {
                // Update existing review
                const updateQ = "UPDATE restaurant_review SET description = ?, ranking = ? WHERE user_id = ? AND restaurant_id = ?"
                db.query(updateQ, [description, ranking || null, userId, restaurantId], (err) => {
                    if (err) return res.status(500).json(err)
                    return res.status(200).json("Review updated")
                })
            } else {
                // Insert new review
                const insertQ = "INSERT INTO restaurant_review (user_id, restaurant_id, description, ranking) VALUES (?, ?, ?, ?)"
                db.query(insertQ, [userId, restaurantId, description, ranking || null], (err) => {
                    if (err) return res.status(500).json(err)
                    return res.status(201).json("Review created")
                })
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
