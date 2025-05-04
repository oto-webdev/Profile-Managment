import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import cors from "cors"
import connectDB from "./config/database.js"
import authRoutes from "./routes/auth.route.js"

dotenv.config()

const app = express()

const port = process.env.PORT || 3001

app.use(helmet())
app.use(cookieParser())

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use("/api/auth", authRoutes)

connectDB()

app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})