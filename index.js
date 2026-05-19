import express from "express"
import dotenv from "dotenv"
import morgan from 'morgan'
import userRoutes from "./routes/userRoutes.js"
import inquiryRoutes from "./routes/inquiry.js"
import attendanceRoutes from "./routes/attendance.js"
import blogRoutes from "./routes/blogs.js"
import healthEvaluationRoutes from "./routes/healthEvaluations.js"
import testimonialRoutes from "./routes/testimonials.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import { errorHandler, notFound } from "./middlewares/errorMiddleware.js"
import swaggerUi from "swagger-ui-express"
import fs from "fs"

const swaggerFile = JSON.parse(fs.readFileSync('./swagger-output.json', 'utf-8'))

dotenv.config()
const PORT = process.env.PORT || 3000

import connectDB from "./config/db.js"

connectDB()

const app = express()

app.use(morgan('common'))
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cookieParser())

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    data: null,
  })
})

app.use("/api/v1/users", userRoutes)
app.use("/api/v1/inquiry", inquiryRoutes)
app.use("/api/v1/attendance", attendanceRoutes)
app.use("/api/v1/blogs", blogRoutes)
app.use("/api/v1/healthEvaluations", healthEvaluationRoutes)
app.use("/api/v1/testimonials", testimonialRoutes)

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile))

app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log("Server listening on port: " + PORT)
})
