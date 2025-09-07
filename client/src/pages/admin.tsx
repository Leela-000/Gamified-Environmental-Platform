import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function AdminPortal() {
  const { role, clear } = useAuth();
  const [pending, setPending] = useState<{ students: any[]; teachers: any[] }>({ students: [], teachers: [] });
  const [users, setUsers] = useState<Array<{ username: string; role: string }>>([]);
  const [resetting, setResetting] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  // Tabs must be declared before any early returns to keep hooks order stable
  const [tab, setTab] = useState(0);
  const tabNames = [
    'Approval List',
    'Manage Admin Accounts',
    'Manage All Accounts',
    'Challenges & Games',
  'Quizzes Management',
  'Schools & Colleges',
  'Global Quizzes',
  'Global Announcements',
  'Global Assignments',
  ];

  const load = async () => {
    const data = await fetch('/api/admin/pending').then(r => r.json());
    setPending(data);
  };

  const loadUsers = async () => {
    try {
      const data = await fetch('/api/admin/users').then(r => r.json());
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    }
  };

  useEffect(() => {
    if (role === 'admin') {
      load();
      loadUsers();
    }
  }, [role]);

  const approve = async (type: 'student' | 'teacher', id: string) => {
    await fetch(`/api/admin/approve/${type}/${id}`, { method: 'POST' });
    await load();
    await loadUsers();
  };

  const approveAll = async () => {
    await fetch('/api/admin/approve-all', { method: 'POST' });
    await load();
    await loadUsers();
  };

  const resetPassword = async (username: string, password?: string) => {
    // Ask for a custom password if not provided
    const pwd = password ?? prompt(`Set new password for @${username}`, '') ?? '';
    const finalPwd = pwd.trim();
    if (!finalPwd) return; // cancelled
    setResetting(username);
    await fetch('/api/admin/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password: finalPwd }) });
    setResetting(null);
  };

  const unapprove = async (username: string) => {
    if (!confirm(`Move @${username} back to pending?`)) return;
    try {
      const res = await fetch('/api/admin/unapprove', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username }) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        alert(err?.error || 'Failed to move to pending');
        return;
      }
      const json = await res.json().catch(() => ({} as any));
      if (!json?.ok) {
        alert('Failed to move to pending');
        return;
      }
      await load();
      await loadUsers();
      alert(`@${username} moved to pending.`);
    } catch (e) {
      alert('Network error while moving to pending');
    }
  };

  const openDetails = async (username: string) => {
    setLoadingDetails(true);
    try {
      const d = await fetch(`/api/admin/user/${encodeURIComponent(username)}`).then(r => r.json());
      setSelectedUser(d);
    } finally {
      setLoadingDetails(false);
    }
  };
  if (role !== 'admin') {
    return (
      <div className="min-h-screen bg-space-gradient text-white p-6 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Admin Portal</h1>
        <p className="text-earth-muted">Access denied. Please log in as an admin.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-gradient text-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Admin Portal</h1>
        <Button variant="secondary" onClick={clear}>Logout</Button>
      </div>
      <div className="flex gap-4 mb-8">
        {tabNames.map((name, i) => (
          <Button key={name} variant={tab === i ? 'default' : 'secondary'} onClick={() => setTab(i)}>{name}</Button>
        ))}
      </div>

      {tab === 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Approval List</h2>
          <Button className="bg-earth-orange hover:bg-earth-orange-hover mb-4" onClick={approveAll}>Approve All Pending</Button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section>
              <h3 className="text-lg font-semibold mb-2">Pending Students</h3>
              <div className="space-y-3">
                {pending.students.length === 0 && <p className="text-earth-muted">No pending students.</p>}
                {pending.students.map((s) => (
                  <div key={s.id} className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">
                    <div className="font-medium">{s.name} (@{s.username})</div>
                    <div className="text-sm text-earth-muted">{s.email}</div>
                    <div className="text-xs text-earth-muted mt-1">School: {s.schoolId} • Student ID: {s.studentId} • Roll: {s.rollNumber || '-'} • Class: {s.className || '-'} • Section: {s.section || '-'}</div>
                    <Button className="mt-2 bg-earth-orange hover:bg-earth-orange-hover" onClick={() => approve('student', s.id)}>Approve</Button>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h3 className="text-lg font-semibold mb-2">Pending Teachers</h3>
              <div className="space-y-3">
                {pending.teachers.length === 0 && <p className="text-earth-muted">No pending teachers.</p>}
                {pending.teachers.map((t) => (
                  <div key={t.id} className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">
                    <div className="font-medium">{t.name} (@{t.username})</div>
                    <div className="text-sm text-earth-muted">{t.email}</div>
                    <div className="text-xs text-earth-muted mt-1">School: {t.schoolId} • Teacher ID: {t.teacherId} • Subject: {t.subject || '-'}</div>
                    <Button className="mt-2 bg-earth-orange hover:bg-earth-orange-hover" onClick={() => approve('teacher', t.id)}>Approve</Button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      {tab === 1 && (
        <AdminAccounts />
      )}

      {tab === 2 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Manage All Accounts</h2>
          <div className="space-y-2">
            {users.length === 0 && <p className="text-earth-muted">No users yet.</p>}
            {users.map(u => (
              <div key={u.username} className="flex items-center justify-between p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">
                <div className="cursor-pointer" onClick={() => openDetails(u.username)} title="View details">
                  <div className="font-medium">@{u.username}</div>
                  <div className="text-xs text-earth-muted">Role: {u.role}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={() => openDetails(u.username)}>View Profile</Button>
                  <Button variant="secondary" onClick={() => navigator.clipboard?.writeText(u.username)}>Copy Username</Button>
                  <Button className="bg-earth-orange hover:bg-earth-orange-hover" onClick={() => resetPassword(u.username)} disabled={resetting === u.username}>
                    {resetting === u.username ? 'Saving…' : 'Set Custom Password'}
                  </Button>
                  {u.role !== 'admin' && (
                    <Button className="bg-red-600 hover:bg-red-700" onClick={() => unapprove(u.username)}>
                      Move to Pending
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {selectedUser && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={() => setSelectedUser(null)}>
              <div className="max-w-lg w-full rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)] p-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">@{selectedUser.username || selectedUser.name || 'User'} Details</h3>
                  <Button variant="secondary" onClick={() => setSelectedUser(null)}>Close</Button>
                </div>
        {loadingDetails ? (
                  <div className="text-earth-muted">Loading…</div>
                ) : (
                  <div className="space-y-1 text-sm">
          <div><span className="text-earth-muted">Status:</span> {selectedUser.status}</div>
          <div><span className="text-earth-muted">Username:</span> {selectedUser.username}</div>
                    {selectedUser.role && <div><span className="text-earth-muted">Role:</span> {selectedUser.role}</div>}
          {selectedUser.password && <div><span className="text-earth-muted">Password:</span> {selectedUser.password}</div>}
                    {selectedUser.name && <div><span className="text-earth-muted">Name:</span> {selectedUser.name}</div>}
                    {selectedUser.email && <div><span className="text-earth-muted">Email:</span> {selectedUser.email}</div>}
                    {selectedUser.schoolId && <div><span className="text-earth-muted">School:</span> {selectedUser.schoolId}</div>}
                    {selectedUser.studentId && <div><span className="text-earth-muted">Student ID:</span> {selectedUser.studentId}</div>}
                    {selectedUser.teacherId && <div><span className="text-earth-muted">Teacher ID:</span> {selectedUser.teacherId}</div>}
                    {selectedUser.subject && <div><span className="text-earth-muted">Subject:</span> {selectedUser.subject}</div>}
                    {selectedUser.rollNumber && <div><span className="text-earth-muted">Roll No:</span> {selectedUser.rollNumber}</div>}
                    {selectedUser.className && <div><span className="text-earth-muted">Class/Year:</span> {selectedUser.className}</div>}
                    {selectedUser.section && <div><span className="text-earth-muted">Section:</span> {selectedUser.section}</div>}
                    {selectedUser.photoDataUrl && (
                      <div className="pt-2">
                        <img src={selectedUser.photoDataUrl} alt="Profile" className="h-20 w-20 object-cover rounded-full" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 3 && (
        <AdminGamesManager />
      )}

      {tab === 4 && (
        <AdminQuizManager />
      )}

      {tab === 5 && (
        <SchoolsManager />
      )}

      {tab === 6 && (
        <GlobalQuizzes />
      )}
      {tab === 7 && (
        <GlobalAnnouncements />
      )}
      {tab === 8 && (
        <GlobalAssignments />
      )}
    </div>
  );
}

function AdminGamesManager() {
  const { username } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{ id?: string; name: string; category: string; description?: string; difficulty?: 'Easy'|'Medium'|'Hard'|''; points: number; icon?: string }>({ name: '', category: '', description: '', difficulty: 'Easy', points: 5, icon: '' });

  const load = async () => {
    const data = await fetch('/api/admin/games', { headers: { 'X-Username': username || '' } }).then(r => r.json());
    setList(Array.isArray(data) ? data : []);
  };
  useEffect(() => { load(); }, []);

  const reset = () => { setEditingId(null); setForm({ name: '', category: '', description: '', difficulty: 'Easy', points: 5, icon: '' }); };
  const startEdit = (g: any) => { setEditingId(g.id); setForm({ id: g.id, name: g.name||'', category: g.category||'', description: g.description||'', difficulty: g.difficulty||'Easy', points: g.points||5, icon: g.icon||'' }); };
  const create = async () => {
    if (!form.name.trim() || !form.category.trim()) return alert('Name and category required');
    const res = await fetch('/api/admin/games', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify(form) });
    if (!res.ok) { const e = await res.json().catch(()=>({} as any)); return alert(e?.error || 'Failed to create'); }
    reset(); await load();
  };
  const save = async () => {
    if (!editingId) return;
    const { id, ...updates } = form as any;
    const res = await fetch(`/api/admin/games/${encodeURIComponent(editingId)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify(updates) });
    if (!res.ok) { const e = await res.json().catch(()=>({} as any)); return alert(e?.error || 'Failed to update'); }
    reset(); await load();
  };
  const del = async (id: string) => {
    if (!confirm('Delete this game?')) return;
    const res = await fetch(`/api/admin/games/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { 'X-Username': username || '' } });
    if (!res.ok) { const e = await res.json().catch(()=>({} as any)); return alert(e?.error || 'Failed to delete'); }
    if (editingId === id) reset();
    await load();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Challenges & Games</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">{editingId ? 'Edit Game' : 'Create Game'}</h3>
          <div className="space-y-2 text-sm">
            <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder="Name" value={form.name} onChange={e=>setForm({ ...form, name: e.target.value })} />
            <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder="Category (e.g., recycling, habits)" value={form.category} onChange={e=>setForm({ ...form, category: e.target.value })} />
            <textarea className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder="Description (optional)" value={form.description} onChange={e=>setForm({ ...form, description: e.target.value })} />
            <div className="flex items-center gap-2">
              <span className="text-earth-muted">Points (1–50)</span>
              <input className="w-24 rounded-lg px-3 py-2 text-[var(--foreground)]" type="number" min={1} max={50} value={form.points} onChange={e=>setForm({ ...form, points: Number(e.target.value)||0 })} />
              <span className="text-earth-muted">Difficulty</span>
              <select className="rounded-lg px-3 py-2 text-[var(--foreground)]" value={form.difficulty||''} onChange={e=>setForm({ ...form, difficulty: (e.target.value as any) })}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder="Icon (emoji or name)" value={form.icon} onChange={e=>setForm({ ...form, icon: e.target.value })} />
            <div className="flex gap-2">
              {editingId ? (
                <>
                  <Button className="bg-earth-orange hover:bg-earth-orange-hover" onClick={save}>Save Changes</Button>
                  <Button variant="secondary" onClick={reset}>Cancel</Button>
                </>
              ) : (
                <Button className="bg-earth-orange hover:bg-earth-orange-hover" onClick={create}>Create Game</Button>
              )}
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">All Games</h3>
          <div className="space-y-2">
            {list.length === 0 && <p className="text-sm text-earth-muted">No games yet.</p>}
            {list.map(g => (
              <div key={g.id} className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">
                <div className="font-medium flex items-center justify-between">
                  <span>{g.icon ? `${g.icon} ` : ''}{g.name} <span className="text-xs text-earth-muted">• {g.points} pts{g.difficulty ? ` • ${g.difficulty}` : ''} • {g.category}</span></span>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={()=>startEdit(g)}>Edit</Button>
                    <Button className="bg-red-600 hover:bg-red-700" onClick={()=>del(g.id)}>Delete</Button>
                  </div>
                </div>
                {g.description && <div className="text-sm text-earth-muted whitespace-pre-wrap">{g.description}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SchoolsManager() {
  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const load = async () => {
    const data = await fetch('/api/schools').then(r => r.json());
    setSchools(Array.isArray(data) ? data : []);
  };
  useEffect(() => { load(); }, []);
  const add = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await fetch('/api/admin/schools', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    setName("");
    setLoading(false);
    await load();
  };
  const remove = async (id: string) => {
    if (!confirm('Delete this school?')) return;
    await fetch(`/api/admin/schools/${id}`, { method: 'DELETE' });
    await load();
  };
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Schools & Colleges</h2>
      <div className="flex gap-2 mb-4">
        <input className="rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder="Add a school/college name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button className="bg-earth-orange hover:bg-earth-orange-hover" onClick={add} disabled={loading || !name.trim()}>
          {loading ? 'Adding…' : 'Add'}
        </Button>
      </div>
      <div className="space-y-2">
        {schools.length === 0 && <p className="text-earth-muted">No schools yet.</p>}
        {schools.map(s => (
          <div key={s.id} className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)] flex items-center justify-between">
            <span>{s.name}</span>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => navigator.clipboard?.writeText(s.name)}>Copy</Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={() => remove(s.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminAccounts() {
  const { username } = useAuth();
  const [admins, setAdmins] = useState<Array<{ username: string; name?: string; email?: string }>>([]);
  const [form, setForm] = useState({ username: '', password: '', name: '', email: '' });
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ username: string; name?: string; email?: string }>({ username: '' });

  const load = async () => {
    const data = await fetch('/api/admin/admins').then(r => r.json());
    setAdmins(Array.isArray(data) ? data : []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.username.trim() || !form.password.trim()) return alert('Username and password required');
    const res = await fetch('/api/admin/admins', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (!res.ok) {
      const e = await res.json().catch(() => ({} as any));
      return alert(e?.error || 'Failed to create admin');
    }
    setForm({ username: '', password: '', name: '', email: '' });
    await load();
  };

  const startEdit = (a: { username: string; name?: string; email?: string }) => {
    setEditing(a.username);
    setEditData({ username: a.username, name: a.name, email: a.email });
  };
  const saveEdit = async () => {
    if (!editing) return;
    const res = await fetch(`/api/admin/admins/${encodeURIComponent(editing)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify({ username: editData.username, name: editData.name, email: editData.email }) });
    if (!res.ok) {
      const e = await res.json().catch(() => ({} as any));
      return alert(e?.error || 'Failed to update admin');
    }
    setEditing(null);
    await load();
  };
  const del = async (username: string) => {
    if (!confirm(`Delete admin @${username}?`)) return;
    const res = await fetch(`/api/admin/admins/${encodeURIComponent(username)}`, { method: 'DELETE' });
    if (!res.ok) {
      const e = await res.json().catch(() => ({} as any));
      return alert(e?.error || 'Failed to delete admin');
    }
    await load();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Manage Admin Accounts</h2>
      <div className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)] mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input className="rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <input className="rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <input className="rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder="Name (optional)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder="Email (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="mt-3">
          <Button className="bg-earth-orange hover:bg-earth-orange-hover" onClick={create}>Create Admin</Button>
        </div>
  <p className="text-xs text-earth-muted mt-2">Note: Main admin @admin123 can only edit its own profile (name/email) and cannot be deleted. Username cannot be changed. Password can be changed from Manage All Accounts.</p>
      </div>

      <div className="space-y-2">
        {admins.map(a => (
          <div key={a.username} className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">
            {editing === a.username ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                <div>
                  <div className="text-xs text-earth-muted mb-1">Username</div>
                  <input className="rounded-lg px-3 py-2 text-[var(--foreground)] w-full" value={editData.username} onChange={(e) => setEditData({ ...editData, username: e.target.value })} disabled={a.username === 'admin123'} />
                </div>
                <div>
                  <div className="text-xs text-earth-muted mb-1">Name</div>
                  <input className="rounded-lg px-3 py-2 text-[var(--foreground)] w-full" value={editData.name || ''} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                </div>
                <div>
                  <div className="text-xs text-earth-muted mb-1">Email</div>
                  <input className="rounded-lg px-3 py-2 text-[var(--foreground)] w-full" value={editData.email || ''} onChange={(e) => setEditData({ ...editData, email: e.target.value })} />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
                  <Button className="bg-earth-orange hover:bg-earth-orange-hover" onClick={saveEdit}>Save</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">@{a.username}{a.username === 'admin123' && ' (main)'}</div>
                  <div className="text-xs text-earth-muted">{a.name || '-'}{a.email ? ` • ${a.email}` : ''}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => startEdit(a)} disabled={a.username === 'admin123' && username !== 'admin123'}>Edit</Button>
                  <Button className="bg-red-600 hover:bg-red-700" onClick={() => del(a.username)} disabled={a.username === 'admin123'}>Delete</Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function GlobalQuizzes() {
  const { username } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState(3);
  const [questions, setQuestions] = useState<Array<{ text: string; options: string[]; answerIndex: number }>>([
    { text: '', options: ['', ''], answerIndex: 0 },
  ]);
  const load = async () => {
    const data = await fetch('/api/admin/quizzes', { headers: { 'X-Username': username || '' } }).then(r => r.json());
    setList(Array.isArray(data) ? data : []);
  };
  useEffect(() => { load(); }, []);

  const addQuestion = () => setQuestions(qs => [...qs, { text: '', options: ['', ''], answerIndex: 0 }]);
  const addOption = (qi: number) => setQuestions(qs => qs.map((q,i)=> i===qi ? { ...q, options: q.options.length < 4 ? [...q.options, ''] : q.options } : q));
  const updateQ = (qi: number, patch: Partial<{ text: string; options: string[]; answerIndex: number }>) => setQuestions(qs => qs.map((q,i)=> i===qi ? { ...q, ...patch } : q));
  const updateOpt = (qi: number, oi: number, val: string) => setQuestions(qs => qs.map((q,i)=> i===qi ? { ...q, options: q.options.map((o,j)=> j===oi ? val : o) } : q));

  const create = async () => {
    if (!title.trim()) return;
    const body = { title, description, points, questions };
    const res = await fetch('/api/admin/quizzes', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify(body) });
    if (!res.ok) {
      const e = await res.json().catch(()=>({} as any));
      return alert(e?.error || 'Failed to create quiz');
    }
    setTitle(''); setDescription(''); setPoints(3); setQuestions([{ text: '', options: ['', ''], answerIndex: 0 }]);
    await load();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Global Quizzes</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Create Global Quiz</h3>
          <div className="space-y-2 text-sm">
            <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
            <textarea className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder="Description (optional)" value={description} onChange={e=>setDescription(e.target.value)} />
            <div className="flex items-center gap-2">
              <span className="text-earth-muted">Points (1–3)</span>
              <input className="w-24 rounded-lg px-3 py-2 text-[var(--foreground)]" type="number" min={1} max={3} value={points} onChange={e=>setPoints(Number(e.target.value))} />
            </div>
            <div className="space-y-3">
              {questions.map((q, qi) => (
                <div key={qi} className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">
                  <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)] mb-2" placeholder={`Question ${qi+1}`} value={q.text} onChange={e=>updateQ(qi, { text: e.target.value })} />
                  {q.options.map((o, oi) => (
                    <div key={oi} className="flex items-center gap-2 mb-2">
                      <input className="flex-1 rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder={`Option ${oi+1}`} value={o} onChange={e=>updateOpt(qi, oi, e.target.value)} />
                      <label className="text-xs text-earth-muted flex items-center gap-1">
                        <input type="radio" name={`ans-admin-${qi}`} checked={q.answerIndex === oi} onChange={()=>updateQ(qi, { answerIndex: oi })} /> Correct
                      </label>
                    </div>
                  ))}
                  {q.options.length < 4 && (
                    <Button variant="secondary" onClick={()=>addOption(qi)}>Add Option</Button>
                  )}
                </div>
              ))}
              <Button variant="secondary" onClick={addQuestion}>Add Question</Button>
            </div>
            <Button className="bg-earth-orange hover:bg-earth-orange-hover" onClick={create}>Create Global Quiz</Button>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">All Global Quizzes</h3>
          <div className="space-y-2">
            {list.length === 0 && <p className="text-sm text-earth-muted">No global quizzes yet.</p>}
            {list.map(q => (
              <div key={q.id} className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">
                <div className="font-medium">{q.title} <span className="text-xs text-earth-muted">• {q.points} pts • {q.questions?.length||0} Qs</span></div>
                {q.description && <div className="text-sm text-earth-muted">{q.description}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminQuizManager() {
  const { username } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState(3);
  const [questions, setQuestions] = useState<Array<{ id?: string; text: string; options: string[]; answerIndex: number }>>([
    { text: '', options: ['', ''], answerIndex: 0 },
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    const data = await fetch('/api/admin/quizzes', { headers: { 'X-Username': username || '' } }).then(r => r.json());
    setList(Array.isArray(data) ? data : []);
  };
  useEffect(() => { load(); }, []);

  const addQuestion = () => setQuestions(qs => [...qs, { text: '', options: ['', ''], answerIndex: 0 }]);
  const addOption = (qi: number) => setQuestions(qs => qs.map((q,i)=> i===qi ? { ...q, options: q.options.length < 4 ? [...q.options, ''] : q.options } : q));
  const updateQ = (qi: number, patch: Partial<{ text: string; options: string[]; answerIndex: number }>) => setQuestions(qs => qs.map((q,i)=> i===qi ? { ...q, ...patch } : q));
  const updateOpt = (qi: number, oi: number, val: string) => setQuestions(qs => qs.map((q,i)=> i===qi ? { ...q, options: q.options.map((o,j)=> j===oi ? val : o) } : q));

  const resetForm = () => {
    setTitle(''); setDescription(''); setPoints(3); setQuestions([{ text: '', options: ['', ''], answerIndex: 0 }]); setEditingId(null);
  };

  const create = async () => {
    if (!title.trim()) return;
    const body = { title, description, points, questions };
    const res = await fetch('/api/admin/quizzes', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify(body) });
    if (!res.ok) {
      const e = await res.json().catch(()=>({} as any));
      return alert(e?.error || 'Failed to create quiz');
    }
    resetForm();
    await load();
  };

  const startEdit = (q: any) => {
    setEditingId(q.id);
    setTitle(q.title || '');
    setDescription(q.description || '');
    setPoints(q.points || 3);
    setQuestions((q.questions || []).map((qq: any) => ({ id: qq.id, text: qq.text, options: qq.options || [], answerIndex: qq.answerIndex || 0 })));
  };
  const saveEdit = async () => {
    if (!editingId) return;
    const body = { title, description, points, questions };
    const res = await fetch(`/api/admin/quizzes/${encodeURIComponent(editingId)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify(body) });
    if (!res.ok) {
      const e = await res.json().catch(()=>({} as any));
      return alert(e?.error || 'Failed to update quiz');
    }
    resetForm();
    await load();
  };
  const del = async (id: string) => {
    if (!confirm('Delete this quiz?')) return;
    const res = await fetch(`/api/admin/quizzes/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { 'X-Username': username || '' } });
    if (!res.ok) {
      const e = await res.json().catch(()=>({} as any));
      return alert(e?.error || 'Failed to delete quiz');
    }
    if (editingId === id) resetForm();
    await load();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Quizzes Management</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">{editingId ? 'Edit Global Quiz' : 'Create Global Quiz'}</h3>
          <div className="space-y-2 text-sm">
            <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
            <textarea className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder="Description (optional)" value={description} onChange={e=>setDescription(e.target.value)} />
            <div className="flex items-center gap-2">
              <span className="text-earth-muted">Points (1–3)</span>
              <input className="w-24 rounded-lg px-3 py-2 text-[var(--foreground)]" type="number" min={1} max={3} value={points} onChange={e=>setPoints(Number(e.target.value))} />
            </div>
            <div className="space-y-3">
              {questions.map((q, qi) => (
                <div key={qi} className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">
                  <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)] mb-2" placeholder={`Question ${qi+1}`} value={q.text} onChange={e=>updateQ(qi, { text: e.target.value })} />
                  {q.options.map((o, oi) => (
                    <div key={oi} className="flex items-center gap-2 mb-2">
                      <input className="flex-1 rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder={`Option ${oi+1}`} value={o} onChange={e=>updateOpt(qi, oi, e.target.value)} />
                      <label className="text-xs text-earth-muted flex items-center gap-1">
                        <input type="radio" name={`ans-admin-mgr-${qi}`} checked={q.answerIndex === oi} onChange={()=>updateQ(qi, { answerIndex: oi })} /> Correct
                      </label>
                    </div>
                  ))}
                  {q.options.length < 4 && (
                    <Button variant="secondary" onClick={()=>addOption(qi)}>Add Option</Button>
                  )}
                </div>
              ))}
              <Button variant="secondary" onClick={addQuestion}>Add Question</Button>
            </div>
            <div className="flex gap-2">
              {editingId ? (
                <>
                  <Button className="bg-earth-orange hover:bg-earth-orange-hover" onClick={saveEdit}>Save Changes</Button>
                  <Button variant="secondary" onClick={resetForm}>Cancel</Button>
                </>
              ) : (
                <Button className="bg-earth-orange hover:bg-earth-orange-hover" onClick={create}>Create Global Quiz</Button>
              )}
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">All Global Quizzes</h3>
          <div className="space-y-2">
            {list.length === 0 && <p className="text-sm text-earth-muted">No global quizzes yet.</p>}
            {list.map(q => (
              <div key={q.id} className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">
                <div className="font-medium flex items-center justify-between">
                  <span>{q.title} <span className="text-xs text-earth-muted">• {q.points} pts • {q.questions?.length||0} Qs</span></span>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={()=>startEdit(q)}>Edit</Button>
                    <Button className="bg-red-600 hover:bg-red-700" onClick={()=>del(q.id)}>Delete</Button>
                  </div>
                </div>
                {q.description && <div className="text-sm text-earth-muted">{q.description}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function GlobalAnnouncements() {
  const { username } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const load = async () => {
    const data = await fetch('/api/admin/announcements', { headers: { 'X-Username': username || '' } }).then(r => r.json());
    setList(Array.isArray(data) ? data : []);
  };
  useEffect(() => { load(); }, []);
  const create = async () => {
    if (!title.trim()) return;
    const res = await fetch('/api/admin/announcements', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify({ title, body }) });
    if (!res.ok) {
      const e = await res.json().catch(()=>({} as any));
      return alert(e?.error || 'Failed to post announcement');
    }
    setTitle(''); setBody('');
    await load();
  };
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Global Announcements</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Post Global Announcement</h3>
          <div className="space-y-2">
            <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
            <textarea className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder="Write something…" value={body} onChange={e=>setBody(e.target.value)} />
            <Button className="bg-earth-orange hover:bg-earth-orange-hover" onClick={create}>Post</Button>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">All Global Announcements</h3>
          <div className="space-y-2">
            {list.length === 0 && <p className="text-sm text-earth-muted">No announcements yet.</p>}
            {list.map(a => (
              <div key={a.id} className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">
                <div className="font-medium">{a.title}</div>
                {a.body && <div className="text-sm text-earth-muted whitespace-pre-wrap">{a.body}</div>}
                <div className="text-xs text-earth-muted mt-1">{new Date(a.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function GlobalAssignments() {
  const { username } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [maxPoints, setMaxPoints] = useState(10);
  const load = async () => {
    const data = await fetch('/api/admin/assignments', { headers: { 'X-Username': username || '' } }).then(r => r.json());
    setList(Array.isArray(data) ? data : []);
  };
  useEffect(() => { load(); }, []);
  const create = async () => {
    if (!title.trim()) return;
    const res = await fetch('/api/admin/assignments', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify({ title, description, deadline, maxPoints }) });
    if (!res.ok) {
      const e = await res.json().catch(()=>({} as any));
      return alert(e?.error || 'Failed to create assignment');
    }
    setTitle(''); setDescription(''); setDeadline(''); setMaxPoints(10);
    await load();
  };
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Global Assignments</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Create Global Assignment</h3>
          <div className="space-y-2">
            <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
            <textarea className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder="Description (optional)" value={description} onChange={e=>setDescription(e.target.value)} />
            <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" type="date" value={deadline} onChange={e=>setDeadline(e.target.value)} />
            <div className="flex items-center gap-2">
              <span className="text-earth-muted text-sm">Max Points (1–10)</span>
              <input className="w-24 rounded-lg px-3 py-2 text-[var(--foreground)]" type="number" min={1} max={10} value={maxPoints} onChange={e=>setMaxPoints(Number(e.target.value))} />
            </div>
            <Button className="bg-earth-orange hover:bg-earth-orange-hover" onClick={create}>Create Global Assignment</Button>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">All Global Assignments</h3>
          <div className="space-y-2">
            {list.length === 0 && <p className="text-sm text-earth-muted">No assignments yet.</p>}
            {list.map(a => (
              <div key={a.id} className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">
                <div className="font-medium">{a.title} <span className="text-xs text-earth-muted">• Max {a.maxPoints} pts</span></div>
                {a.description && <div className="text-sm text-earth-muted">{a.description}</div>}
                {a.deadline && <div className="text-xs text-earth-muted">Deadline: {a.deadline}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
