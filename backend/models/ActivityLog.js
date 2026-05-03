const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  action: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
