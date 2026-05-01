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
        
        // Check if friendship exists in either direction
        const q2 = "SELECT * FROM friendship WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)"
        db.query(q2, [userId, userBId, userBId, userId], (err2, data2) => {
            if (err2) return res.status(500).json(err2)
            console.log("Existing friendship data:", data2)
            
            if (data2.length === 0) {
                // No friendship exists, create pending request with userId as user_id_1
                console.log("No friendship found, creating new request")
                const q3 = "INSERT INTO friendship (user_id_1, user_id_2, status) VALUES (?, ?, 'pending')"
                db.query(q3, [userId, userBId], (err3, result) => {
                    console.log(err3)
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
                        // userId is the one who sent the request
                        console.log("Already sent request")
                        res.json("You have already sent a friend request")
                    } else {
                        // userBId sent to userId, accept the request
                        console.log("Accepting request from", userBId)
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
    console.log("accept friendship", req, res)
    const {userId} = req.body
    const activeUserId = getUserIdFromToken(req)
    if (!activeUserId) return res.status(401).json("Not authenticated")

    console.log("Friendship accepted between user", activeUserId, " and ", userId)
    if (activeUserId===userId) return res.status(400).json("You cannot add yourself as a friend")

    // We want to 1st verify that the friendship that was accepted exists and it is actually pending
    const query1 = "SELECT id FROM friendship where ((user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?) AND status = 'pending')"
    db.query(query1, [activeUserId, userId, userId, activeUserId], (err1, data1) => {
        if (err1) return res.status(500).json(err1)
        friendship = data1[0]
        if (!friendship) return res.status(500).json(err1)
        console.log("Friendship exists", data1)
        const query2 = "UPDATE friendship SET status = 'accepted' WHERE id = ?"
        db.query(query2, [friendship.id], (err2, result) => {
            if (err2) return res.status(500).json(err2)
            console.log("Friend request accepted, result:", result)
            res.json("Friend request accepted, you are now friends")
        })
    })


}

const deleteFriendship = async(req,res) => {
    console.log("delete friendship", req, res)
    const {userId} = req.body
    const activeUserId = getUserIdFromToken(req)
    if (!activeUserId) return res.status(401).json("Not authenticated")

    console.log("Friendship deleted between user", activeUserId, " and ", userId)
    if (activeUserId===userId) return res.status(400).json("You cannot delete yourself as a friend")

    // We want to 1st verify that the friendship that was deleted exists and it is actually accepted
    const query1 = "SELECT id FROM friendship where ((user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?) AND status = 'accepted')"
    db.query(query1, [activeUserId, userId, userId, activeUserId], (err1, data1) => {
        if (err1) return res.status(500).json(err1)
        friendship = data1[0]
        if (!friendship) return res.status(500).json(err1)
        console.log("Friendship exists", data1)
        const query2 = "DELETE FROM friendship WHERE id = ?"
        db.query(query2, [friendship.id], (err2, result) => {
            if (err2) return res.status(500).json(err2)
            console.log("Friendship deleted, result:", result)
            res.json("Friendship terminated you are no longer friends o7")
        })
    }) 


}

//Get from logged user all the current accepted friendships (does not matter who asked who) and the pending friendships for him to accept
const getFriendships = async(req, res) => {
    console.log("getFriendships Start")
    const userId = getUserIdFromToken(req)
    if (!userId) return res.status(401).json("Not authenticated")
    
    console.log("Get all friendships (accepted and solicited to) from userId", userId)
    const q = "SELECT * from friendship WHERE ((user_id_1 = ? OR user_id_2 = ?) AND status='accepted') OR (user_id_2 = ? AND status='pending')"
    db.query(q, [userId, userId, userId], (err, data) => {
        if (err) return res.status(500).json(err)
        console.log("The user's friendships are", data)
        if (data.length === 0) {
            console.log("User has no friends, what a loser!")
            // TODO crear un return y mensaje en front para cuando no haya amigos
            return res.status(200).json("No friendships found")
        } else {
            return res.json(data)
        }
    })
}

module.exports = {
    friendshipRequest,
    acceptFriendship,
    getFriendships,
    deleteFriendship,
}