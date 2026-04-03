const mysql = require("mysql2")
// We import mysql2

//Create the conection of the database
// TODO Make the system store the conection data securely (not in clear in the code)
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "SergiVM23",
    database: "tutorial"
})

//Conect to the database
db.connect((err) => {
    if (err) {
        console.error("Error connecting to database:", err)
        return
    }
    console.log("Connected to the database")
})

module.exports = db