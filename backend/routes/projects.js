const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projectsController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.use(protect);

router.route('/')
  .get(projectsController.getProjects)
  .post(adminOnly, projectsController.createProject);

router.route('/:id')
  .get(projectsController.getProjectById)
  .put(adminOnly, projectsController.updateProject)
  .delete(adminOnly, projectsController.deleteProject);

module.exports = router;
