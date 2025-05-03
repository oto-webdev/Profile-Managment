import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import cors from "cors"
import connectDB from "./config/database.js"

dotenv.config()

const app = express()

const port = process.env.PORT || 3001

app.use(helmet())
app.use(cookieParser())

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.use(express.json())

connectDB()

app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})