const express = require("express")
const router = express.Router()
const restaurantController = require("../controllers/restaurants")

// Get all restaurants reviewed by current user
router.get("/my-restaurants", restaurantController.getRestaurantsForUser)

// Get top 5 restaurants for current user
router.get("/my-top-restaurants", restaurantController.getTopRestaurantsForUser)

// Search restaurants by name and location
router.get("/search", restaurantController.searchRestaurants)

// Create a new restaurant
router.post("/", restaurantController.createRestaurant)

// Add or update review for a restaurant
router.post("/:restaurantId/reviews", restaurantController.addReview)

// Update ranking for a restaurant review
router.patch("/:restaurantId/ranking", restaurantController.updateReviewRanking)

module.exports = router
