const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Member'], default: 'Member' },
  profilePicture: { type: String },
  refreshToken: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
