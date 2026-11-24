const express = require('express');
const router = express.Router();
const { chat, getConversations, getConversation, deleteConversation } = require('../controllers/aiController');
const { optionalAuth } = require('../middleware/auth');

router.post('/chat', optionalAuth, chat);
router.get('/conversations', optionalAuth, getConversations);
router.get('/conversations/:id', optionalAuth, getConversation);
router.delete('/conversations/:id', optionalAuth, deleteConversation);

module.exports = router;
