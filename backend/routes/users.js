const express = require("express")
const router = express.Router()
const userController = require("../controllers/users")

router.get("/", userController.getUsers);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/check", userController.check);
router.post("/logout", userController.logout);

module.exports = router