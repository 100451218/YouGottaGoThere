const db = require("../db")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")


const friendshipRequest = async (req, res) => {
    // First, we need to find the id of the user we want to add
    const {username} = req.body

    const q = "SELECT id FROM user where username=?"
    db.query(q, [username], async(err, data) => {
        if (err) return res.status(404).json(err)
        // If the user we want to add already exists, we check there is not already a friendship situation
        /* When user A soliciting user B:
        Case 1: There is no friendship: We create a friend request
        Case 2: THere is already a friend request from A to B (return message)
        Case 3: There is already a friendship (return message)
        Case 4: There is already a friend request from A to B (update status and notify)
         */
        console.log(data)
        data
        //Now we check if there is already a friendship
        const q2 = "SELECT * FROM friendship WHERE user_id_1 = ? or user_id_2"
        db.query(q2, [data[0].id, data[0].id], async(err2,data2) => {
            if (err2) return res.status(404).json(err)
            console.log(data2)
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