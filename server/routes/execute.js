const express = require('express');
const router = express.Router();
const { execute, getHistory } = require('../controllers/executeController');
const { optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, execute);
router.get('/history', optionalAuth, getHistory);

module.exports = router;
