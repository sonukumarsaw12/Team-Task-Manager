const User = require('../models/User');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password -refreshToken');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const updateData = { name: req.body.name || user.name };
    
    if (req.body.removePicture === 'true') {
      updateData.profilePicture = null;
    } else if (req.file) {
      updateData.profilePicture = req.file.path;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      profilePicture: updatedUser.profilePicture
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
