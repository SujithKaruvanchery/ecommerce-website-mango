const express = require('express')
const connectDB = require('./config/db')
const apiRouter = require('./routes')
const cookieParser = require('cookie-parser')
const cors = require('cors');

require('dotenv').config()

const app = express()

connectDB()

app.use(express.json())

app.use(cors({ origin: "http://localhost:5173", credentials: true, methods: [ "GET", "POST", "PUT", "DELETE" ] }));

app.use(cookieParser())

app.use("/api", apiRouter)

app.all("*", (req, res) => {
    return res.status(404).json({ message: "end-point does not exist" });
});

app.listen(process.env.PORT, (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log(`server starts on port ${process.env.PORT}`)
    }
})

