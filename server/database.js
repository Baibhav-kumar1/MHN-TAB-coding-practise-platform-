const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let dbPath = path.join(__dirname, 'ojt_playground.db');
if (process.env.VERCEL) {
  const tmpDbPath = path.join('/tmp', 'ojt_playground.db');
  try {
    if (fs.existsSync(dbPath) && !fs.existsSync(tmpDbPath)) {
      fs.copyFileSync(dbPath, tmpDbPath);
    }
  } catch (e) {
    console.warn('Could not copy sqlite db to /tmp, will initialize fresh:', e.message);
  }
  dbPath = tmpDbPath;
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to SQLite database', err);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Promisified database helpers
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Initialize schema
const initDB = async () => {
  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'student',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS programs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      language TEXT NOT NULL,
      code TEXT NOT NULL,
      stdin TEXT DEFAULT '',
      tags TEXT DEFAULT '[]',
      is_public INTEGER DEFAULT 0,
      share_id TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS practice_problems (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      difficulty TEXT NOT NULL,
      topic TEXT NOT NULL,
      description TEXT NOT NULL,
      input_format TEXT,
      output_format TEXT,
      constraints TEXT,
      starter_templates TEXT,
      test_cases TEXT,
      is_published INTEGER DEFAULT 1,
      created_by TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Safe column migration for practice_problems
  try {
    await dbRun(`ALTER TABLE practice_problems ADD COLUMN is_published INTEGER DEFAULT 1`);
  } catch (e) {}
  try {
    await dbRun(`ALTER TABLE practice_problems ADD COLUMN created_by TEXT DEFAULT 'admin'`);
  } catch (e) {}
  try {
    await dbRun(`ALTER TABLE practice_problems ADD COLUMN updated_at DATETIME`);
  } catch (e) {}

  await dbRun(`
    CREATE TABLE IF NOT EXISTS practice_submissions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      problem_id TEXT,
      language TEXT NOT NULL,
      code TEXT NOT NULL,
      status TEXT NOT NULL,
      passed_count INTEGER DEFAULT 0,
      total_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS execution_history (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      language TEXT NOT NULL,
      code TEXT NOT NULL,
      status TEXT NOT NULL,
      execution_time REAL DEFAULT 0,
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // AI Assistant Tables
  await dbRun(`
    CREATE TABLE IF NOT EXISTS ai_conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT NOT NULL,
      language TEXT,
      code_context TEXT,
      error_context TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS ai_messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      message TEXT NOT NULL,
      suggested_code TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE
    )
  `);

  // Focus Music Player Tables
  await dbRun(`
    CREATE TABLE IF NOT EXISTS music_tracks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      artist TEXT DEFAULT 'Unknown Artist',
      source_type TEXT NOT NULL, -- 'upload', 'youtube', 'stream'
      source_url TEXT NOT NULL,
      duration INTEGER DEFAULT 0,
      thumbnail_url TEXT,
      is_published INTEGER DEFAULT 1,
      created_by TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS user_playlists (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS playlist_tracks (
      id TEXT PRIMARY KEY,
      playlist_id TEXT NOT NULL,
      track_id TEXT NOT NULL,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (playlist_id) REFERENCES user_playlists(id) ON DELETE CASCADE,
      FOREIGN KEY (track_id) REFERENCES music_tracks(id) ON DELETE CASCADE
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS recently_played (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      track_id TEXT NOT NULL,
      played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (track_id) REFERENCES music_tracks(id) ON DELETE CASCADE
    )
  `);

  console.log('Database tables successfully initialized.');
};

module.exports = {
  db,
  dbRun,
  dbAll,
  dbGet,
  initDB
};
