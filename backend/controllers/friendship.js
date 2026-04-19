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

const friendshipRequest = async (req, res) => {
    console.log("Friendship request start", req.body)
    const { name } = req.body
    const userId = getUserIdFromToken(req)
    if (!userId) return res.status(401).json("Not authenticated")
    
    console.log("Friendship request username to add", name)
    const q = "SELECT id FROM user WHERE username = ?"
    db.query(q, [name], (err, data) => {
        if (err) return res.status(500).json(err)
        if (data.length === 0) return res.status(404).json("User not found")
        
        const userBId = data[0].id
        console.log("User A (sender):", userId, "User B (target):", userBId)
        if (userId === userBId) return res.status(400).json("You cannot add yourself as a friend")
        
        const minId = Math.min(userId, userBId)
        const maxId = Math.max(userId, userBId)
        console.log("Min ID:", minId, "Max ID:", maxId)
        
        // Check if friendship exists
        const q2 = "SELECT * FROM friendship WHERE user_id_1 = ? AND user_id_2 = ?"
        db.query(q2, [minId, maxId], (err2, data2) => {
            if (err2) return res.status(500).json(err2)
            console.log("Existing friendship data:", data2)
            
            if (data2.length === 0) {
                // No friendship exists, create pending request
                console.log("No friendship found, creating new request")
                const q3 = "INSERT INTO friendship (user_id_1, user_id_2, status) VALUES (?, ?, 'pending')"
                db.query(q3, [minId, maxId], (err3, result) => {
                    if (err3) return res.status(500).json(err3)
                    console.log("Friend request inserted, result:", result)
                    res.json("Friend request sent")
                })
            } else {
                const friendship = data2[0]
                console.log("Friendship status:", friendship.status, "Initiator:", friendship.user_id_1 === userId ? "A" : "B")
                if (friendship.status === 'accepted') {
                    res.json("You are already friends")
                } else if (friendship.status === 'pending') {
                    if (friendship.user_id_1 === userId) {
                        // A sent to B, already sent
                        console.log("Already sent request")
                        res.json("You have already sent a friend request")
                    } else {
                        // B sent to A, accept
                        console.log("Accepting request from B")
                        const q4 = "UPDATE friendship SET status = 'accepted' WHERE id = ?"
                        db.query(q4, [friendship.id], (err4, result) => {
                            if (err4) return res.status(500).json(err4)
                            console.log("Friend request accepted, result:", result)
                            res.json("Friend request accepted, you are now friends")
                        })
                    }
                } else {
                    res.status(400).json("Invalid friendship status")
                }
            }
        })
    })
}


const acceptFriendship = async(req,res) => {
    console.log("accept", req, res)
}

module.exports = {
    friendshipRequest,
    acceptFriendship,
}