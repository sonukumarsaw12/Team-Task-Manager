const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['task_assigned', 'status_updated', 'member_added', 'project_created', 'project_updated', 'project_deleted', 'task_created', 'task_deleted', 'task_updated', 'file_uploaded'], required: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
