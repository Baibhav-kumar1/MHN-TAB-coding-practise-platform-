const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { dbAll, dbGet, dbRun } = require('../database');
const { broadcastSyncEvent } = require('../services/syncService');

// Extract YouTube Video ID from any standard YouTube URL
function extractYoutubeVideoId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

// 1. Get all published global music tracks
async function getTracks(req, res) {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    let query = 'SELECT * FROM music_tracks';
    if (!isAdmin) {
      query += ' WHERE is_published = 1';
    }
    query += ' ORDER BY created_at DESC';

    const tracks = await dbAll(query);
    res.json({ tracks });
  } catch (err) {
    console.error('getTracks error:', err);
    res.status(500).json({ error: 'Failed to retrieve music tracks' });
  }
}

// 2. Handle audio file upload (MP3, WAV, etc.)
async function uploadTrack(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded.' });
    }

    const { title, artist } = req.body;
    const trackId = `track-up-${uuidv4().slice(0, 8)}`;
    const trackTitle = (title && title.trim()) || req.file.originalname.replace(/\.[^/.]+$/, '');
    const trackArtist = (artist && artist.trim()) || 'Uploaded Audio';
    const sourceUrl = `/api/music/stream/${req.file.filename}`;
    const userId = req.user ? req.user.id : 'student';

    await dbRun(
      `INSERT INTO music_tracks (id, title, artist, source_type, source_url, duration, thumbnail_url, is_published, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        trackId,
        trackTitle,
        trackArtist,
        'upload',
        sourceUrl,
        0,
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80',
        1,
        userId
      ]
    );

    const track = await dbGet('SELECT * FROM music_tracks WHERE id = ?', [trackId]);

    // Broadcast live sync to all connected students
    broadcastSyncEvent('music_updated', {
      action: 'upload',
      track
    });

    res.status(201).json({
      message: 'Audio song uploaded and added to library!',
      track
    });
  } catch (err) {
    console.error('uploadTrack error:', err);
    res.status(500).json({ error: 'Failed to upload audio track: ' + err.message });
  }
}

// 3. Add song via YouTube URL (Official IFrame API compliant)
async function addYoutubeTrack(req, res) {
  try {
    const { url, title, artist } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'YouTube URL is required.' });
    }

    const videoId = extractYoutubeVideoId(url.trim());
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL. Please provide a valid youtube.com or youtu.be link.' });
    }

    const trackId = `track-yt-${videoId}`;
    
    // Check if already in library
    const existing = await dbGet('SELECT * FROM music_tracks WHERE id = ? OR source_url LIKE ?', [trackId, `%${videoId}%`]);
    if (existing) {
      return res.json({ message: 'Track already exists in library', track: existing });
    }

    const trackTitle = (title && title.trim()) || `YouTube Focus Audio (${videoId})`;
    const trackArtist = (artist && artist.trim()) || 'YouTube Music';
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const userId = req.user ? req.user.id : 'student';

    await dbRun(
      `INSERT INTO music_tracks (id, title, artist, source_type, source_url, duration, thumbnail_url, is_published, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [trackId, trackTitle, trackArtist, 'youtube', canonicalUrl, 0, thumbnailUrl, 1, userId]
    );

    const track = await dbGet('SELECT * FROM music_tracks WHERE id = ?', [trackId]);

    // Broadcast live sync
    broadcastSyncEvent('music_updated', {
      action: 'youtube',
      track
    });

    res.status(201).json({
      message: 'YouTube track added to music library!',
      track
    });
  } catch (err) {
    console.error('addYoutubeTrack error:', err);
    res.status(500).json({ error: 'Failed to add YouTube track: ' + err.message });
  }
}

// 4. Add authorized direct audio stream URL
async function addStreamTrack(req, res) {
  try {
    const { url, title, artist } = req.body;
    if (!url || !url.trim().startsWith('http')) {
      return res.status(400).json({ error: 'A valid http/https audio stream URL is required.' });
    }

    const trackId = `track-str-${uuidv4().slice(0, 8)}`;
    const trackTitle = (title && title.trim()) || 'Live Audio Stream';
    const trackArtist = (artist && artist.trim()) || 'Online Stream';
    const userId = req.user ? req.user.id : 'student';

    await dbRun(
      `INSERT INTO music_tracks (id, title, artist, source_type, source_url, duration, thumbnail_url, is_published, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        trackId,
        trackTitle,
        trackArtist,
        'stream',
        url.trim(),
        0,
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80',
        1,
        userId
      ]
    );

    const track = await dbGet('SELECT * FROM music_tracks WHERE id = ?', [trackId]);

    // Broadcast live sync
    broadcastSyncEvent('music_updated', {
      action: 'stream',
      track
    });

    res.status(201).json({
      message: 'Audio stream added to music library!',
      track
    });
  } catch (err) {
    console.error('addStreamTrack error:', err);
    res.status(500).json({ error: 'Failed to add audio stream: ' + err.message });
  }
}

// 5. Get user's playlists with tracks
async function getUserPlaylists(req, res) {
  try {
    const userId = req.user.id;
    const playlists = await dbAll(
      `SELECT p.*, COUNT(pt.track_id) as track_count
       FROM user_playlists p
       LEFT JOIN playlist_tracks pt ON p.id = pt.playlist_id
       WHERE p.user_id = ?
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [userId]
    );

    // Fetch tracks for each playlist
    const playlistsWithTracks = await Promise.all(
      playlists.map(async (pl) => {
        const tracks = await dbAll(
          `SELECT t.*, pt.added_at
           FROM playlist_tracks pt
           JOIN music_tracks t ON pt.track_id = t.id
           WHERE pt.playlist_id = ?
           ORDER BY pt.added_at ASC`,
          [pl.id]
        );
        return { ...pl, tracks };
      })
    );

    res.json({ playlists: playlistsWithTracks });
  } catch (err) {
    console.error('getUserPlaylists error:', err);
    res.status(500).json({ error: 'Failed to retrieve playlists' });
  }
}

// 6. Create new playlist
async function createPlaylist(req, res) {
  try {
    const { name, description = '' } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Playlist name is required.' });
    }

    const playlistId = `pl-${uuidv4().slice(0, 8)}`;
    await dbRun(
      'INSERT INTO user_playlists (id, user_id, name, description) VALUES (?, ?, ?, ?)',
      [playlistId, req.user.id, name.trim(), description.trim()]
    );

    const created = await dbGet('SELECT * FROM user_playlists WHERE id = ?', [playlistId]);
    res.status(201).json({
      message: 'Playlist created!',
      playlist: { ...created, tracks: [], track_count: 0 }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create playlist' });
  }
}

// 7. Add track to playlist
async function addTrackToPlaylist(req, res) {
  try {
    const { id } = req.params; // playlist_id
    const { trackId } = req.body;

    const playlist = await dbGet('SELECT * FROM user_playlists WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found.' });
    }

    const track = await dbGet('SELECT * FROM music_tracks WHERE id = ?', [trackId]);
    if (!track) {
      return res.status(404).json({ error: 'Track not found.' });
    }

    // Avoid duplicate
    const existing = await dbGet('SELECT * FROM playlist_tracks WHERE playlist_id = ? AND track_id = ?', [id, trackId]);
    if (existing) {
      return res.status(400).json({ error: 'Track already in playlist.' });
    }

    const ptId = `pt-${uuidv4().slice(0, 8)}`;
    await dbRun('INSERT INTO playlist_tracks (id, playlist_id, track_id) VALUES (?, ?, ?)', [ptId, id, trackId]);

    res.status(201).json({ message: 'Added track to playlist!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add track to playlist' });
  }
}

// 8. Remove track from playlist
async function removeTrackFromPlaylist(req, res) {
  try {
    const { id, trackId } = req.params;
    const playlist = await dbGet('SELECT * FROM user_playlists WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found.' });
    }

    await dbRun('DELETE FROM playlist_tracks WHERE playlist_id = ? AND track_id = ?', [id, trackId]);
    res.json({ message: 'Track removed from playlist' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove track from playlist' });
  }
}

// 9. Delete playlist
async function deletePlaylist(req, res) {
  try {
    const { id } = req.params;
    const result = await dbRun('DELETE FROM user_playlists WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    await dbRun('DELETE FROM playlist_tracks WHERE playlist_id = ?', [id]);
    res.json({ message: 'Playlist deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete playlist' });
  }
}

// 10. Get recently played tracks
async function getRecentlyPlayed(req, res) {
  try {
    const userId = req.user.id;
    const recent = await dbAll(
      `SELECT t.*, rp.played_at
       FROM recently_played rp
       JOIN music_tracks t ON rp.track_id = t.id
       WHERE rp.user_id = ?
       ORDER BY rp.played_at DESC
       LIMIT 20`,
      [userId]
    );

    res.json({ recent });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve recently played tracks' });
  }
}

// 11. Record recently played track
async function recordRecentlyPlayed(req, res) {
  try {
    const { trackId } = req.body;
    if (!trackId) {
      return res.status(400).json({ error: 'Track ID required' });
    }

    if (req.user) {
      const rpId = `rp-${uuidv4().slice(0, 8)}`;
      // Delete existing entry for this user & track so it floats to top
      await dbRun('DELETE FROM recently_played WHERE user_id = ? AND track_id = ?', [req.user.id, trackId]);
      await dbRun('INSERT INTO recently_played (id, user_id, track_id) VALUES (?, ?, ?)', [rpId, req.user.id, trackId]);
    }

    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record play' });
  }
}

// 12. Admin delete track from global library
async function adminDeleteTrack(req, res) {
  try {
    const { id } = req.params;
    const track = await dbGet('SELECT * FROM music_tracks WHERE id = ?', [id]);
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    // If it was an uploaded file, delete physical file
    if (track.source_type === 'upload' && track.source_url.startsWith('/api/music/stream/')) {
      const filename = path.basename(track.source_url);
      const filePath = path.join(__dirname, '../uploads/music', filename);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }
    }

    await dbRun('DELETE FROM playlist_tracks WHERE track_id = ?', [id]);
    await dbRun('DELETE FROM recently_played WHERE track_id = ?', [id]);
    await dbRun('DELETE FROM music_tracks WHERE id = ?', [id]);

    // Broadcast live sync
    broadcastSyncEvent('music_updated', {
      action: 'delete',
      trackId: id
    });

    res.json({ message: 'Track deleted from global music library' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete track' });
  }
}

module.exports = {
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
};
