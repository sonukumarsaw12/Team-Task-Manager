const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');
const { upload } = require('../utils/cloudinary');

router.use(protect);

router.route('/')
  .get(tasksController.getTasks)
  .post(adminOnly, tasksController.createTask);

router.route('/:id')
  .get(tasksController.getTaskById)
  .put(tasksController.updateTask)
  .delete(adminOnly, tasksController.deleteTask);

router.post('/:id/attachments', upload.single('file'), tasksController.uploadAttachment);
router.delete('/:id/attachments/:attachmentId', tasksController.removeAttachment);

module.exports = router;
