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

    //Once we have the user id we need to get all his friends ids
    query1 = "SELECT CASE WHEN user_id_1 = ? THEN user_id_2 WHEN user_id_2 = ? THEN user_id_1 END as friend FROM friendship WHERE ((user_id_1 = ?) OR (user_id_2 = ?)) AND (status = 'accepted')"
    db.query(query1, [userId, userId, userId, userId], (err1, data1) => {
        console.log(err1)
        if (err1) return res.status(500).json(err1)
        if (data1.length === 0) {
            return res.status(200).json("No friendships found")
        }
        console.log("Friends of ", userId, data1, data1.map(elem => elem.friend))
        const friends_array = data1.map(elem => elem.friend)

        // We need now to construct the next query that gets all the reviews of restaurants that restaurant_review have ranking not null and user_id in the friends
        // JOIN with user table to get username and restaurant table to get name and location
        query2 =   `SELECT rr.restaurant_id, rr.description, rr.user_id, rr.ranking, u.username, r.name as restaurant_name, r.locationx, r.locationy, 
                    CONCAT('[', GROUP_CONCAT(rt.tag_id ORDER BY rt.tag_id ASC SEPARATOR ','), ']') AS tags
                    FROM restaurant_review rr 
                    JOIN user u ON rr.user_id = u.id 
                    JOIN restaurant r ON rr.restaurant_id = r.id 
                    LEFT JOIN review_tag rt ON rr.id = rt.review_id
                    WHERE rr.user_id IN (`+friends_array.join(",")+`) AND rr.ranking IS NOT NULL 
                    GROUP BY rr.id, rr.restaurant_id, rr.user_id
                    ORDER BY rr.ranking;
                    ` 
        console.log(query2)
        db.query(query2, [], (err2, data2) => {
            console.log("reviews of friends", data2)
            if (data2.length === 0){
                return res.status(200).json("Friends have no review in top 5")
            }
            return res.status(200).json(data2)
        })
    })
}



module.exports = {
    getRecomendationsForUser,
}