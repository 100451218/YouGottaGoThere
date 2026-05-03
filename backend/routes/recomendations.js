const express = require("express")
const router = express.Router()
const recomendationsController = require("../controllers/recomendations")


router.get("/", recomendationsController.getRecomendationsForUser)



module.exports = router