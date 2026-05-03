const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../utils/cloudinary');

router.use(protect);

router.get('/', usersController.getUsers);
router.put('/profile', upload.single('profilePicture'), usersController.updateProfile);

module.exports = router;
