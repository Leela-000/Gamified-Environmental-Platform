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
	`);
}
