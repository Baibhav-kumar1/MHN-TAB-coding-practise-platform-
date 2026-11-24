const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  getTracks,
  uploadTrack,
  addYoutubeTrack,
  addStreamTrack,
  getUserPlaylists,
  createPlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  deletePlaylist,
  getRecentlyPlayed,
  recordRecentlyPlayed,
  adminDeleteTrack
} = require('../controllers/musicController');

const { optionalAuth, requireAuth, requireAdmin } = require('../middleware/auth');

// Configure Multer storage for audio uploads
const uploadDir = path.join(__dirname, '../uploads/music');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `audio-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.webm'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext) || file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files (MP3, WAV, OGG, M4A, etc.) are supported.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max audio size
});

// 1. Tracks routes
router.get('/tracks', optionalAuth, getTracks);
router.post('/upload', optionalAuth, upload.single('audio'), uploadTrack);
router.post('/youtube', optionalAuth, addYoutubeTrack);
router.post('/stream', optionalAuth, addStreamTrack);

// 2. Playlists routes (requires login for personal playlists)
router.get('/playlists', requireAuth, getUserPlaylists);
router.post('/playlists', requireAuth, createPlaylist);
router.post('/playlists/:id/tracks', requireAuth, addTrackToPlaylist);
router.delete('/playlists/:id/tracks/:trackId', requireAuth, removeTrackFromPlaylist);
router.delete('/playlists/:id', requireAuth, deletePlaylist);

// 3. Recently played routes
router.get('/recent', requireAuth, getRecentlyPlayed);
router.post('/recent', optionalAuth, recordRecentlyPlayed);

// 4. Admin routes
router.delete('/tracks/:id', requireAdmin, adminDeleteTrack);

module.exports = router;
