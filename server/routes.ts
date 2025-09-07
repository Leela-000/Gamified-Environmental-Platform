import express, { type Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage, type StudentApplication, type TeacherApplication } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve all assets under public/models (textures, bins, nested folders) so GLB dependencies resolve
  const modelsRoot = path.join(process.cwd(), 'public', 'models');
  app.use('/api/models', express.static(modelsRoot));

  // Serve any model from public/models safely
  app.get('/api/models/:file', (req, res) => {
    const { file } = req.params;
    // basic sanitization: only allow .glb or .gltf under public/models
    if (!/^[A-Za-z0-9._-]+\.(glb|gltf)$/.test(file)) {
      return res.status(400).json({ error: 'Invalid model filename' });
    }

    const filePath = path.join(process.cwd(), 'public', 'models', file);
    res.type(path.extname(filePath));
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error serving model file:', err);
        res.status(404).json({ error: 'Model not found' });
      }
    });
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Games catalog (public)
  app.get('/api/games', async (_req, res) => {
    const list = await (storage as any).listGames();
    res.json(list);
  });

  // Schools
  app.get('/api/schools', async (_req, res) => {
    const schools = await storage.listSchools();
    res.json(schools);
  });

  // Admin: add a new school/college (demo; no auth guard here)
  app.post('/api/admin/schools', async (req, res) => {
    const { name } = req.body ?? {};
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Invalid school name' });
    }
    const created = await storage.addSchool(name.trim());
    res.json(created);
  });

  // Admin: delete a school/college by id
  app.delete('/api/admin/schools/:id', async (req, res) => {
    const ok = await storage.removeSchool(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  });

  // Signups
  app.post('/api/signup/student', async (req, res) => {
    const { name, email, username, schoolId, id, rollNumber, className, section, photoDataUrl, password } = req.body ?? {};
    if (!name || !email || !username || !schoolId || !id) return res.status(400).json({ error: 'Missing fields' });
    if (!(await storage.isUsernameAvailable(username))) return res.status(409).json({ error: 'Username taken' });
    const appData: StudentApplication = {
      name,
      email,
      username,
      schoolId,
      studentId: id,
      rollNumber,
      className,
      section,
      photoDataUrl,
      password,
    };
    const created = await storage.addStudentApplication(appData);
    res.json(created);
  });

  app.post('/api/signup/teacher', async (req, res) => {
    const { name, email, username, schoolId, id, subject, photoDataUrl, password } = req.body ?? {};
    if (!name || !email || !username || !schoolId || !id) return res.status(400).json({ error: 'Missing fields' });
    if (!(await storage.isUsernameAvailable(username))) return res.status(409).json({ error: 'Username taken' });
    const appData: TeacherApplication = {
      name,
      email,
      username,
      schoolId,
      teacherId: id,
      subject,
      photoDataUrl,
      password,
    };
    const created = await storage.addTeacherApplication(appData);
    res.json(created);
  });

  // Admin approvals
  app.get('/api/admin/pending', async (_req, res) => {
    const data = await storage.listPending();
    res.json(data);
  });

  app.post('/api/admin/approve/:type/:id', async (req, res) => {
    const type = req.params.type === 'student' ? 'student' : 'teacher';
    const ok = await storage.approveApplication(type, req.params.id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  });

  // Convenience: approve all pending applications (demo helper)
  app.post('/api/admin/approve-all', async (_req, res) => {
    const data = await storage.listPending();
    let approvedStudents = 0;
    let approvedTeachers = 0;
    for (const s of data.students) {
      const ok = await storage.approveApplication('student', s.id!);
      if (ok) approvedStudents++;
    }
    for (const t of data.teachers) {
      const ok = await storage.approveApplication('teacher', t.id!);
      if (ok) approvedTeachers++;
    }
    res.json({ ok: true, approvedStudents, approvedTeachers });
  });

  // Admin: list users (demo; excludes passwords)
  app.get('/api/admin/users', async (_req, res) => {
  const users = (storage as any).users as Map<string, { id: string; username: string; password: string }>;
  const roles = (storage as any).roles as Map<string, 'student'|'teacher'|'admin'>;
  const list = Array.from(users?.values?.() ?? []).map(u => ({ username: u.username, role: roles?.get(u.id) || 'student' }));
    res.json(list);
  });

  // Admin: full user details by username
  app.get('/api/admin/user/:username', async (req, res) => {
    const { username } = req.params;
    if (!username) return res.status(400).json({ error: 'Missing username' });
    const details = await (storage as any).getUserDetails(username);
    res.json(details);
  });

  // Admin: reset password for a username (demo only, no auth)
  app.post('/api/admin/reset-password', async (req, res) => {
    const { username, password } = req.body ?? {};
    if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  const ok = await storage.resetPassword(username, password);
  if (!ok) return res.status(404).json({ error: 'User not found' });
  res.json({ ok: true });
  });

  // Admin: unapprove a user (move back to pending)
  app.post('/api/admin/unapprove', async (req, res) => {
    const { username } = req.body ?? {};
    if (!username) return res.status(400).json({ error: 'Missing username' });
    const ok = await storage.unapproveUser(username);
    if (!ok) return res.status(404).json({ error: 'User not found or cannot be unapproved' });
    res.json({ ok: true });
  });

  // Username and OTP
  app.get('/api/username-available/:username', async (req, res) => {
    const available = await storage.isUsernameAvailable(req.params.username);
    res.json({ available });
  });

  // Basic login (in-memory; demo only)
  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body ?? {};
    if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
    // naive check across users
    const users = (storage as any).users as Map<string, any>;
    const roles = (storage as any).roles as Map<string, 'student'|'teacher'|'admin'>;
    const found = Array.from(users?.values?.() ?? []).find((u) => u.username === username && u.password === password);
    if (!found) return res.status(401).json({ ok: false });
    const role = roles?.get(found.id) ?? 'student';
    res.json({ ok: true, role, username: found.username });
  });

  // Public: application status by username (pending/approved/none)
  app.get('/api/application-status/:username', async (req, res) => {
    const username = req.params.username;
    if (!username) return res.status(400).json({ error: 'Missing username' });
    try {
      const status = await storage.getApplicationStatus(username);
      res.json({ status });
    } catch (e) {
      res.status(500).json({ error: 'Status check failed' });
    }
  });

  app.post('/api/otp/request', async (req, res) => {
    const { email } = req.body ?? {};
    if (!email) return res.status(400).json({ error: 'Email required' });
    // Generate a simple 6-digit code; in memory only.
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await storage.saveOtp(email, code, 5 * 60 * 1000);
    // Simulate sending email by logging to server output.
    console.log(`[OTP] ${email} -> ${code}`);
    res.json({ ok: true });
  });

  app.post('/api/otp/verify', async (req, res) => {
    const { email, code } = req.body ?? {};
    if (!email || !code) return res.status(400).json({ error: 'Email and code required' });
    const ok = await storage.verifyOtp(email, code);
    res.json({ ok });
  });

  // ===== Self Profile (Teacher/Student/Admin) =====
  app.get('/api/me/profile', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    if (!current) return res.status(401).json({ error: 'Missing username' });
    const p = await (storage as any).getOwnProfile(current);
    if (!p) return res.status(404).json({ error: 'Not found' });
    res.json(p);
  });
  app.put('/api/me/profile', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    if (!current) return res.status(401).json({ error: 'Missing username' });
    const r = await (storage as any).updateOwnProfile(current, req.body ?? {});
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.profile);
  });

  // Admin accounts CRUD
  app.get('/api/admin/admins', async (_req, res) => {
    const list = await storage.listAdmins();
    res.json(list);
  });
  app.post('/api/admin/admins', async (req, res) => {
    const { username, password, name, email } = req.body ?? {};
    const r = await storage.createAdmin({ username, password, name, email });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });
  app.put('/api/admin/admins/:username', async (req, res) => {
    const current = (req.headers['x-username'] as string) || undefined;
    const r = await storage.updateAdmin(req.params.username, req.body ?? {}, current);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });
  app.delete('/api/admin/admins/:username', async (req, res) => {
    const r = await storage.deleteAdmin(req.params.username);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });

  // Dev-only seeding of teacher tasks
  if (process.env.NODE_ENV !== 'production') {
    app.post('/api/dev/seed-teacher-tasks', async (req, res) => {
      try {
        const teacher = (req.body?.username as string) || 'test_teacher';
        const count = Number.isFinite(req.body?.count) ? Math.max(1, Math.min(100, Number(req.body.count))) : 12;
        const create = async (input: any) => {
          return await (storage as any).createTask(teacher, input);
        };
        const pool = [
          { title: 'Recycle Drive', description: 'Collect and sort recyclables from your neighborhood.', maxPoints: 8, proofType: 'photo', groupMode: 'group', maxGroupSize: 4 },
          { title: 'Plant a Tree', description: 'Plant a sapling and document the process.', maxPoints: 10, proofType: 'photo', groupMode: 'solo' },
          { title: 'Clean-Up Challenge', description: 'Clean a local area and show before/after photos.', maxPoints: 9, proofType: 'photo', groupMode: 'group', maxGroupSize: 5 },
          { title: 'Water Audit', description: 'Audit household water usage and suggest savings.', maxPoints: 7, proofType: 'text', groupMode: 'solo' },
          { title: 'Energy Saver Week', description: 'Track and reduce electricity consumption for a week.', maxPoints: 8, proofType: 'text', groupMode: 'solo' },
          { title: 'Eco Poster', description: 'Design a poster promoting an eco-friendly habit.', maxPoints: 6, proofType: 'photo', groupMode: 'solo' },
          { title: 'Compost Starter', description: 'Start a compost bin and log the steps.', maxPoints: 8, proofType: 'photo', groupMode: 'group', maxGroupSize: 3 },
          { title: 'Biodiversity Walk', description: 'List 10 species found in your area with photos.', maxPoints: 9, proofType: 'photo', groupMode: 'group', maxGroupSize: 4 },
          { title: 'Plastic-Free Day', description: 'Go plastic-free for a day and report findings.', maxPoints: 7, proofType: 'text', groupMode: 'solo' },
          { title: 'Rainwater Harvesting Plan', description: 'Draft a simple harvesting plan for your building.', maxPoints: 10, proofType: 'text', groupMode: 'group', maxGroupSize: 4 },
          { title: 'School Garden Duty', description: 'Maintain a garden patch for a week.', maxPoints: 8, proofType: 'photo', groupMode: 'group', maxGroupSize: 5 },
          { title: 'Green Transport Day', description: 'Use non-motorized or public transport; log your route.', maxPoints: 6, proofType: 'text', groupMode: 'solo' },
        ];
        const created: any[] = [];
        for (let i = 0; i < count; i++) {
          const base = pool[i % pool.length];
          const variant = {
            ...base,
            title: `${base.title} #${i + 1}`,
            deadline: undefined,
          };
          const r = await create(variant);
          if (r?.ok) created.push(r.task);
        }
        res.json({ ok: true, count: created.length, username: teacher });
      } catch (e) {
        res.status(500).json({ error: 'Seed failed' });
      }
    });
    // Dev: seed quizzes (supports bulk). If no body provided, falls back to demo seeding.
    app.post('/api/dev/seed-quizzes', async (req, res) => {
      try {
        const body = req.body ?? {};
        const adminCount = Number.isFinite(body.adminCount) ? Math.max(0, Math.min(100, Number(body.adminCount))) : undefined;
        const teacherCount = Number.isFinite(body.teacherCount) ? Math.max(0, Math.min(100, Number(body.teacherCount))) : undefined;
        const adminUsername = (body.adminUsername as string) || 'admin123';
        const teacherUsername = (body.teacherUsername as string) || 'test_teacher';

        if (adminCount == null && teacherCount == null) {
          // Back-compat: simple demo seed via storage helper
          const { storage } = await import('./storage');
          (storage as any).seedDemoQuizzes?.();
          return res.json({ ok: true, mode: 'demo' });
        }

        // Build quiz factory
        const topics = [
          'Climate Action', 'Oceans', 'Forests', 'Wildlife', 'Renewables',
          'Water Conservation', 'Recycling', 'Pollution', 'Sustainable Cities', 'Energy Efficiency',
          'Biodiversity', 'Soil Health', 'Green Transport', 'Circular Economy', 'Air Quality',
        ];
        const optBank = [
          'Reduce carbon emissions', 'Increase plastic use', 'Cut more trees', 'Ignore pollution',
          'Install solar panels', 'Burn more coal', 'Dump waste in oceans', 'Save energy at home',
        ];
        const makeQuestion = (qIdx: number) => {
          const correctIndex = Math.floor(Math.random() * 4);
          const base = qIdx % (optBank.length - 4);
          const options = [0,1,2,3].map((i) => optBank[(base + i) % optBank.length]);
          const text = `Q${qIdx + 1}. Choose the best eco-friendly action.`;
          return { id: qIdx + 1, text, options, answerIndex: correctIndex };
        };
        const makeQuiz = (i: number, scope: 'global' | 'school') => {
          const title = `${scope === 'global' ? 'Global' : 'School'} Quiz ${i + 1}: ${topics[i % topics.length]}`;
          const description = `Test your knowledge on ${topics[i % topics.length]}.`;
          const points = 10 + (i % 5) * 2;
          const questions = Array.from({ length: 5 }, (_, qi) => makeQuestion(qi));
          return { title, description, points, questions };
        };

        let adminCreated = 0;
        let teacherCreated = 0;
        const createAdminQuiz = async (q: any) => {
          const r = await (storage as any).createAdminQuiz(adminUsername, q);
          if (r?.ok !== false) adminCreated++;
        };
        const createTeacherQuiz = async (q: any) => {
          const r = await (storage as any).createQuiz(teacherUsername, q);
          if (r?.ok !== false) teacherCreated++;
        };

        // Ensure teacher/admin may exist (best-effort, ignore failures if already present)
        try { await (storage as any).createAdmin?.({ username: adminUsername, password: 'admin@1234', name: 'Admin', email: `${adminUsername}@example.com` }); } catch {}

        // Seed admin quizzes
        if (adminCount && adminCount > 0) {
          for (let i = 0; i < adminCount; i++) {
            await createAdminQuiz(makeQuiz(i, 'global'));
          }
        }
        // Seed teacher quizzes
        if (teacherCount && teacherCount > 0) {
          for (let i = 0; i < teacherCount; i++) {
            await createTeacherQuiz(makeQuiz(i, 'school'));
          }
        }

        res.json({ ok: true, adminCreated, teacherCreated, adminUsername, teacherUsername });
      } catch (e) {
        res.status(500).json({ error: 'Seed failed' });
      }
    });

    // Dev: seed many schools and approved students for leaderboard demos
    app.post('/api/dev/seed-schools-students', async (req, res) => {
      try {
        const body = req.body ?? {};
        const schools = Math.max(0, Math.min(100, Math.floor(Number(body.schools) || 0)));
        const students = Math.max(0, Math.min(10000, Math.floor(Number(body.students) || 0)));
        const adminUsername = (body.adminUsername as string) || 'admin123';
        const r = await (storage as any).seedSchoolsAndStudents({ schools, students, adminUsername });
        res.json({ ok: true, ...r, adminUsername });
      } catch (e) {
        res.status(500).json({ error: 'Seed failed' });
      }
    });
  }

  // ===== Teacher & Student: Tasks and Submissions =====
  // Create a new task (Teacher only)
  app.post('/api/teacher/tasks', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const { title, description, deadline, proofType, maxPoints, groupMode, maxGroupSize } = req.body ?? {};
    const r = await (storage as any).createTask(current, { title, description, deadline, proofType, maxPoints, groupMode, maxGroupSize });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r);
  });
  // List tasks created by this teacher
  app.get('/api/teacher/tasks', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const list = await (storage as any).listTeacherTasks(current);
    res.json(list);
  });
  // List submissions for teacher (optionally by task)
  app.get('/api/teacher/submissions', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const taskId = (req.query.taskId as string) || undefined;
    const list = await (storage as any).listSubmissionsForTeacher(current, taskId);
    res.json(list);
  });
  // Review a submission (approve/reject with points)
  app.post('/api/teacher/submissions/:id/review', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const { status, points, feedback } = req.body ?? {};
    const r = await (storage as any).reviewSubmission(current, req.params.id, { status, points, feedback });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });
  // Student: list available tasks (for their school) with submission status
  app.get('/api/student/tasks', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const list = await (storage as any).listStudentTasks(current);
    res.json(list);
  });
  // Student: submit task proof (photo data URL)
  app.post('/api/student/tasks/:id/submit', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const { photoDataUrl, photos } = req.body ?? {};
    const payload = Array.isArray(photos) ? photos : photoDataUrl;
    const r = await (storage as any).submitTask(current, req.params.id, payload);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r);
  });

  // Groups: create or fetch
  app.post('/api/student/tasks/:id/group', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const { members } = req.body ?? {};
    const r = await (storage as any).createTaskGroup(current, req.params.id, members || []);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r);
  });
  app.get('/api/student/tasks/:id/group', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const g = await (storage as any).getTaskGroupForStudent(current, req.params.id);
    res.json(g);
  });

  // ===== Teacher: Announcements =====
  app.post('/api/teacher/announcements', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const { title, body } = req.body ?? {};
    const r = await (storage as any).createAnnouncement(current, { title, body });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.announcement);
  });
  app.get('/api/teacher/announcements', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const list = await (storage as any).listAnnouncementsForTeacher(current);
    res.json(list);
  });

  // ===== Admin: Global Announcements =====
  app.post('/api/admin/announcements', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const { title, body } = req.body ?? {};
    const r = await (storage as any).createAdminAnnouncement(current, { title, body });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.announcement);
  });
  app.get('/api/admin/announcements', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const list = await (storage as any).listAdminAnnouncements(current);
    res.json(list);
  });

  // ===== Student: Announcements (global + school) =====
  app.get('/api/student/announcements', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const list = await (storage as any).listStudentAnnouncements(current);
    res.json(list);
  });

  // ===== Teacher: Assignments =====
  app.post('/api/teacher/assignments', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const { title, description, deadline, maxPoints } = req.body ?? {};
    const r = await (storage as any).createAssignment(current, { title, description, deadline, maxPoints });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.assignment);
  });
  app.get('/api/teacher/assignments', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const list = await (storage as any).listTeacherAssignments(current);
    res.json(list);
  });

  // ===== Admin: Global Assignments =====
  app.post('/api/admin/assignments', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const { title, description, deadline, maxPoints } = req.body ?? {};
    const r = await (storage as any).createAdminAssignment(current, { title, description, deadline, maxPoints });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.assignment);
  });
  app.get('/api/admin/assignments', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const list = await (storage as any).listAdminAssignments(current);
    res.json(list);
  });

  // ===== Student: Assignments & Submissions =====
  app.get('/api/student/assignments', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const list = await (storage as any).listStudentAssignments(current);
    res.json(list);
  });
  app.post('/api/student/assignments/:id/submit', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const { files } = req.body ?? {};
    const payload = Array.isArray(files) ? files : [];
    const r = await (storage as any).submitAssignment(current, req.params.id, payload);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r);
  });

  // ===== Teacher: Assignment Submissions review =====
  app.get('/api/teacher/assignment-submissions', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const assignmentId = (req.query.assignmentId as string) || undefined;
    const list = await (storage as any).listAssignmentSubmissionsForTeacher(current, assignmentId);
    res.json(list);
  });
  app.post('/api/teacher/assignment-submissions/:id/review', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const { status, points, feedback } = req.body ?? {};
    const r = await (storage as any).reviewAssignmentSubmission(current, req.params.id, { status, points, feedback });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });

  // ===== Teacher: Quizzes =====
  app.post('/api/teacher/quizzes', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const { title, description, points, questions } = req.body ?? {};
    const r = await (storage as any).createQuiz(current, { title, description, points, questions });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.quiz);
  });
  app.get('/api/teacher/quizzes', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const list = await (storage as any).listTeacherQuizzes(current);
    res.json(list);
  });
  // Update a teacher quiz
  app.put('/api/teacher/quizzes/:id', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const r = await (storage as any).updateQuiz(current, req.params.id, req.body ?? {});
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.quiz);
  });
  // Delete a teacher quiz
  app.delete('/api/teacher/quizzes/:id', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const r = await (storage as any).deleteQuiz(current, req.params.id);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });

  // ===== Admin: Global Quizzes =====
  app.post('/api/admin/quizzes', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const { title, description, points, questions } = req.body ?? {};
    const r = await (storage as any).createAdminQuiz(current, { title, description, points, questions });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.quiz);
  });
  app.get('/api/admin/quizzes', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const list = await (storage as any).listAdminQuizzes(current);
    res.json(list);
  });
  // Update a global quiz (admin)
  app.put('/api/admin/quizzes/:id', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const r = await (storage as any).updateAdminQuiz(current, req.params.id, req.body ?? {});
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.quiz);
  });
  // Delete a global quiz (admin)
  app.delete('/api/admin/quizzes/:id', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const r = await (storage as any).deleteAdminQuiz(current, req.params.id);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });

  // ===== Student: Discover quizzes =====
  app.get('/api/student/quizzes', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const list = await (storage as any).listStudentQuizzes(current);
    const sanitized = (Array.isArray(list) ? list : []).map((q: any) => ({
      ...q,
      questions: (q.questions || []).map((qq: any) => ({ id: qq.id, text: qq.text, options: qq.options })),
    }));
    res.json(sanitized);
  });

  // ===== Admin: Games management =====
  app.get('/api/admin/games', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const list = await (storage as any).listAdminGames(current);
    res.json(list);
  });
  app.post('/api/admin/games', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const r = await (storage as any).createAdminGame(current, req.body ?? {});
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.game);
  });
  app.put('/api/admin/games/:id', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const r = await (storage as any).updateAdminGame(current, req.params.id, req.body ?? {});
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.game);
  });
  app.delete('/api/admin/games/:id', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const r = await (storage as any).deleteAdminGame(current, req.params.id);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });

  // Student: fetch own attempt for a quiz
  app.get('/api/student/quizzes/:id/attempt', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const a = await (storage as any).getStudentQuizAttempt(current, req.params.id);
    res.json(a || null);
  });

  // Public: fetch quiz by id (metadata without answers)
  app.get('/api/quizzes/:id', async (req, res) => {
    const q = await (storage as any).getQuizById(req.params.id);
    if (!q) return res.status(404).json({ error: 'Not found' });
    const sanitized = { ...q, questions: q.questions.map((qq: any) => ({ id: qq.id, text: qq.text, options: qq.options })) };
    res.json(sanitized);
  });

  // Secure scoring: compute score server-side using answer keys
  app.post('/api/quizzes/:id/score', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    if (!current) return res.status(401).json({ error: 'Missing username' });
    const q = await (storage as any).getQuizById(req.params.id);
    if (!q) return res.status(404).json({ error: 'Not found' });
    // ensure only students can score and quiz is available to them
    const me = await (storage as any).getOwnProfile(current);
    if (!me || me.role !== 'student') return res.status(403).json({ error: 'Only students can attempt' });
    const schoolId = me.schoolId;
    const allowed = q.visibility === 'global' || (!!schoolId && q.schoolId === schoolId);
    if (!allowed) return res.status(403).json({ error: 'Quiz not available' });
    const answers: number[] = Array.isArray(req.body?.answers) ? req.body.answers.map((n: any) => Number(n)) : [];
    const total = q.questions.length || 0;
    if (total === 0) return res.json({ ok: true, correct: 0, total: 0, percent: 0 });
    let correct = 0;
      const details: Array<{ index: number; correctIndex: number; selected: number; isCorrect: boolean }> = [];
      for (let i = 0; i < total; i++) {
        const choice = answers[i];
        const correctIndex = (q.questions[i] as any).answerIndex;
        const isCorrect = Number.isFinite(choice) && choice === correctIndex;
        if (isCorrect) correct++;
        details.push({ index: i, correctIndex, selected: Number.isFinite(choice) ? choice : -1, isCorrect });
    }
    const percent = Math.round((correct / total) * 100);
    res.json({ ok: true, correct, total, percent, details });
  });

  // ===== Teacher: Students & Overview =====
  app.get('/api/teacher/students', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const list = await (storage as any).listStudentsForTeacher(current);
    res.json(list);
  });
  app.get('/api/teacher/overview', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const data = await (storage as any).getTeacherOverview(current);
    res.json(data);
  });

  // ===== Student Profile (view + privacy)
  app.get('/api/student/profile', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const p = await (storage as any).getStudentProfile(current);
    if (!p) return res.status(404).json({ error: 'Not found' });
    res.json(p);
  });
  app.put('/api/student/profile/privacy', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const allow = !!(req.body?.allowExternalView);
    const r = await (storage as any).setStudentPrivacy(current, allow);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });

  // ===== Activity logging =====
  app.post('/api/student/quiz-attempts', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
  const { quizId, scorePercent, answers } = req.body ?? {};
  const r = await (storage as any).addQuizAttempt(current, { quizId, scorePercent, answers });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.attempt);
  });
  app.post('/api/student/games/:gameId/play', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const points = Number(req.body?.points);
    const r = await (storage as any).addGamePlay(current, req.params.gameId, Number.isFinite(points) ? points : undefined);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.play);
  });

  // Games: summary for progress UI
  app.get('/api/student/games/summary', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    if (!current) return res.status(401).json({ error: 'Missing username' });
    const summary = await (storage as any).getStudentGameSummary(current);
    res.json(summary);
  });

  // Public: list all games (admin-managed catalog)
  app.get('/api/games', async (_req, res) => {
    const list = await (storage as any).listGames();
    res.json(list);
  });

  // Admin: manage games catalog
  app.get('/api/admin/games', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const list = await (storage as any).listAdminGames(current);
    res.json(list);
  });
  app.post('/api/admin/games', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const { id, name, category, description, difficulty, points, icon } = req.body ?? {};
    const r = await (storage as any).createAdminGame(current, { id, name, category, description, difficulty, points, icon });
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.game);
  });
  app.put('/api/admin/games/:id', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const r = await (storage as any).updateAdminGame(current, req.params.id, req.body ?? {});
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json(r.game);
  });
  app.delete('/api/admin/games/:id', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const r = await (storage as any).deleteAdminGame(current, req.params.id);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });

  // ===== Notifications =====
  app.get('/api/notifications', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const list = await (storage as any).listNotifications(current);
    res.json(list);
  });
  app.post('/api/notifications/read', async (req, res) => {
    const current = (req.headers['x-username'] as string) || '';
    const r = await (storage as any).markAllNotificationsRead(current);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ ok: true });
  });

  // ===== Leaderboard =====
  // Global: top schools
  app.get('/api/leaderboard/schools', async (req, res) => {
    const limit = Math.max(1, Math.min(500, Number(req.query.limit) || 25));
    const rows = await (storage as any).getGlobalSchoolsLeaderboard(limit);
    res.json(rows);
  });
  // School: top students
  app.get('/api/leaderboard/school/:schoolId/students', async (req, res) => {
    const limit = Math.max(1, Math.min(200, Number(req.query.limit) || 50));
    const offset = Math.max(0, Number(req.query.offset) || 0);
    const rows = await (storage as any).getSchoolStudentsLeaderboard(req.params.schoolId, limit, offset);
    res.json(rows);
  });
  // Global: top students (optional school filter)
  app.get('/api/leaderboard/students', async (req, res) => {
    const limit = Math.max(1, Math.min(500, Number(req.query.limit) || 50));
    const offset = Math.max(0, Number(req.query.offset) || 0);
    const schoolId = (req.query.schoolId as string) || null;
    const rows = await (storage as any).getGlobalStudentsLeaderboard(limit, offset, schoolId);
    res.json(rows);
  });
  // Global: top teachers (optional school filter)
  app.get('/api/leaderboard/teachers', async (req, res) => {
    const limit = Math.max(1, Math.min(500, Number(req.query.limit) || 50));
    const offset = Math.max(0, Number(req.query.offset) || 0);
    const schoolId = (req.query.schoolId as string) || null;
    const rows = await (storage as any).getGlobalTeachersLeaderboard(limit, offset, schoolId);
    res.json(rows);
  });
  // School preview
  app.get('/api/leaderboard/school/:schoolId/preview', async (req, res) => {
    const data = await (storage as any).getSchoolPreview(req.params.schoolId);
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  });
  // Student preview
  app.get('/api/leaderboard/student/:username/preview', async (req, res) => {
    const data = await (storage as any).getStudentPreview(req.params.username);
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  });
  // Teacher preview
  app.get('/api/leaderboard/teacher/:username/preview', async (req, res) => {
    const data = await (storage as any).getTeacherPreview(req.params.username);
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  });
  // Admin analytics
  app.get('/api/leaderboard/admin/analytics', async (_req, res) => {
    const data = await (storage as any).getAdminLeaderboardAnalytics();
    res.json(data);
  });

  const httpServer = createServer(app);

  return httpServer;
}
