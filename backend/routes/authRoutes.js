const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getOrganizations,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/organizations', getOrganizations);
router.route('/me').get(protect, getUserProfile).put(protect, updateUserProfile);
router.get('/users', protect, getUsers);

module.exports = router;
