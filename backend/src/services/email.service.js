import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

// Create transporter
const createTransporter = () => {
  // For development, use Ethereal (fake SMTP service)
  // For production, use real SMTP service like Gmail, SendGrid, etc.
  
  if (process.env.NODE_ENV === 'production') {
    // Production SMTP configuration
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development: Use Gmail or Ethereal
    // For Gmail: Enable "Less secure app access" or use App Password
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password',
      },
    });
  }
};

// Email templates
const emailTemplates = {
  taskAssigned: (user, task) => ({
    subject: `New Task Assigned: ${task.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">TaskFlow</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">New Task Assigned</h2>
          <p style="color: #4b5563; font-size: 16px;">Hi ${user.firstName},</p>
          <p style="color: #4b5563; font-size: 16px;">You have been assigned a new task:</p>
          
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #6366f1;">
            <h3 style="color: #1f2937; margin-top: 0;">${task.title}</h3>
            <p style="color: #6b7280;">${task.description || 'No description provided'}</p>
            <div style="margin-top: 15px;">
              <span style="display: inline-block; padding: 5px 12px; background: #dbeafe; color: #1e40af; border-radius: 4px; font-size: 14px; margin-right: 10px;">
                Priority: ${task.priority.toUpperCase()}
              </span>
              <span style="display: inline-block; padding: 5px 12px; background: #fef3c7; color: #92400e; border-radius: 4px; font-size: 14px;">
                Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
              </span>
            </div>
          </div>
          
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/tasks" 
             style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            View Task
          </a>
          
          <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">
            This is an automated notification from TaskFlow. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
  }),

  taskDueSoon: (user, task, hoursLeft) => ({
    subject: `⏰ Task Due Soon: ${task.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">⏰ Task Due Soon</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p style="color: #4b5563; font-size: 16px;">Hi ${user.firstName},</p>
          <p style="color: #4b5563; font-size: 16px;">
            Your task "<strong>${task.title}</strong>" is due in <strong>${hoursLeft} hours</strong>.
          </p>
          
          <div style="background: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #78350f; margin-top: 0;">${task.title}</h3>
            <p style="color: #92400e;">${task.description || 'No description provided'}</p>
            <p style="color: #92400e; font-weight: bold; margin-top: 10px;">
              Due: ${new Date(task.dueDate).toLocaleString()}
            </p>
          </div>
          
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/tasks" 
             style="display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            Complete Task Now
          </a>
        </div>
      </div>
    `,
  }),

  taskOverdue: (user, task) => ({
    subject: `🚨 Task Overdue: ${task.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🚨 Task Overdue</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p style="color: #4b5563; font-size: 16px;">Hi ${user.firstName},</p>
          <p style="color: #4b5563; font-size: 16px;">
            Your task "<strong>${task.title}</strong>" is now <strong style="color: #ef4444;">OVERDUE</strong>.
          </p>
          
          <div style="background: #fee2e2; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <h3 style="color: #7f1d1d; margin-top: 0;">${task.title}</h3>
            <p style="color: #991b1b;">${task.description || 'No description provided'}</p>
            <p style="color: #991b1b; font-weight: bold; margin-top: 10px;">
              Was due: ${new Date(task.dueDate).toLocaleString()}
            </p>
          </div>
          
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/tasks" 
             style="display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            Update Task Status
          </a>
        </div>
      </div>
    `,
  }),

  taskCompleted: (user, task) => ({
    subject: `✅ Task Completed: ${task.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">✅ Great Work!</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p style="color: #4b5563; font-size: 16px;">Hi ${user.firstName},</p>
          <p style="color: #4b5563; font-size: 16px;">
            Congratulations! You've completed the task "<strong>${task.title}</strong>".
          </p>
          
          <div style="background: #d1fae5; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="color: #064e3b; margin-top: 0;">✓ ${task.title}</h3>
            <p style="color: #065f46;">Keep up the excellent work! 🎉</p>
          </div>
          
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/analytics" 
             style="display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            View Your Progress
          </a>
        </div>
      </div>
    `,
  }),

  dailyDigest: (user, stats) => ({
    subject: `📊 Your Daily Task Digest`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">📊 Daily Digest</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p style="color: #4b5563; font-size: 16px;">Hi ${user.firstName},</p>
          <p style="color: #4b5563; font-size: 16px;">Here's your daily task summary:</p>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
            <div style="background: white; border-radius: 8px; padding: 15px; text-align: center;">
              <h2 style="color: #6366f1; margin: 0; font-size: 32px;">${stats.total || 0}</h2>
              <p style="color: #6b7280; margin: 5px 0 0 0;">Total Tasks</p>
            </div>
            <div style="background: white; border-radius: 8px; padding: 15px; text-align: center;">
              <h2 style="color: #10b981; margin: 0; font-size: 32px;">${stats.completed || 0}</h2>
              <p style="color: #6b7280; margin: 5px 0 0 0;">Completed</p>
            </div>
            <div style="background: white; border-radius: 8px; padding: 15px; text-align: center;">
              <h2 style="color: #f59e0b; margin: 0; font-size: 32px;">${stats.dueToday || 0}</h2>
              <p style="color: #6b7280; margin: 5px 0 0 0;">Due Today</p>
            </div>
            <div style="background: white; border-radius: 8px; padding: 15px; text-align: center;">
              <h2 style="color: #ef4444; margin: 0; font-size: 32px;">${stats.overdue || 0}</h2>
              <p style="color: #6b7280; margin: 5px 0 0 0;">Overdue</p>
            </div>
          </div>
          
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
             style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; width: 100%; text-align: center; box-sizing: border-box;">
            View Dashboard
          </a>
        </div>
      </div>
    `,
  }),
};

// Send email function
const sendEmail = async (to, template) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"TaskFlow" <${process.env.EMAIL_USER || 'noreply@taskflow.com'}>`,
      to,
      subject: template.subject,
      html: template.html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    
    // If using Ethereal for dev, log preview URL
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Exported notification functions
export const sendTaskAssignedEmail = async (user, task) => {
  const template = emailTemplates.taskAssigned(user, task);
  return sendEmail(user.email, template);
};

export const sendTaskDueSoonEmail = async (user, task, hoursLeft) => {
  const template = emailTemplates.taskDueSoon(user, task, hoursLeft);
  return sendEmail(user.email, template);
};

export const sendTaskOverdueEmail = async (user, task) => {
  const template = emailTemplates.taskOverdue(user, task);
  return sendEmail(user.email, template);
};

export const sendTaskCompletedEmail = async (user, task) => {
  const template = emailTemplates.taskCompleted(user, task);
  return sendEmail(user.email, template);
};

export const sendDailyDigestEmail = async (user, stats) => {
  const template = emailTemplates.dailyDigest(user, stats);
  return sendEmail(user.email, template);
};

export default {
  sendTaskAssignedEmail,
  sendTaskDueSoonEmail,
  sendTaskOverdueEmail,
  sendTaskCompletedEmail,
  sendDailyDigestEmail,
};
