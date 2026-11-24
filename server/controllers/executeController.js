const { executeCode } = require('../services/executor');
const { dbRun, dbAll } = require('../database');
const { v4: uuidv4 } = require('uuid');

async function execute(req, res) {
  try {
    const { language, code, stdin = '' } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        status: 'BAD_REQUEST',
        stdout: '',
        stderr: 'Code payload cannot be empty.',
        executionTime: 0
      });
    }

    if (!language) {
      return res.status(400).json({
        success: false,
        status: 'BAD_REQUEST',
        stdout: '',
        stderr: 'Please select a programming language.',
        executionTime: 0
      });
    }

    const result = await executeCode({ language, code, stdin });

    // Record execution history if user is available or guest
    const userId = req.user ? req.user.id : 'guest';
    try {
      await dbRun(
        `INSERT INTO execution_history (id, user_id, language, code, status, execution_time, error_message)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          userId,
          language,
          code.slice(0, 5000), // truncate code if gigantic
          result.status,
          result.executionTime,
          result.stderr ? result.stderr.slice(0, 1000) : null
        ]
      );
    } catch (dbErr) {
      console.warn('Failed to record execution history:', dbErr.message);
    }

    res.json(result);
  } catch (err) {
    console.error('Execute route error:', err);
    res.status(500).json({
      success: false,
      status: 'SERVER_ERROR',
      stdout: '',
      stderr: `Internal execution error: ${err.message}`,
      executionTime: 0
    });
  }
}

async function getHistory(req, res) {
  try {
    const userId = req.user ? req.user.id : 'guest';
    const history = await dbAll(
      `SELECT id, language, code, status, execution_time, error_message, created_at 
       FROM execution_history 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 30`,
      [userId]
    );
    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
}

module.exports = {
  execute,
  getHistory
};
