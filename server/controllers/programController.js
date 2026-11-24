const { v4: uuidv4 } = require('uuid');
const { dbRun, dbGet, dbAll } = require('../database');

async function getPrograms(req, res) {
  try {
    const userId = req.user.id;
    const { search = '', language = '', tag = '' } = req.query;

    let query = 'SELECT id, title, description, language, tags, is_public, share_id, created_at, updated_at FROM programs WHERE user_id = ?';
    const params = [userId];

    if (language) {
      query += ' AND LOWER(language) = ?';
      params.push(language.toLowerCase());
    }

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY updated_at DESC';

    let programs = await dbAll(query, params);

    // Filter by tag if requested
    if (tag) {
      programs = programs.filter(p => {
        try {
          const tagsArray = JSON.parse(p.tags || '[]');
          return tagsArray.includes(tag.toLowerCase());
        } catch (e) {
          return false;
        }
      });
    }

    res.json({ programs });
  } catch (err) {
    console.error('getPrograms error:', err);
    res.status(500).json({ error: 'Failed to retrieve programs.' });
  }
}

async function getProgramById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const program = await dbGet('SELECT * FROM programs WHERE id = ? AND user_id = ?', [id, userId]);
    if (!program) {
      return res.status(404).json({ error: 'Program not found.' });
    }

    res.json({ program });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve program.' });
  }
}

async function createProgram(req, res) {
  try {
    const userId = req.user.id;
    const { title, description = '', language, code, stdin = '', tags = [] } = req.body;

    if (!title || !language || code === undefined) {
      return res.status(400).json({ error: 'Title, language, and code are required.' });
    }

    const id = uuidv4();
    const shareId = uuidv4().slice(0, 8);
    const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : []);

    await dbRun(
      `INSERT INTO programs (id, user_id, title, description, language, code, stdin, tags, is_public, share_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, title.trim(), description.trim(), language.toLowerCase(), code, stdin, tagsJson, 0, shareId]
    );

    const created = await dbGet('SELECT * FROM programs WHERE id = ?', [id]);
    res.status(201).json({ program: created, message: 'Program created successfully.' });
  } catch (err) {
    console.error('createProgram error:', err);
    res.status(500).json({ error: 'Failed to create program.' });
  }
}

async function updateProgram(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, description, language, code, stdin, tags, is_public } = req.body;

    const existing = await dbGet('SELECT * FROM programs WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing) {
      return res.status(404).json({ error: 'Program not found or access denied.' });
    }

    const updatedTitle = title !== undefined ? title.trim() : existing.title;
    const updatedDesc = description !== undefined ? description.trim() : existing.description;
    const updatedLang = language !== undefined ? language.toLowerCase() : existing.language;
    const updatedCode = code !== undefined ? code : existing.code;
    const updatedStdin = stdin !== undefined ? stdin : existing.stdin;
    const updatedTags = tags !== undefined ? JSON.stringify(tags) : existing.tags;
    const updatedPublic = is_public !== undefined ? (is_public ? 1 : 0) : existing.is_public;

    await dbRun(
      `UPDATE programs 
       SET title = ?, description = ?, language = ?, code = ?, stdin = ?, tags = ?, is_public = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [updatedTitle, updatedDesc, updatedLang, updatedCode, updatedStdin, updatedTags, updatedPublic, id, userId]
    );

    const updated = await dbGet('SELECT * FROM programs WHERE id = ?', [id]);
    res.json({ program: updated, message: 'Program updated successfully.' });
  } catch (err) {
    console.error('updateProgram error:', err);
    res.status(500).json({ error: 'Failed to update program.' });
  }
}

async function deleteProgram(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await dbRun('DELETE FROM programs WHERE id = ? AND user_id = ?', [id, userId]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Program not found or access denied.' });
    }

    res.json({ message: 'Program deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete program.' });
  }
}

async function shareProgram(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const program = await dbGet('SELECT * FROM programs WHERE id = ? AND user_id = ?', [id, userId]);
    if (!program) {
      return res.status(404).json({ error: 'Program not found.' });
    }

    let shareId = program.share_id;
    if (!shareId) {
      shareId = uuidv4().slice(0, 8);
    }

    await dbRun('UPDATE programs SET is_public = 1, share_id = ? WHERE id = ?', [shareId, id]);

    res.json({
      shareId,
      shareUrl: `/shared/${shareId}`,
      message: 'Share link activated.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate share link.' });
  }
}

async function getSharedProgram(req, res) {
  try {
    const { shareId } = req.params;
    const program = await dbGet(
      `SELECT p.id, p.title, p.description, p.language, p.code, p.stdin, p.created_at, u.name as author_name 
       FROM programs p 
       LEFT JOIN users u ON p.user_id = u.id 
       WHERE p.share_id = ? AND p.is_public = 1`,
      [shareId]
    );

    if (!program) {
      return res.status(404).json({ error: 'Shared program not found or is no longer public.' });
    }

    res.json({ program });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch shared program.' });
  }
}

module.exports = {
  getPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
  shareProgram,
  getSharedProgram
};
