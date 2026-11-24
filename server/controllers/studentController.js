const { dbAll, dbGet } = require('../database');

async function getDashboardStats(req, res) {
  try {
    const userId = req.user.id;

    // 1. User profile
    const user = await dbGet('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // 2. Total programs created
    const programsCountRow = await dbGet('SELECT COUNT(*) as count FROM programs WHERE user_id = ?', [userId]);
    const totalPrograms = programsCountRow ? programsCountRow.count : 0;

    // 3. Questions stats
    // Total published problems in system
    const totalProblemsRow = await dbGet('SELECT COUNT(*) as count FROM practice_problems WHERE is_published = 1');
    const totalPublishedProblems = totalProblemsRow ? totalProblemsRow.count : 0;

    // Questions attempted by student
    const attemptedRow = await dbGet(
      'SELECT COUNT(DISTINCT problem_id) as count FROM practice_submissions WHERE user_id = ?',
      [userId]
    );
    const totalAttempted = attemptedRow ? attemptedRow.count : 0;

    // Questions solved by student
    const solvedRow = await dbGet(
      "SELECT COUNT(DISTINCT problem_id) as count FROM practice_submissions WHERE user_id = ? AND status = 'ACCEPTED'",
      [userId]
    );
    const totalSolved = solvedRow ? solvedRow.count : 0;
    const totalPending = Math.max(0, totalPublishedProblems - totalSolved);

    // 4. Difficulty Breakdown (Easy, Medium, Hard)
    const difficulties = ['Easy', 'Medium', 'Hard'];
    const difficultyStats = {};

    for (const diff of difficulties) {
      const totalDiffRow = await dbGet(
        'SELECT COUNT(*) as count FROM practice_problems WHERE is_published = 1 AND LOWER(difficulty) = ?',
        [diff.toLowerCase()]
      );
      const totalInDiff = totalDiffRow ? totalDiffRow.count : 0;

      const solvedDiffRow = await dbGet(
        `SELECT COUNT(DISTINCT p.id) as count 
         FROM practice_problems p
         JOIN practice_submissions s ON p.id = s.problem_id
         WHERE s.user_id = ? AND s.status = 'ACCEPTED' AND LOWER(p.difficulty) = ?`,
        [userId, diff.toLowerCase()]
      );
      const solvedInDiff = solvedDiffRow ? solvedDiffRow.count : 0;

      difficultyStats[diff] = {
        total: totalInDiff,
        solved: solvedInDiff,
        percentage: totalInDiff > 0 ? Math.round((solvedInDiff / totalInDiff) * 100) : 0
      };
    }

    // 5. Recent Programs
    const recentPrograms = await dbAll(
      `SELECT id, title, description, language, tags, updated_at, created_at 
       FROM programs 
       WHERE user_id = ? 
       ORDER BY updated_at DESC 
       LIMIT 6`,
      [userId]
    );

    // 6. Execution History Timeline
    const executionTimeline = await dbAll(
      `SELECT id, language, status, execution_time, created_at 
       FROM execution_history 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 15`,
      [userId]
    );

    // 7. Languages Used Breakdown (from user programs + executions)
    const langStats = await dbAll(
      `SELECT language, COUNT(*) as count 
       FROM (
         SELECT language FROM programs WHERE user_id = ?
         UNION ALL
         SELECT language FROM execution_history WHERE user_id = ?
       ) 
       GROUP BY language 
       ORDER BY count DESC`,
      [userId, userId]
    );

    const totalLangUsage = langStats.reduce((acc, curr) => acc + curr.count, 0);
    const languageDistribution = langStats.map(l => ({
      language: l.language,
      count: l.count,
      percentage: totalLangUsage > 0 ? Math.round((l.count / totalLangUsage) * 100) : 0
    }));

    // 8. Recent AI Conversations
    const recentAiChats = await dbAll(
      `SELECT id, title, language, updated_at 
       FROM ai_conversations 
       WHERE user_id = ? 
       ORDER BY updated_at DESC 
       LIMIT 5`,
      [userId]
    );

    // 9. Total test submissions count
    const totalSubmissionsRow = await dbGet(
      'SELECT COUNT(*) as count FROM practice_submissions WHERE user_id = ?',
      [userId]
    );
    const totalSubmissions = totalSubmissionsRow ? totalSubmissionsRow.count : 0;

    res.json({
      user,
      stats: {
        totalPrograms,
        totalPublishedProblems,
        totalAttempted,
        totalSolved,
        totalPending,
        totalSubmissions,
        solveRate: totalPublishedProblems > 0 ? Math.round((totalSolved / totalPublishedProblems) * 100) : 0,
        difficultyStats,
        languageDistribution
      },
      recentPrograms,
      executionTimeline,
      recentAiChats
    });
  } catch (err) {
    console.error('Student dashboard error:', err);
    res.status(500).json({ error: 'Failed to retrieve student dashboard data.' });
  }
}

module.exports = {
  getDashboardStats
};
