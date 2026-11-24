const { v4: uuidv4 } = require('uuid');
const { dbAll, dbGet, dbRun } = require('../database');
const { executeCode } = require('../services/executor');

function normalizeOutput(str) {
  if (!str) return '';
  return str
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .trim();
}

async function getProblems(req, res) {
  try {
    const { difficulty, topic } = req.query;
    const isAdmin = req.user && req.user.role === 'admin';

    // Normal students only see published questions; Admins see all
    let query = 'SELECT id, title, slug, difficulty, topic, description, is_published FROM practice_problems WHERE 1=1';
    const params = [];

    if (!isAdmin) {
      query += ' AND (is_published = 1 OR is_published IS NULL)';
    }

    if (difficulty && difficulty.toLowerCase() !== 'all') {
      const d = difficulty.toLowerCase();
      if (d === 'easy' || d === 'beginner') {
        query += " AND (LOWER(difficulty) = 'easy' OR LOWER(difficulty) = 'beginner')";
      } else if (d === 'medium' || d === 'intermediate') {
        query += " AND (LOWER(difficulty) = 'medium' OR LOWER(difficulty) = 'intermediate')";
      } else if (d === 'hard' || d === 'advanced') {
        query += " AND (LOWER(difficulty) = 'hard' OR LOWER(difficulty) = 'advanced')";
      } else {
        query += ' AND LOWER(difficulty) = ?';
        params.push(d);
      }
    }

    if (topic && topic.toLowerCase() !== 'all') {
      query += ' AND LOWER(topic) = ?';
      params.push(topic.toLowerCase());
    }

    query += ' ORDER BY id ASC';
    const problems = await dbAll(query, params);

    // If user is authenticated, check their solved and attempted status
    let userSubmissions = [];
    if (req.user) {
      userSubmissions = await dbAll(
        'SELECT problem_id, status FROM practice_submissions WHERE user_id = ?',
        [req.user.id]
      );
    }

    const solvedSet = new Set(userSubmissions.filter(s => s.status === 'ACCEPTED').map(s => s.problem_id));
    const attemptedSet = new Set(userSubmissions.map(s => s.problem_id));

    const enriched = problems.map(p => ({
      ...p,
      isSolved: solvedSet.has(p.id),
      isAttempted: attemptedSet.has(p.id) && !solvedSet.has(p.id)
    }));

    res.json({ problems: enriched });
  } catch (err) {
    console.error('getProblems error:', err);
    res.status(500).json({ error: 'Failed to fetch practice problems.' });
  }
}

async function getProblemById(req, res) {
  try {
    const { id } = req.params;
    const problem = await dbGet('SELECT * FROM practice_problems WHERE id = ? OR slug = ?', [id, id]);
    if (!problem) {
      return res.status(404).json({ error: 'Practice problem not found.' });
    }

    const templates = JSON.parse(problem.starter_templates || '{}');
    const allTestCases = JSON.parse(problem.test_cases || '[]');
    // Only expose sample test cases in description payload
    const sampleTestCases = allTestCases.filter(tc => tc.is_sample).map(tc => ({
      input: tc.input,
      expected_output: tc.expected_output
    }));

    res.json({
      problem: {
        id: problem.id,
        title: problem.title,
        slug: problem.slug,
        difficulty: problem.difficulty,
        topic: problem.topic,
        description: problem.description,
        input_format: problem.input_format,
        output_format: problem.output_format,
        constraints: problem.constraints,
        starter_templates: templates,
        sample_test_cases: sampleTestCases
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch problem details.' });
  }
}

async function submitProblem(req, res) {
  try {
    const { id } = req.params;
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required for submission.' });
    }

    const problem = await dbGet('SELECT * FROM practice_problems WHERE id = ? OR slug = ?', [id, id]);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found.' });
    }

    const testCases = JSON.parse(problem.test_cases || '[]');
    if (testCases.length === 0) {
      return res.status(400).json({ error: 'No test cases configured for this problem.' });
    }

    const results = [];
    let passedCount = 0;
    let overallStatus = 'ACCEPTED';
    let firstErrorExplanation = null;

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const execResult = await executeCode({
        language,
        code,
        stdin: tc.input || '',
        timeout: 5000
      });

      if (!execResult.success) {
        overallStatus = execResult.status;
        firstErrorExplanation = execResult.explanation;
        results.push({
          testCaseIndex: i + 1,
          passed: false,
          isSample: !!tc.is_sample,
          input: tc.is_sample ? tc.input : '[Hidden Test Case]',
          expectedOutput: tc.is_sample ? tc.expected_output : '[Hidden]',
          actualOutput: tc.is_sample ? execResult.stdout : '[Hidden]',
          error: execResult.stderr,
          status: execResult.status,
          executionTime: execResult.executionTime
        });
        break; // Stop on first failure/error
      }

      const actualNorm = normalizeOutput(execResult.stdout);
      const expectedNorm = normalizeOutput(tc.expected_output);
      const passed = actualNorm === expectedNorm;

      if (passed) {
        passedCount++;
        results.push({
          testCaseIndex: i + 1,
          passed: true,
          isSample: !!tc.is_sample,
          input: tc.is_sample ? tc.input : '[Hidden Test Case]',
          expectedOutput: tc.is_sample ? tc.expected_output : '[Hidden]',
          actualOutput: tc.is_sample ? actualNorm : '[Hidden]',
          status: 'SUCCESS',
          executionTime: execResult.executionTime
        });
      } else {
        overallStatus = 'WRONG_ANSWER';
        results.push({
          testCaseIndex: i + 1,
          passed: false,
          isSample: !!tc.is_sample,
          input: tc.is_sample ? tc.input : '[Hidden Test Case]',
          expectedOutput: tc.is_sample ? expectedNorm : '[Hidden]',
          actualOutput: tc.is_sample ? actualNorm : '[Hidden]',
          status: 'WRONG_ANSWER',
          executionTime: execResult.executionTime
        });
        break;
      }
    }

    // Record submission if user logged in
    const userId = req.user ? req.user.id : 'guest';
    try {
      await dbRun(
        `INSERT INTO practice_submissions (id, user_id, problem_id, language, code, status, passed_count, total_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          userId,
          problem.id,
          language,
          code.slice(0, 5000),
          overallStatus,
          passedCount,
          testCases.length
        ]
      );
    } catch (dbErr) {
      console.warn('Failed to record submission:', dbErr.message);
    }

    res.json({
      status: overallStatus,
      passedCount,
      totalCount: testCases.length,
      allPassed: passedCount === testCases.length,
      explanation: firstErrorExplanation,
      results
    });
  } catch (err) {
    console.error('submitProblem error:', err);
    res.status(500).json({ error: 'Failed to evaluate submission.' });
  }
}

module.exports = {
  getProblems,
  getProblemById,
  submitProblem
};
