const db = require("../db")
const bcrypt = require("bcrypt")
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

const getRecomendationsForUser = async (req, res) => {
    const userId = getUserIdFromToken(req)
    if (!userId) return res.status(401).json("Not authenticated")
    console.log("Get Recomendations for user", userId)
}



module.exports = {
    getRecomendationsForUser,
}