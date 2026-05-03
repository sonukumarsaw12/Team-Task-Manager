const Notification = require('../models/Notification');
const User = require('../models/User');

const sendNotification = async (io, { userId, message, type, room }) => {
  try {
    // Send notification to the target user
    const notification = new Notification({
      userId,
      message,
      type
    });
    await notification.save();

    const targetRoom = room || `user_${userId}`;
    io.to(targetRoom).emit('notification', notification);

    // Also notify ALL Admin users (if the target user is not already an admin)
    await notifyAdmins(io, { excludeUserId: userId, message, type });

  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

/**
 * Send a notification to ALL admin users.
 * Used to ensure admins get notified about everything regardless of project membership.
 * @param {Object} io - Socket.io instance
 * @param {Object} options
 * @param {string|string[]} options.excludeUserId - User ID(s) to exclude (already notified)
 * @param {string} options.message - Notification message
 * @param {string} options.type - Notification type
 */
const notifyAdmins = async (io, { excludeUserId, message, type }) => {
  try {
    // Get all admin users
    const admins = await User.find({ role: 'Admin' }).select('_id');
    
    // Normalize excludeUserId to an array of strings
    const excludeIds = Array.isArray(excludeUserId)
      ? excludeUserId.map(id => id?.toString())
      : [excludeUserId?.toString()];

    for (const admin of admins) {
      const adminId = admin._id.toString();
      
      // Skip if this admin was already notified as the target user
      if (excludeIds.includes(adminId)) continue;

      const adminNotification = new Notification({
        userId: admin._id,
        message,
        type
      });
      await adminNotification.save();

      io.to(`user_${adminId}`).emit('notification', adminNotification);
    }
  } catch (error) {
    console.error('Error notifying admins:', error);
  }
};

/**
 * Send a notification to admins only (no specific target user).
 * Used for events like project creation, task creation, task deletion, etc.
 */
const sendAdminNotification = async (io, { message, type, excludeUserId }) => {
  try {
    await notifyAdmins(io, { excludeUserId, message, type });
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
};

module.exports = { sendNotification, sendAdminNotification, notifyAdmins };
