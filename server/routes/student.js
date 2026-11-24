const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/studentController');
const { requireAuth } = require('../middleware/auth');

router.get('/dashboard', requireAuth, getDashboardStats);

module.exports = router;
