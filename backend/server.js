import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import http from "http"
import { Server } from "socket.io"

// API routes
import authRoutes from "./routes/auth.js"
import patientRoutes from "./routes/patients.js"
import doctorRoutes from "./routes/doctors.js"
import appointmentRoutes from "./routes/appointments.js"
import prescriptionRoutes from "./routes/prescriptions.js"
import slotRoutes from "./routes/slots.js"
import notificationRoutes from "./routes/notifications.js"

// Services
import { startReminderScheduler } from "./lib/reminder-service.js"

dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: "*" },
})

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API routes setup
app.use("/api/auth", authRoutes)
app.use("/api/patients", patientRoutes)
app.use("/api/doctors", doctorRoutes)
app.use("/api/appointments", appointmentRoutes)
app.use("/api/prescriptions", prescriptionRoutes)
app.use("/api/slots", slotRoutes)
app.use("/api/notifications", notificationRoutes)

// Real-time socket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  socket.on("join-room", (data) => {
    socket.join(`user-${data.userId}`)
  })

  socket.on("send-message", (data) => {
    io.to(`user-${data.recipientId}`).emit("receive-message", data)
  })

  socket.on("appointment-update", (data) => {
    io.emit("appointment-changed", data)
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
  })
})

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "Server is running" })
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  startReminderScheduler() // Reminder scheduler start karo
})

export default { app, io }
