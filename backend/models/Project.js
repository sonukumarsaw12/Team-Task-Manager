const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  icon: { type: String, default: '📁' },
  color: { type: String, default: '#3b82f6' },
  deadline: { type: Date },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['Active', 'On Hold', 'Completed'], default: 'Active' },
  visibility: { type: String, enum: ['Private', 'Team'], default: 'Team' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
