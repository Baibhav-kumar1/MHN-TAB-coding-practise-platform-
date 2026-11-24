const express = require('express');
const router = express.Router();
const { getProblems, getProblemById, submitProblem } = require('../controllers/practiceController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getProblems);
router.get('/:id', optionalAuth, getProblemById);
router.post('/:id/submit', optionalAuth, submitProblem);

module.exports = router;
