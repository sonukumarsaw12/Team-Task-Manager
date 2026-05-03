const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ userId, projectId, taskId, action, metadata }) => {
  try {
    const log = new ActivityLog({
      userId,
      projectId,
      taskId,
      action,
      metadata
    });
    await log.save();
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

module.exports = { logActivity };
