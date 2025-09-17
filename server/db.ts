import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

const sqlite = new Database('./db.sqlite');
export const orm = drizzle(sqlite, { schema });

// Initialize DB tables if they don't exist (idempotent)
export function initDb() {
	sqlite.exec(`
		CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			name TEXT,
			email TEXT UNIQUE,
			username TEXT UNIQUE,
			password TEXT,
			role TEXT,
			school_id TEXT,
			subject TEXT,
			photo_url TEXT,
			approved INTEGER
		);
		CREATE TABLE IF NOT EXISTS schools (
			id TEXT PRIMARY KEY,
			name TEXT UNIQUE
		);
		CREATE TABLE IF NOT EXISTS applications (
			id TEXT PRIMARY KEY,
			user_id TEXT,
			status TEXT,
			submitted_at INTEGER
		);
		CREATE TABLE IF NOT EXISTS videos (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			description TEXT,
			type TEXT NOT NULL,
			url TEXT NOT NULL,
			thumbnail TEXT,
			credits INTEGER NOT NULL DEFAULT 1,
			uploaded_by TEXT NOT NULL,
			uploaded_at INTEGER NOT NULL,
			category TEXT,
			duration INTEGER
		);
		CREATE TABLE IF NOT EXISTS user_video_progress (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			video_id TEXT NOT NULL,
			watched INTEGER DEFAULT 0,
			watched_at INTEGER,
			credits_awarded INTEGER DEFAULT 0
		);
		CREATE TABLE IF NOT EXISTS user_credits (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL UNIQUE,
			total_credits INTEGER NOT NULL DEFAULT 0,
			last_updated INTEGER NOT NULL
		);
	`);
}
