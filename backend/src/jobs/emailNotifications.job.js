import cron from 'node-cron';
import { Task } from '../models/task.models.js';
import { User } from '../models/user.models.js';
import { sendTaskDueSoonEmail, sendTaskOverdueEmail, sendDailyDigestEmail } from '../services/email.service.js';
import logger from '../utils/logger.js';

// Check for tasks due soon (every hour)
export const checkDueSoonTasks = cron.schedule('0 * * * *', async () => {
  try {
    logger.info('Checking for tasks due soon...');
    
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Find tasks due in the next 24 hours that haven't been completed
    const dueSoonTasks = await Task.find({
      dueDate: {
        $gte: now,
        $lte: in24Hours
      },
      status: { $ne: 'DONE' },
      'notifications.dueSoonSent': { $ne: true }
    }).populate('assignedTo');
    
    for (const task of dueSoonTasks) {
      const hoursLeft = Math.round((new Date(task.dueDate) - now) / (1000 * 60 * 60));
      
      if (hoursLeft <= 24 && hoursLeft > 0) {
        await sendTaskDueSoonEmail(task.assignedTo, task, hoursLeft); // FIXED
        
        // Mark notification as sent
        task.notifications = task.notifications || {};
        task.notifications.dueSoonSent = true;
        await task.save();
        
        logger.info(`Due soon notification sent for task: ${task.title}`);
      }
    }
    
    logger.info(`Checked ${dueSoonTasks.length} tasks due soon`);
  } catch (error) {
    logger.error('Error checking due soon tasks:', error);
  }
});

// Check for overdue tasks (every 6 hours)
export const checkOverdueTasks = cron.schedule('0 */6 * * *', async () => {
  try {
    logger.info('Checking for overdue tasks...');
    
    const now = new Date();
    
    // Find overdue tasks that haven't been completed
    const overdueTasks = await Task.find({
      dueDate: { $lt: now },
      status: { $ne: 'DONE' },
      'notifications.overdueSent': { $ne: true }
    }).populate('assignedTo', 'email firstName lastName'); // FIXED
    
    for (const task of overdueTasks) {
      await sendTaskOverdueEmail(task.assignedTo, task); // FIXED
      
      // Mark notification as sent
      task.notifications = task.notifications || {};
      task.notifications.overdueSent = true;
      await task.save();
      
      logger.info(`Overdue notification sent for task: ${task.title}`);
    }
    
    logger.info(`Checked ${overdueTasks.length} overdue tasks`);
  } catch (error) {
    logger.error('Error checking overdue tasks:', error);
  }
});

// Send daily digest (every day at 8 AM)
export const sendDailyDigests = cron.schedule('0 8 * * *', async () => {
  try {
    logger.info('Sending daily digests...');
    
    const users = await User.find({ isActive: true });
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    for (const user of users) {
      // Get user's task statistics
      const userTasks = await Task.find({ assignedTo: user._id }); // FIXED
      
      const stats = {
        total: userTasks.length,
        completed: userTasks.filter(t => t.status === 'DONE').length,
        dueToday: userTasks.filter(t => {
          if (!t.dueDate) return false;
          const dueDate = new Date(t.dueDate);
          return dueDate >= today && dueDate < tomorrow && t.status !== 'DONE';
        }).length,
        overdue: userTasks.filter(t => {
          if (!t.dueDate) return false;
          return new Date(t.dueDate) < now && t.status !== 'DONE';
        }).length,
      };
      
      // Only send digest if user has tasks
      if (stats.total > 0) {
        await sendDailyDigestEmail(user, stats);
        logger.info(`Daily digest sent to: ${user.email}`);
      }
    }
    
    logger.info('Daily digests sent successfully');
  } catch (error) {
    logger.error('Error sending daily digests:', error);
  }
});

// Start all jobs
export const startEmailJobs = () => {
  logger.info('Starting email notification jobs...');
  
  // Uncomment to enable in production
  // checkDueSoonTasks.start();
  // checkOverdueTasks.start();
  // sendDailyDigests.start();
  
  logger.info('Email notification jobs configured (disabled by default for development)');
};

// Stop all jobs
export const stopEmailJobs = () => {
  checkDueSoonTasks.stop();
  checkOverdueTasks.stop();
  sendDailyDigests.stop();
  logger.info('Email notification jobs stopped');
};

export default {
  startEmailJobs,
  stopEmailJobs,
  checkDueSoonTasks,
  checkOverdueTasks,
  sendDailyDigests,
};
