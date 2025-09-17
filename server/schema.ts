import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').unique(),
  username: text('username').unique(),
  password: text('password'),
  role: text('role'), // student, teacher, admin
  schoolId: text('school_id'),
  subject: text('subject'),
  photoUrl: text('photo_url'),
  approved: integer('approved', { mode: 'boolean' }),
});

export const schools = sqliteTable('schools', {
  id: text('id').primaryKey(),
  name: text('name').unique(),
});

export const applications = sqliteTable('applications', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  status: text('status'), // pending, approved, rejected
  submittedAt: integer('submitted_at'),
});

export const videos = sqliteTable('videos', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type').notNull(), // 'youtube' or 'file'
  url: text('url').notNull(), // YouTube URL or file path
  thumbnail: text('thumbnail'), // Thumbnail URL or path
  credits: integer('credits').notNull().default(1), // Credits awarded for watching
  uploadedBy: text('uploaded_by').notNull(), // User ID of uploader
  uploadedAt: integer('uploaded_at').notNull(),
  category: text('category'), // Optional categorization
  duration: integer('duration'), // Duration in seconds (for files)
});

export const userVideoProgress = sqliteTable('user_video_progress', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  videoId: text('video_id').notNull(),
  watched: integer('watched', { mode: 'boolean' }).default(false),
  watchedAt: integer('watched_at'),
  creditsAwarded: integer('credits_awarded', { mode: 'boolean' }).default(false),
});

export const userCredits = sqliteTable('user_credits', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  totalCredits: integer('total_credits').notNull().default(0),
  lastUpdated: integer('last_updated').notNull(),
});
