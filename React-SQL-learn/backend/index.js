import express from "express"
import mysql from "mysql"

import cors from "cors"



const app = express()

app.use(cors())

const db = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"SergiVM23",
    database:"tutorial"
})

// In case auth error
// Alter user "root@localhost" IDENTIFIED with mysql_native_password by "SergiVM23";
app.use(express.json())


// Creamos el get por defecto
app.get("/", (req,res)=>{
    res.json("hello from backend")
})

app.get("/books", (req,res)=>{
    console.log("llega")
    const q = "Select * from books"
    db.query(q, (err, data)=>{
        if (err) return res.json(err)
        return res.json(data)
    })
})

app.post("/books", (req,res)=>{
    const q = "Insert into books (`title`, `description`, `cover`) VALUES (?)"
    const body = req.body
    const values = [body.title, body.description, body.cover]
    console.log("Llamado con éxito", values)
    db.query(q, [values], (err, data)=>{
        if (err) return res.json(err)
        return res.json(data)
    })
})

app.listen(8081, ()=>{
    console.log("Connected to back!")
})