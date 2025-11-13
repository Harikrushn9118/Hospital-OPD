# Appointment Reminder System Feature

## Overview
This feature automatically sends reminders to patients about their upcoming appointments, reducing no-shows and improving appointment adherence.

## Features Implemented

### Backend (Node.js/Express)

1. **Reminder Service** (`backend/lib/reminder-service.js`)
   - Checks for appointments scheduled within the next 24 hours
   - Automatically sends reminders to patients
   - Stores notifications in the database
   - Runs on a 6-hour schedule (configurable)

2. **Notification Routes** (`backend/routes/notifications.js`)
   - `GET /api/notifications` - Get all notifications for logged-in user
   - `PUT /api/notifications/:id/read` - Mark notification as read
   - `PUT /api/notifications/read-all` - Mark all notifications as read
   - `DELETE /api/notifications/:id` - Delete a notification
   - `POST /api/notifications/check-reminders` - Manually trigger reminder check (admin)
   - `GET /api/notifications/stats` - Get notification statistics (admin)

3. **Database Schema** (Updated `schema.prisma`)
   - New `Notification` model with fields:
     - `id`, `userId`, `title`, `body`, `type`
     - `data` (JSON for additional info)
     - `isRead`, `createdAt`, `updatedAt`

### Frontend (React)

1. **Notification Panel Component** (`frontend/src/components/notifications/notification-panel.jsx`)
   - Real-time notification bell with unread count badge
   - Dropdown panel showing all notifications
   - Mark as read/unread functionality
   - Delete notifications
   - Auto-refresh every 30 seconds
   - Relative time display (e.g., "2h ago", "Just now")
   - Different icons for different notification types

## Setup Instructions

### 1. Database Migration

Run the Prisma migration to add the Notification table:

\`\`\`bash
cd backend
npx prisma migrate dev --name add-notifications
npx prisma generate
\`\`\`

### 2. Backend Setup

The reminder scheduler is automatically started when the server starts. No additional configuration needed!

### 3. Frontend Integration

Add the NotificationPanel component to your navigation bar or header:

\`\`\`jsx
// In your header/navbar component
import NotificationPanel from './components/notifications/notification-panel'

function Header() {
  return (
    <header>
      <nav>
        {/* Other nav items */}
        <NotificationPanel />
      </nav>
    </header>
  )
}
\`\`\`

### 4. Environment Variables

Add to your `.env` file (optional):

\`\`\`env
# Frontend
VITE_API_URL=http://localhost:3001

# Backend
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/hospital_opd"
JWT_SECRET=your-secret-key
\`\`\`

## How It Works

### Automatic Reminder Flow

1. **Scheduler runs** every 6 hours (configurable in `reminder-service.js`)
2. **Queries database** for appointments scheduled within next 24 hours
3. **Creates notifications** in database for each upcoming appointment
4. **Frontend polls** every 30 seconds for new notifications
5. **User sees** notification bell badge with unread count
6. **User clicks** to view details and mark as read

### Notification Types

- `APPOINTMENT_REMINDER` - Upcoming appointment alerts
- `SYSTEM_ALERT` - System-wide announcements
- `PRESCRIPTION_READY` - Prescription ready for pickup
- `LAB_RESULT` - Lab results available

## Customization Options

### Change Reminder Schedule

In `backend/lib/reminder-service.js`:

\`\`\`javascript
// Change from 6 hours to 1 hour
const INTERVAL = 1 * 60 * 60 * 1000
\`\`\`

### Change Reminder Window

In `backend/lib/reminder-service.js`:

\`\`\`javascript
// Change from 24 hours to 12 hours
const tomorrow = new Date(now)
tomorrow.setHours(now.getHours() + 12) // 12 hours ahead
\`\`\`

### Add Email/SMS Integration

Extend the `sendReminderNotification` function:

\`\`\`javascript
const sendReminderNotification = async (userId, message) => {
  // Save to database
  await prisma.notification.create({ ... })
  
  // Send email (integrate with SendGrid, AWS SES, etc.)
  await sendEmail(userEmail, message.title, message.body)
  
  // Send SMS (integrate with Twilio, AWS SNS, etc.)
  await sendSMS(userPhone, message.body)
}
\`\`\`

## API Examples

### Get Notifications

\`\`\`javascript
const token = localStorage.getItem('token')
const response = await fetch('http://localhost:3001/api/notifications', {
  headers: {
    'Authorization': \`Bearer \${token}\`
  }
})
const data = await response.json()
console.log(data.notifications, data.unreadCount)
\`\`\`

### Mark as Read

\`\`\`javascript
await fetch(\`http://localhost:3001/api/notifications/\${notificationId}/read\`, {
  method: 'PUT',
  headers: {
    'Authorization': \`Bearer \${token}\`
  }
})
\`\`\`

## Future Enhancements

- [ ] Email notification integration
- [ ] SMS notification integration  
- [ ] Push notifications for mobile PWA
- [ ] User preferences for notification settings
- [ ] Notification categories and filters
- [ ] Bulk notification sending for admins
- [ ] Notification templates
- [ ] Analytics dashboard for notification engagement

## Benefits

✅ **Reduces no-shows** - Patients receive timely reminders
✅ **Improves communication** - Real-time updates to patients
✅ **Better patient experience** - Stay informed about appointments
✅ **Admin control** - Manual trigger and statistics
✅ **Scalable** - Easy to add more notification types
✅ **User-friendly** - Clean UI with unread badges

## Troubleshooting

### Notifications not appearing?

1. Check if reminder scheduler is running (check server logs)
2. Verify database connection
3. Check if appointments exist in the next 24 hours
4. Ensure frontend is polling correctly (check network tab)

### Performance issues?

1. Add database indexes on notification table
2. Limit query results (already set to 50)
3. Adjust polling interval (default: 30 seconds)
4. Implement WebSocket for real-time updates instead of polling

---

**Enjoy your new Appointment Reminder System! 🎉**
