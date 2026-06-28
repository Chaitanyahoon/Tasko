const express = require('express');
const router = express.Router();
const {
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
  getMyTasks,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createTask);
router.route('/project/:projectId').get(protect, getTasksByProject);
router.route('/assigned-to-me').get(protect, getMyTasks);
router.route('/:id').put(protect, updateTask).delete(protect, deleteTask);

module.exports = router;
