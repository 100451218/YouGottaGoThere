const mysql = require("mysql")

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "SergiVM23",
    database: "tutorial"
})

db.connect((err) => {
    if (err) {
        console.error("Error connecting to database:", err)
        return
    }
    console.log("Connected to the database")
})

module.exports = db