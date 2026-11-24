const { v4: uuidv4 } = require('uuid');
const { dbAll, dbGet, dbRun } = require('../database');
const { broadcastSyncEvent } = require('../services/syncService');

async function getStats(req, res) {
  try {
    const totalUsersRow = await dbGet('SELECT COUNT(*) as count FROM users');
    const totalStudentsRow = await dbGet("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
    const totalAdminsRow = await dbGet("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
    const totalQuestionsRow = await dbGet('SELECT COUNT(*) as count FROM practice_problems');
    const publishedQuestionsRow = await dbGet('SELECT COUNT(*) as count FROM practice_problems WHERE is_published = 1');
    const totalSubmissionsRow = await dbGet('SELECT COUNT(*) as count FROM practice_submissions');
    const acceptedSubmissionsRow = await dbGet("SELECT COUNT(*) as count FROM practice_submissions WHERE status = 'ACCEPTED'");
    const totalProgramsRow = await dbGet('SELECT COUNT(*) as count FROM programs');

    // Most attempted problems
    const topProblems = await dbAll(
      `SELECT p.id, p.title, p.difficulty, p.topic, COUNT(s.id) as attempts,
              SUM(CASE WHEN s.status = 'ACCEPTED' THEN 1 ELSE 0 END) as accepted_count
       FROM practice_problems p
       LEFT JOIN practice_submissions s ON p.id = s.problem_id
       GROUP BY p.id
       ORDER BY attempts DESC
       LIMIT 6`
    );

    const totalSubmissions = totalSubmissionsRow ? totalSubmissionsRow.count : 0;
    const acceptedSubmissions = acceptedSubmissionsRow ? acceptedSubmissionsRow.count : 0;
    const acceptanceRate = totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;

    res.json({
      stats: {
        totalUsers: totalUsersRow?.count || 0,
        totalStudents: totalStudentsRow?.count || 0,
        totalAdmins: totalAdminsRow?.count || 0,
        totalQuestions: totalQuestionsRow?.count || 0,
        publishedQuestions: publishedQuestionsRow?.count || 0,
        draftQuestions: (totalQuestionsRow?.count || 0) - (publishedQuestionsRow?.count || 0),
        totalSubmissions,
        acceptedSubmissions,
        acceptanceRate,
        totalPrograms: totalProgramsRow?.count || 0
      },
      topProblems
    });
  } catch (err) {
    console.error('Admin getStats error:', err);
    res.status(500).json({ error: 'Failed to retrieve admin stats.' });
  }
}

async function getQuestions(req, res) {
  try {
    const questions = await dbAll(
      `SELECT p.*, COUNT(s.id) as attempts_count,
              SUM(CASE WHEN s.status = 'ACCEPTED' THEN 1 ELSE 0 END) as solves_count
       FROM practice_problems p
       LEFT JOIN practice_submissions s ON p.id = s.problem_id
       GROUP BY p.id
       ORDER BY p.created_at DESC`
    );

    const parsed = questions.map(q => {
      let templates = {};
      let testCases = [];
      try { templates = JSON.parse(q.starter_templates || '{}'); } catch (e) {}
      try { testCases = JSON.parse(q.test_cases || '[]'); } catch (e) {}

      return {
        ...q,
        is_published: !!q.is_published,
        starter_templates: templates,
        test_cases: testCases
      };
    });

    res.json({ questions: parsed });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve questions.' });
  }
}

async function createQuestion(req, res) {
  try {
    const {
      title,
      difficulty = 'Easy',
      topic = 'General Programming',
      description,
      input_format = '',
      output_format = '',
      constraints = '',
      starter_templates = {},
      test_cases = [],
      is_published = 1
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }

    const id = `prob-${uuidv4().slice(0, 8)}`;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

    const templatesJson = JSON.stringify(starter_templates);
    const testCasesJson = JSON.stringify(test_cases);

    await dbRun(
      `INSERT INTO practice_problems (id, title, slug, difficulty, topic, description, input_format, output_format, constraints, starter_templates, test_cases, is_published, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        title.trim(),
        slug,
        difficulty,
        topic.trim(),
        description.trim(),
        input_format.trim(),
        output_format.trim(),
        constraints.trim(),
        templatesJson,
        testCasesJson,
        is_published ? 1 : 0,
        req.user.id
      ]
    );

    const created = await dbGet('SELECT * FROM practice_problems WHERE id = ?', [id]);
    
    // Broadcast real-time sync event to all connected students and admins
    broadcastSyncEvent('question_updated', {
      action: 'create',
      questionId: id,
      question: created
    });

    res.status(201).json({
      message: 'Question added to global bank successfully.',
      question: created
    });
  } catch (err) {
    console.error('createQuestion error:', err);
    res.status(500).json({ error: 'Failed to create question: ' + err.message });
  }
}

async function updateQuestion(req, res) {
  try {
    const { id } = req.params;
    const existing = await dbGet('SELECT * FROM practice_problems WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    const {
      title,
      difficulty,
      topic,
      description,
      input_format,
      output_format,
      constraints,
      starter_templates,
      test_cases,
      is_published
    } = req.body;

    const newTitle = title !== undefined ? title.trim() : existing.title;
    const newDifficulty = difficulty !== undefined ? difficulty : existing.difficulty;
    const newTopic = topic !== undefined ? topic.trim() : existing.topic;
    const newDesc = description !== undefined ? description.trim() : existing.description;
    const newInputFmt = input_format !== undefined ? input_format.trim() : existing.input_format;
    const newOutputFmt = output_format !== undefined ? output_format.trim() : existing.output_format;
    const newConstraints = constraints !== undefined ? constraints.trim() : existing.constraints;
    const newTemplates = starter_templates !== undefined ? JSON.stringify(starter_templates) : existing.starter_templates;
    const newTestCases = test_cases !== undefined ? JSON.stringify(test_cases) : existing.test_cases;
    const newPublished = is_published !== undefined ? (is_published ? 1 : 0) : existing.is_published;

    await dbRun(
      `UPDATE practice_problems 
       SET title = ?, difficulty = ?, topic = ?, description = ?, input_format = ?, output_format = ?, constraints = ?, starter_templates = ?, test_cases = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [newTitle, newDifficulty, newTopic, newDesc, newInputFmt, newOutputFmt, newConstraints, newTemplates, newTestCases, newPublished, id]
    );

    const updated = await dbGet('SELECT * FROM practice_problems WHERE id = ?', [id]);

    // Broadcast real-time sync event
    broadcastSyncEvent('question_updated', {
      action: 'update',
      questionId: id,
      question: updated
    });

    res.json({
      message: 'Question updated successfully across platform.',
      question: updated
    });
  } catch (err) {
    console.error('updateQuestion error:', err);
    res.status(500).json({ error: 'Failed to update question.' });
  }
}

async function togglePublish(req, res) {
  try {
    const { id } = req.params;
    const existing = await dbGet('SELECT is_published FROM practice_problems WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    const newStatus = existing.is_published === 1 ? 0 : 1;
    await dbRun('UPDATE practice_problems SET is_published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newStatus, id]);

    // Broadcast real-time sync event
    broadcastSyncEvent('question_updated', {
      action: 'toggle',
      questionId: id,
      is_published: !!newStatus
    });

    res.json({
      is_published: !!newStatus,
      message: newStatus === 1 ? 'Question published globally to students.' : 'Question unpublished (moved to drafts).'
    });
  } catch (err) {
    console.error('togglePublish error:', err);
    res.status(500).json({ error: 'Failed to toggle publication status: ' + err.message });
  }
}

async function deleteQuestion(req, res) {
  try {
    const { id } = req.params;
    const result = await dbRun('DELETE FROM practice_problems WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    // Broadcast real-time sync event
    broadcastSyncEvent('question_updated', {
      action: 'delete',
      questionId: id
    });

    res.json({ message: 'Question deleted from global bank.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete question.' });
  }
}

async function getUsers(req, res) {
  try {
    const users = await dbAll(
      `SELECT u.id, u.name, u.email, u.role, u.created_at,
              COUNT(DISTINCT p.id) as programs_count,
              COUNT(DISTINCT s.id) as submissions_count
       FROM users u
       LEFT JOIN programs p ON u.id = p.user_id
       LEFT JOIN practice_submissions s ON u.id = s.user_id
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve users.' });
  }
}

async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || (role !== 'student' && role !== 'admin')) {
      return res.status(400).json({ error: 'Role must be student or admin.' });
    }

    await dbRun('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    res.json({ message: `User role updated to ${role}.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user role.' });
  }
}

module.exports = {
  getStats,
  getQuestions,
  createQuestion,
  updateQuestion,
  togglePublish,
  deleteQuestion,
  getUsers,
  updateUserRole
};
