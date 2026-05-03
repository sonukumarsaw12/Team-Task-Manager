const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', notificationsController.getNotifications);
router.put('/read-all', notificationsController.markAllAsRead);
router.put('/:id/read', notificationsController.markAsRead);

module.exports = router;
