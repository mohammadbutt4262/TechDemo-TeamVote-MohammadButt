import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(process.cwd(), 'database');
const DB_PATH = path.join(DB_DIR, 'teamvote.db');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

export const db = new Database(DB_PATH, { verbose: console.log });
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initializeSchema() {
  const createIdeasTable = `
    CREATE TABLE IF NOT EXISTS Ideas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      posterUsername TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createVotesTable = `
    CREATE TABLE IF NOT EXISTS Votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ideaId INTEGER NOT NULL,
      voterUsername TEXT NOT NULL,
      voteType TEXT CHECK (voteType IN ('upvote', 'downvote')) NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ideaId) REFERENCES Ideas(id) ON DELETE CASCADE,
      UNIQUE (ideaId, voterUsername)
    );
  `;
  
  db.exec(createIdeasTable);
  db.exec(createVotesTable);
  console.log('Database schema initialized.');
}

initializeSchema();

export interface IdeaSchema {
  id: number;
  title: string;
  description: string;
  posterUsername: string;
  createdAt: string;
}

export interface VoteSchema {
  id: number;
  ideaId: number;
  voterUsername: string;
  voteType: 'upvote' | 'downvote';
  createdAt: string;
}
