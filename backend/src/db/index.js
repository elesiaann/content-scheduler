const path = require('path');
const fs = require('fs');

// On Vercel only /tmp is writable; locally use the data/ folder
const DB_PATH = process.env.VERCEL
  ? '/tmp/scheduler.db'
  : path.join(__dirname, '../../data/scheduler.db');

const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db;

// Wrap node-sqlite3-wasm statements so .run/.get/.all accept spread args like better-sqlite3
function wrapStmt(stmt) {
  return {
    run: (...args) => stmt.run(args.flat()),
    get: (...args) => stmt.get(args.flat()),
    all: (...args) => stmt.all(args.flat()),
    iterate: (...args) => stmt.iterate ? stmt.iterate(args.flat()) : [],
  };
}

function wrapDb(rawDb) {
  return {
    prepare: (sql) => wrapStmt(rawDb.prepare(sql)),
    exec: (sql) => rawDb.exec(sql),
    pragma: (str) => { try { rawDb.exec(`PRAGMA ${str}`); } catch {} },
    close: () => rawDb.close(),
    _raw: rawDb,
  };
}

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS platform_connections (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    page_id TEXT,
    page_name TEXT,
    expires_at DATETIME,
    is_connected INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    caption TEXT,
    media_url TEXT,
    media_type TEXT,
    media_path TEXT,
    platform TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    scheduled_at DATETIME,
    published_at DATETIME,
    facebook_post_id TEXT,
    tiktok_post_id TEXT,
    error_message TEXT,
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS analytics (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

function getDb() {
  if (!db) {
    try {
      // Primary: better-sqlite3 — works on Node 18/20/22 (Vercel default)
      const BetterSqlite3 = require('better-sqlite3');
      const rawDb = new BetterSqlite3(DB_PATH);
      rawDb.exec('PRAGMA journal_mode=WAL');
      rawDb.exec('PRAGMA foreign_keys=ON');
      rawDb.exec(SCHEMA_SQL);
      db = rawDb; // better-sqlite3 API matches our call sites directly
    } catch (primaryErr) {
      // Fallback: node-sqlite3-wasm — pure WASM, works on any Node version (e.g. Node 25 locally)
      console.warn('[DB] better-sqlite3 unavailable, using node-sqlite3-wasm:', primaryErr.message);
      const { Database } = require('node-sqlite3-wasm');
      const rawDb = new Database(DB_PATH);
      rawDb.exec('PRAGMA journal_mode=WAL');
      rawDb.exec('PRAGMA foreign_keys=ON');
      rawDb.exec(SCHEMA_SQL);
      db = wrapDb(rawDb);
    }
  }
  return db;
}

module.exports = { getDb };
