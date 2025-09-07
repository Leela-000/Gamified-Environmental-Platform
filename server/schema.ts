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
