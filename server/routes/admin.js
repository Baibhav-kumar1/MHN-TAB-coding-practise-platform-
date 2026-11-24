const express = require('express');
const router = express.Router();
const {
  getStats,
  getQuestions,
  createQuestion,
  updateQuestion,
  togglePublish,
  deleteQuestion,
  getUsers,
  updateUserRole
} = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');

// All admin routes require admin privileges
router.use(requireAdmin);

router.get('/stats', getStats);
router.get('/questions', getQuestions);
router.post('/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.patch('/questions/:id/publish', togglePublish);
router.delete('/questions/:id', deleteQuestion);
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);

module.exports = router;
