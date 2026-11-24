const express = require('express');
const router = express.Router();
const {
  getPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
  shareProgram,
  getSharedProgram
} = require('../controllers/programController');
const { requireAuth } = require('../middleware/auth');

// Public shared program route
router.get('/shared/:shareId', getSharedProgram);

// Authenticated user program routes
router.get('/', requireAuth, getPrograms);
router.post('/', requireAuth, createProgram);
router.get('/:id', requireAuth, getProgramById);
router.put('/:id', requireAuth, updateProgram);
router.delete('/:id', requireAuth, deleteProgram);
router.post('/:id/share', requireAuth, shareProgram);

module.exports = router;
