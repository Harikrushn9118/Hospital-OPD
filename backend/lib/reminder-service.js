// Reminder service - appointments ke liye notifications
import prisma from "./db.js"
import { sendPushNotification } from "./push-notifications.js"

// Kal wale appointments check karo aur reminder bhejo
export const checkUpcomingAppointments = async () => {
  try {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(23, 59, 59, 999)

    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        status: "SCHEDULED",
        slot: {
          date: {
            gte: now,
            lte: tomorrow,
          },
        },
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        doctor: true,
        slot: true,
      },
    })

    // Har appointment ke liye reminder bhejo
    for (const appointment of upcomingAppointments) {
      const appointmentDate = new Date(appointment.slot.date)
      const formattedDate = appointmentDate.toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      const message = {
        title: "Appointment Reminder",
        body: `You have an appointment with Dr. ${appointment.doctor.name} tomorrow (${formattedDate}) at ${appointment.slot.startTime}`,
        data: {
          appointmentId: appointment.id,
          type: "appointment_reminder",
          doctorName: appointment.doctor.name,
          date: formattedDate,
          time: appointment.slot.startTime,
        },
      }

      await sendReminderNotification(appointment.patient.user.id, message)
    }

    return {
      success: true,
      count: upcomingAppointments.length,
      message: `Sent ${upcomingAppointments.length} reminders`,
    }
  } catch (error) {
    console.error("Error checking upcoming appointments:", error)
    throw error
  }
}

// Notification bhejne ke liye
const sendReminderNotification = async (userId, message) => {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title: message.title,
        body: message.body,
        type: "APPOINTMENT_REMINDER",
        data: message.data,
        isRead: false,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error sending reminder notification:", error)
    return { success: false, error }
  }
}

// User ke reminders nikalo
export const getUserReminders = async (userId) => {
  try {
    const reminders = await prisma.notification.findMany({
      where: {
        userId,
        type: "APPOINTMENT_REMINDER",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    })

    return reminders
  } catch (error) {
    console.error("Error fetching user reminders:", error)
    throw error
  }
}

// Reminder ko read mark karo
export const markReminderAsRead = async (reminderId) => {
  try {
    const reminder = await prisma.notification.update({
      where: { id: reminderId },
      data: { isRead: true },
    })

    return reminder
  } catch (error) {
    console.error("Error marking reminder as read:", error)
    throw error
  }
}

// Scheduler start karo - har 6 ghante check karega
export const startReminderScheduler = () => {
  const INTERVAL = 6 * 60 * 60 * 1000

  setInterval(async () => {
    console.log("Checking appointments for reminders...")
    await checkUpcomingAppointments()
  }, INTERVAL)

  checkUpcomingAppointments()
  console.log("Reminder scheduler started")
}
