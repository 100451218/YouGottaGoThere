
const db = require("../db")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const getUsers = async (req, res) => {
    const q = "SELECT * FROM users"
    db.query(q, (err, data) => {
        if (err) return res.json(err)
        return res.json(data)
    })
}

const register = async (req, res) => {
    console.log("register")
    const { username, password } = req.body

    // Check if user exists
    const q = "SELECT * FROM users WHERE username = ?"
    db.query(q, [username], async (err, data) => {
        if (err) return res.status(500).json(err)
        if (data.length) return res.status(409).json("User already exists")

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Insert user
        const q2 = "INSERT INTO users (`username`, `password`) VALUES (?, ?)"
        const values = [username, hashedPassword]
        db.query(q2, values, (err, data) => {
            if (err) return res.status(500).json(err)
            return res.status(200).json("User created")
        })
    })
}

const login = async (req, res) => {
    const { username, password } = req.body

    const q = "SELECT * FROM users WHERE username = ?"
    db.query(q, [username], (err, data) => {
        if (err) return res.status(500).json(err)
        if (data.length === 0) return res.status(404).json("User not found")

        const user = data[0]

        // Check password
        const isPasswordCorrect = bcrypt.compareSync(password, user.password)
        if (!isPasswordCorrect) return res.status(400).json("Wrong username or password")

        // Create JWT
        const token = jwt.sign({ id: user.id }, "jwtkey")

        // Send token in cookie or response
        res.cookie("access_token", token, {
            httpOnly: true
        }).status(200).json({ id: user.id, username: user.username })
    })
}

const check = (req, res) => {
    const token = req.cookies.access_token
    if (!token) return res.status(401).json("Not authenticated")

    jwt.verify(token, "jwtkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid")
        const q = "SELECT id, username FROM users WHERE id = ?"
        db.query(q, [userInfo.id], (err, data) => {
            if (err) return res.status(500).json(err)
            if (data.length === 0) return res.status(404).json("User not found")
            return res.status(200).json(data[0])
        })
    })
}

const logout = (req, res) => {
    res.clearCookie("access_token").status(200).json("Logged out")
}

module.exports = {
    getUsers,
    register,
    login,
    check,
    logout
}