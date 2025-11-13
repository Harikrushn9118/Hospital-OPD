// Notification routes - reminders aur alerts ke liye
import express from "express"
import prisma from "../lib/db.js"
import { authMiddleware } from "../middleware/auth.js"
import { checkUpcomingAppointments } from "../lib/reminder-service.js"

const router = express.Router()

router.use(authMiddleware)

// User ke saare notifications
router.get("/", async (req, res) => {
  try {
    const userId = req.user.userId

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    })

    res.json({ notifications, unreadCount })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    res.status(500).json({ error: "Failed to fetch notifications" })
  }
})

// Notification ko read mark karo
router.put("/:id/read", async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: Number.parseInt(req.params.id) },
      data: { isRead: true },
    })

    res.json(notification)
  } catch (error) {
    console.error("Error marking notification as read:", error)
    res.status(500).json({ error: "Failed to update notification" })
  }
})

// Sab notifications ko read karo
router.put("/read-all", async (req, res) => {
  try {
    const userId = req.user.userId

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })

    res.json({ message: "All notifications marked as read" })
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    res.status(500).json({ error: "Failed to update notifications" })
  }
})

// Notification delete karo
router.delete("/:id", async (req, res) => {
  try {
    await prisma.notification.delete({
      where: { id: Number.parseInt(req.params.id) },
    })

    res.json({ message: "Notification deleted" })
  } catch (error) {
    console.error("Error deleting notification:", error)
    res.status(500).json({ error: "Failed to delete notification" })
  }
})

// Reminder check manually trigger karo (admin only)
router.post("/check-reminders", async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" })
    }

    const result = await checkUpcomingAppointments()
    res.json(result)
  } catch (error) {
    console.error("Error checking reminders:", error)
    res.status(500).json({ error: "Failed to check reminders" })
  }
})

// Stats dekho (admin only)
router.get("/stats", async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" })
    }

    const totalNotifications = await prisma.notification.count()
    const unreadNotifications = await prisma.notification.count({
      where: { isRead: false },
    })
    const reminderCount = await prisma.notification.count({
      where: { type: "APPOINTMENT_REMINDER" },
    })

    res.json({
      total: totalNotifications,
      unread: unreadNotifications,
      reminders: reminderCount,
    })
  } catch (error) {
    console.error("Error fetching notification stats:", error)
    res.status(500).json({ error: "Failed to fetch stats" })
  }
})

export default router
