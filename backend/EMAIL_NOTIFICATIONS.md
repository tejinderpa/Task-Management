# Email Notification System Documentation

## Overview

The Task Management System includes a comprehensive email notification system that sends automated emails for various task-related events. The system uses Nodemailer with support for Gmail, SendGrid, AWS SES, and other SMTP providers.

## Features

### 1. **Task Assignment Notifications**
- Sent when a new task is assigned to a user
- Includes task details (title, description, priority, due date)
- Contains a direct link to view the task

### 2. **Task Due Soon Reminders**
- Automatically checks for tasks due in the next 24 hours
- Sends reminder emails with hours remaining
- Runs every hour via cron job
- Only sends once per task (tracked via `notifications.dueSoonSent` flag)

### 3. **Task Overdue Alerts**
- Automatically checks for overdue incomplete tasks
- Sends urgent overdue notifications
- Runs every 6 hours via cron job
- Only sends once per task (tracked via `notifications.overdueSent` flag)

### 4. **Task Completion Notifications**
- Sent when a task is marked as DONE
- Celebrates user achievement
- Includes link to analytics dashboard

### 5. **Daily Digest Emails**
- Comprehensive daily summary of task statistics
- Sent every morning at 8 AM
- Includes: Total tasks, completed, due today, overdue
- Only sent if user has active tasks

## Configuration

### Gmail Setup (Development)

1. **Enable 2-Factor Authentication:**
   - Go to Google Account settings
   - Security → 2-Step Verification → Turn on

2. **Generate App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select app: "Mail"
   - Select device: "Other (Custom name)" → "TaskFlow"
   - Copy the 16-character password

3. **Update `.env` file:**
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-char-app-password
   FRONTEND_URL=http://localhost:3000
   ```

### Production SMTP Setup

For production, use dedicated email services like SendGrid, AWS SES, or Mailgun:

```env
NODE_ENV=production
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
FRONTEND_URL=https://your-production-domain.com
```

## Email Templates

All email templates are beautifully designed with:
- Gradient headers matching TaskFlow branding
- Responsive HTML design
- Dark mode compatible
- Professional typography
- Call-to-action buttons with direct links

### Available Templates

1. **Task Assigned** - Purple gradient, task details card
2. **Task Due Soon** - Orange gradient, warning style
3. **Task Overdue** - Red gradient, urgent alert style
4. **Task Completed** - Green gradient, celebration theme
5. **Daily Digest** - Purple gradient, statistics grid

## Cron Jobs Schedule

```javascript
// Task Due Soon Check - Every hour
'0 * * * *' // At minute 0 of every hour

// Task Overdue Check - Every 6 hours
'0 */6 * * *' // At minute 0 of hours 0, 6, 12, 18

// Daily Digest - Every day at 8 AM
'0 8 * * *' // At 8:00 AM every day
```

## Development Mode

By default, email jobs are **disabled in development** to prevent spam during testing. 

To enable in development, edit `backend/src/jobs/emailNotifications.job.js`:

```javascript
export const startEmailJobs = () => {
  logger.info('Starting email notification jobs...');
  
  // Uncomment to enable in development/production
  checkDueSoonTasks.start();
  checkOverdueTasks.start();
  sendDailyDigests.start();
  
  logger.info('Email notification jobs started!');
};
```

## Manual Email Sending

You can manually send emails from controllers:

```javascript
import { sendTaskAssignedEmail } from '../services/email.service.js';

// Send task assignment email
const user = await User.findById(userId);
const task = await Task.findById(taskId);
await sendTaskAssignedEmail(user, task);
```

## Database Schema Updates

Added notification tracking to Task model:

```javascript
notifications: {
  dueSoonSent: {
    type: Boolean,
    default: false
  },
  overdueSent: {
    type: Boolean,
    default: false
  }
}
```

This prevents duplicate notifications for the same event.

## Testing Emails

### Option 1: Use Your Gmail (Recommended for Development)
Set up with your actual Gmail account and app password.

### Option 2: Use Ethereal Email (Fake SMTP)
Modify `email.service.js` to use Ethereal:

```javascript
// Create test account
const testAccount = await nodemailer.createTestAccount();

const transporter = nodemailer.createTransporter({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: testAccount.user,
    pass: testAccount.pass,
  },
});
```

Ethereal provides preview URLs in the console logs.

## Security Best Practices

1. **Never commit credentials** - Use `.env` file (already in `.gitignore`)
2. **Use App Passwords** - Don't use your actual Gmail password
3. **Rate limiting** - Email sending respects application rate limits
4. **Error handling** - Email failures don't break the application
5. **Logging** - All email activities are logged via Winston

## Troubleshooting

### Emails Not Sending

1. **Check credentials:**
   ```bash
   # Verify .env file has correct values
   cat backend/.env | grep EMAIL
   ```

2. **Check logs:**
   ```bash
   # Look for email-related errors
   tail -f backend/logs/combined.log
   ```

3. **Test SMTP connection:**
   Create a test script:
   ```javascript
   import nodemailer from 'nodemailer';
   
   const transporter = nodemailer.createTransporter({
     service: 'gmail',
     auth: {
       user: process.env.EMAIL_USER,
       pass: process.env.EMAIL_PASS,
     },
   });
   
   await transporter.verify();
   console.log('SMTP connection successful!');
   ```

### Gmail "Less Secure Apps" Error

Gmail has deprecated "Less secure app access". You **must** use App Passwords with 2FA enabled. Regular passwords no longer work.

### Emails Going to Spam

- Add SPF, DKIM, and DMARC records to your domain
- Use authenticated SMTP service (SendGrid, AWS SES)
- Warm up your sending reputation gradually
- Include unsubscribe links in production

## API Integration

Email notifications are automatically triggered by:

- **POST /api/v1/tasks** - Task assignment emails
- **PATCH /api/v1/tasks/:id/status** - Completion emails
- **Cron jobs** - Due soon, overdue, daily digest

No additional API endpoints are needed for email functionality.

## Customization

### Changing Email Templates

Edit `backend/src/services/email.service.js`:

```javascript
const emailTemplates = {
  taskAssigned: (user, task) => ({
    subject: `Your custom subject`,
    html: `<div>Your custom HTML</div>`,
  }),
};
```

### Changing Cron Schedules

Edit `backend/src/jobs/emailNotifications.job.js`:

```javascript
// Change to every 2 hours instead of 1
export const checkDueSoonTasks = cron.schedule('0 */2 * * *', async () => {
  // ...
});
```

### Adding New Email Types

1. Add template to `emailTemplates` in `email.service.js`
2. Export sending function
3. Call from controller where needed

## Performance Considerations

- Email sending is **non-blocking** (async/await with try/catch)
- Failed emails don't prevent task operations
- Cron jobs run in background without blocking requests
- Database queries use indexes for efficient task lookups

## Future Enhancements

- [ ] User email preferences (opt-in/opt-out)
- [ ] Email templates customization UI
- [ ] Weekly/monthly summary reports
- [ ] Task comment notifications
- [ ] Team collaboration notifications
- [ ] Rich text email editor
- [ ] Email analytics dashboard

## Support

For issues or questions about email notifications:
1. Check logs: `backend/logs/combined.log`
2. Verify environment variables
3. Test SMTP connection
4. Review cron job status

---

**Note:** Email notifications are production-ready but disabled by default in development. Enable them when you're ready to test with real email addresses.
