// Email service - patients ko emails bhejne ke liye
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

// Appointment confirmation email bhejo
export const sendAppointmentConfirmation = async (patientEmail, appointmentDetails) => {
  try {
    const { doctorName, date, time, symptoms } = appointmentDetails

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: patientEmail,
      subject: "Appointment Confirmed - Hospital OPD",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Appointment Confirmed!</h2>
          <p>Your appointment has been successfully booked.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Appointment Details:</h3>
            <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${time}</p>
            ${symptoms ? `<p><strong>Symptoms:</strong> ${symptoms}</p>` : ""}
          </div>
          
          <p style="color: #6b7280;">Please arrive 10 minutes early for your appointment.</p>
          <p style="color: #6b7280;">If you need to cancel or reschedule, please contact us at least 24 hours in advance.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #9ca3af;">This is an automated email. Please do not reply.</p>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Appointment confirmation email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending appointment confirmation email:", error)
    return { success: false, error: error.message }
  }
}

// Appointment reminder email bhejo
export const sendAppointmentReminder = async (patientEmail, appointmentDetails) => {
  try {
    const { doctorName, date, time } = appointmentDetails

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: patientEmail,
      subject: "Reminder: Upcoming Appointment - Hospital OPD",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">Appointment Reminder</h2>
          <p>This is a reminder about your upcoming appointment tomorrow.</p>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="margin-top: 0;">Tomorrow's Appointment:</h3>
            <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${time}</p>
          </div>
          
          <p>Please remember to bring:</p>
          <ul>
            <li>Valid ID proof</li>
            <li>Previous medical records (if any)</li>
            <li>List of current medications</li>
          </ul>
          
          <p style="color: #6b7280;">See you tomorrow!</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #9ca3af;">This is an automated reminder. Please do not reply.</p>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Appointment reminder email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending reminder email:", error)
    return { success: false, error: error.message }
  }
}

// Prescription ready email bhejo
export const sendPrescriptionReady = async (patientEmail, prescriptionDetails) => {
  try {
    const { doctorName, medications } = prescriptionDetails

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: patientEmail,
      subject: "Your Prescription is Ready - Hospital OPD",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Prescription Ready</h2>
          <p>Dr. ${doctorName} has prepared your prescription.</p>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Prescribed Medications:</h3>
            <ul>
              ${medications.map((med) => `<li><strong>${med.name}</strong> - ${med.dosage} (${med.frequency})</li>`).join("")}
            </ul>
          </div>
          
          <p style="color: #6b7280;">You can collect your prescription from the pharmacy counter.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #9ca3af;">This is an automated email. Please do not reply.</p>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Prescription ready email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending prescription email:", error)
    return { success: false, error: error.message }
  }
}

// Test email connection
export const testEmailConnection = async () => {
  try {
    await transporter.verify()
    console.log("Email server is ready to send emails")
    return { success: true }
  } catch (error) {
    console.error("Email server connection failed:", error)
    return { success: false, error: error.message }
  }
}
