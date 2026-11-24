const express = require('express');
const router = express.Router();
const { handleSyncStream, getClientCount } = require('../services/syncService');

// SSE Event Stream for live synchronization
router.get('/events', handleSyncStream);

// Sync Status check
router.get('/status', (req, res) => {
  res.json({
    status: 'active',
    activeClients: getClientCount(),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
