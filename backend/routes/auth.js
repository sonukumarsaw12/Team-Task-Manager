const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 100 : 10, // increase limit for tests
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

router.post('/signup', authLimiter, authController.signup);
router.post('/login', authLimiter, authController.login);
router.post('/logout', protect, authController.logout);
router.post('/refresh', authController.refresh);

module.exports = router;
