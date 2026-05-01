const express = require("express")
const router = express.Router()
const friendshipController = require("../controllers/friendship")


router.post("/request", friendshipController.friendshipRequest)
router.post("/accept", friendshipController.acceptFriendship)
router.get("/", friendshipController.getFriendships)
router.post("/delete", friendshipController.deleteFriendship)

module.exports = router