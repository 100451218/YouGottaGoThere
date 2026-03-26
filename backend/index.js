const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")

const app = express()
app.use(cors({ origin: "http://localhost:5175", credentials: true })) // Allow frontend origin
app.use(express.json())
app.use(cookieParser())

// Database connection is handled in db.js

// Import routes
const userRoutes = require("./routes/users.js")


// Middelware: Register calls to the server and log them into the servers console
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// Middleware: Define where to use depending on the routes
app.use("/users", userRoutes)

/*
app.get("/", (req,res)=>{
    res.json("hello from backend")
})
*/


app.listen(8800, () => {
    console.log("Listening on port 8800")
})