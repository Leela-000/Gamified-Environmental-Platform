import { useAuth } from "@/lib/auth";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

const tabs = [
  "Overview",
  "Tasks",
  "Quizzes",
  "Assignments",
  "Students",
  "Announcements",
  "Profile",
];

export default function TeacherAppShell() {
  const { role, username, clear } = useAuth();
  const initialTab = useMemo(() => {
    try {
      const search = typeof window !== 'undefined' ? window.location.search : '';
      const q = new URLSearchParams(search);
      const t = (q.get('tab') || '').toLowerCase();
      if (!t) return 0;
      const idx = tabs.findIndex(x => x.toLowerCase() === t);
      return idx >= 0 ? idx : 0;
    } catch {
      return 0;
    }
  }, []);
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    if (role !== "teacher") {
      // Access guard (kept simple)
    }
  }, [role]);

  const Guard = useMemo(() => {
    if (role !== "teacher") {
      return (
        <div className="min-h-screen bg-space-gradient text-white p-6 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold mb-4">Teacher Portal</h1>
          <p className="text-earth-muted">Access denied. Please log in as a teacher.</p>
        </div>
      );
    }
    return null;
  }, [role]);

  if (Guard) return Guard;

  return (
    <div className="min-h-screen bg-space-gradient text-white p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Teacher Portal</h1>
          <p className="text-earth-muted text-sm">Welcome, @{username}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={clear}>Logout</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t, i) => (
          <Button key={t} variant={tab === i ? "default" : "secondary"} onClick={() => setTab(i)}>
            {t}
          </Button>
        ))}
      </div>

      {tab === 0 && <Overview />}
      {tab === 1 && <Tasks />}
      {tab === 2 && <Quizzes />}
      {tab === 3 && <Assignments />}
      {tab === 4 && <Students />}
      {tab === 5 && <Announcements />}
      {tab === 6 && <Profile />}
    </div>
  );
}

function Section({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <div className="p-4 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">
        {children}
      </div>
    </section>
  );
}

function Overview() {
  const { username } = useAuth();
  const [data, setData] = useState<any | null>(null);
  useEffect(() => {
    let mounted = true;
    fetch('/api/teacher/overview', { headers: { 'X-Username': username || '' } })
      .then(r => r.json())
      .then(d => { if (mounted) setData(d); });
    return () => { mounted = false; };
  }, [username]);
  return (
    <Section title="Overview">
      {!data ? (
        <p className="text-earth-muted text-sm">Loading…</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">Tasks: <b>{data.tasks}</b></div>
          <div className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">Assignments: <b>{data.assignments}</b></div>
          <div className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">Quizzes: <b>{data.quizzes}</b></div>
          <div className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">Announcements: <b>{data.announcements}</b></div>
          <div className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">Students: <b>{data.students}</b></div>
          <div className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">Pending Submissions: <b>{data.pendingSubmissions}</b></div>
        </div>
      )}
    </Section>
  );
}

function Tasks() {
  const { username } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Array<any>>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [maxPoints, setMaxPoints] = useState(10);
  const [submissions, setSubmissions] = useState<Array<any>>([]);
  const [groupMode, setGroupMode] = useState<'solo' | 'group'>('solo');
  const [maxGroupSize, setMaxGroupSize] = useState(4);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeTaskTitle, setActiveTaskTitle] = useState<string>("");
  const [subsLoading, setSubsLoading] = useState(false);

  const load = async () => {
    const list = await fetch('/api/teacher/tasks', { headers: { 'X-Username': username || '' } }).then(r => r.json());
    setTasks(Array.isArray(list) ? list : []);
  };
  const loadSubs = async (taskId?: string) => {
    setSubsLoading(true);
    try {
      const url = taskId ? `/api/teacher/submissions?taskId=${encodeURIComponent(taskId)}` : '/api/teacher/submissions';
      const list = await fetch(url, { headers: { 'X-Username': username || '' } }).then(r => r.json());
      setSubmissions(Array.isArray(list) ? list : []);
    } finally {
      setSubsLoading(false);
    }
  };
  useEffect(() => { load(); loadSubs(); }, []);

  const create = async () => {
    if (!title.trim()) return;
    setLoading(true);
    const res = await fetch('/api/teacher/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify({ title, description, deadline, proofType: 'photo', maxPoints, groupMode, maxGroupSize: groupMode === 'group' ? maxGroupSize : undefined }) });
    setLoading(false);
    if (!res.ok) {
      const e = await res.json().catch(() => ({} as any));
      return alert(e?.error || 'Failed to create task');
    }
    setTitle(""); setDescription(""); setDeadline(""); setMaxPoints(10);
    await load();
  };

  const review = async (id: string, status: 'approved' | 'rejected', points?: number) => {
    const body: any = { status };
    if (typeof points !== 'undefined') body.points = points;
    const res = await fetch(`/api/teacher/submissions/${encodeURIComponent(id)}/review`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify(body) });
    if (!res.ok) {
      const e = await res.json().catch(() => ({} as any));
      return alert(e?.error || 'Failed to review');
    }
    await loadSubs(activeTaskId || undefined);
  };

  const seed = async () => {
    setLoading(true);
    try {
      await fetch('/api/dev/seed-teacher-tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, count: 12 }) });
      await load();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section title="Tasks">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Create Task</h3>
          <div className="space-y-2">
            <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
            <textarea className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} />
            <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
            <div className="flex items-center gap-2">
              <span className="text-sm text-earth-muted">Max Points (1–10)</span>
              <input className="w-24 rounded-lg px-3 py-2 text-[var(--foreground)]" type="number" min={1} value={maxPoints} onChange={e => setMaxPoints(Number(e.target.value))} />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-earth-muted flex items-center gap-2">
                <input type="checkbox" checked={groupMode === 'group'} onChange={e => setGroupMode(e.target.checked ? 'group' : 'solo')} /> Group task
              </label>
              {groupMode === 'group' && (
                <>
                  <span className="text-sm text-earth-muted">Max group size</span>
                  <input className="w-20 rounded-lg px-3 py-2 text-[var(--foreground)]" type="number" min={2} max={10} value={maxGroupSize} onChange={e => setMaxGroupSize(Number(e.target.value))} />
                </>
              )}
            </div>
            <Button className="bg-earth-orange hover:bg-earth-orange-hover" onClick={create} disabled={loading || !title.trim()}>
              {loading ? 'Creating…' : 'Create Task'}
            </Button>
          </div>
          <h3 className="font-semibold mt-6 mb-2">Your Tasks</h3>
          <div className="space-y-2">
            {tasks.length === 0 && (
              <div className="space-y-2">
                <p className="text-sm text-earth-muted">No tasks yet.</p>
                <Button variant="secondary" onClick={seed} disabled={loading}>Seed 12 demo tasks</Button>
              </div>
            )}
            {tasks.map(t => (
              <div key={t.id} className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">
                <div className="font-medium">{t.title} <span className="text-xs text-earth-muted">• Max {t.maxPoints} pts</span></div>
                {t.description && <div className="text-sm text-earth-muted">{t.description}</div>}
                {t.deadline && <div className="text-xs text-earth-muted mt-1">Deadline: {t.deadline}</div>}
                <div className="mt-2">
                  <Button variant="secondary" onClick={() => { setActiveTaskId(t.id); setActiveTaskTitle(t.title); loadSubs(t.id); }}>View Submissions</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Submissions {activeTaskId ? <span className="text-earth-muted text-sm">for “{activeTaskTitle}”</span> : null}</h3>
          {activeTaskId && (
            <div className="mb-2">
              <Button variant="secondary" onClick={() => { setActiveTaskId(null); setActiveTaskTitle(""); loadSubs(); }}>Show all submissions</Button>
            </div>
          )}
          <div className="space-y-2">
            {subsLoading && <p className="text-sm text-earth-muted">Loading…</p>}
            {!subsLoading && submissions.length === 0 && <p className="text-sm text-earth-muted">{activeTaskId ? 'No submissions for this task yet.' : 'No submissions yet.'}</p>}
            {submissions.map((s, idx) => (
              <SubmissionCard key={s.id} s={s} onReview={review} />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function SubmissionCard({ s, onReview }: { s: any; onReview: (id: string, status: 'approved' | 'rejected', points?: number) => Promise<void> }) {
  const [points, setPoints] = useState<number>(() => {
    const current = Number(s.points);
    return Number.isFinite(current) ? current : 0;
  });
  const maxPts = Number(s.taskMaxPoints || 10);
  const approved = s.status === 'approved';
  const rejected = s.status === 'rejected';
  const submitted = s.status === 'submitted';
  return (
    <div className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm">
          <div><span className="text-earth-muted">Student:</span> @{s.studentUsername} {s.studentName ? (<span className="text-earth-muted">• {s.studentName}</span>) : null}</div>
          {(s.className || s.section) && (
            <div className="text-xs text-earth-muted">Class: {s.className || '-'} • Section: {s.section || '-'}</div>
          )}
          <div className="text-xs text-earth-muted">Max {maxPts} pts</div>
          <div className="text-sm mt-1"><span className="text-earth-muted">Status:</span> {s.status}{typeof s.points !== 'undefined' ? ` • ${s.points} pts` : ''}</div>
          {Array.isArray(s.groupMembers) && s.groupMembers.length > 0 && (
            <div className="text-xs text-earth-muted">Group: {s.groupMembers.map((m:string)=>`@${m}`).join(', ')}</div>
          )}
        </div>
        <div className="text-xs text-earth-muted">{new Date(s.submittedAt).toLocaleString()}</div>
      </div>
      <div className="pt-2 flex gap-2 flex-wrap">
        {Array.isArray(s.photos) && s.photos.length > 0 ? (
          s.photos.map((p: string, i: number) => (
            <img key={i} src={p} alt={`Submission ${i+1}`} className="h-24 w-24 object-cover rounded border border-[var(--earth-border)]" />
          ))
        ) : s.photoDataUrl ? (
          <img src={s.photoDataUrl} alt="Submission" className="h-24 w-24 object-cover rounded border border-[var(--earth-border)]" />
        ) : null}
      </div>
      <div className="mt-2 flex items-center gap-3">
        <label className="text-sm text-earth-muted flex items-center gap-2">
          Points
          <input
            className="w-24 rounded-lg px-3 py-2 text-[var(--foreground)]"
            type="number"
            min={0}
            max={maxPts}
            value={points}
            onChange={e => setPoints(Number(e.target.value))}
            disabled={approved}
          />
          <span className="text-xs">/ {maxPts}</span>
        </label>
      </div>
      <div className="mt-2 flex gap-2">
        {submitted && (
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => onReview(s.id, 'approved', points)}>Approve</Button>
        )}
        {submitted && (
          <Button className="bg-red-600 hover:bg-red-700" onClick={() => onReview(s.id, 'rejected')}>Reject</Button>
        )}
        {approved && (
          <span className="text-emerald-400 text-sm">Approved • {s.points} pts</span>
        )}
        {rejected && (
          <span className="text-red-400 text-sm">Rejected</span>
        )}
      </div>
    </div>
  );
}

function Quizzes() {
  const { username } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState(3);
  const [questions, setQuestions] = useState<Array<{ id?: string; text: string; options: string[]; answerIndex: number }>>([
    { text: '', options: ['', ''], answerIndex: 0 },
  ]);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const load = async () => {
    const data = await fetch('/api/teacher/quizzes', { headers: { 'X-Username': username || '' } }).then(r => r.json());
    setList(Array.isArray(data) ? data : []);
  };
  useEffect(() => { load(); }, []);

  const addQuestion = () => setQuestions(qs => [...qs, { text: '', options: ['', ''], answerIndex: 0 }]);
  const addOption = (qi: number) => setQuestions(qs => qs.map((q,i)=> i===qi ? { ...q, options: q.options.length < 4 ? [...q.options, ''] : q.options } : q));
  const updateQ = (qi: number, patch: Partial<{ id?: string; text: string; options: string[]; answerIndex: number }>) => setQuestions(qs => qs.map((q,i)=> i===qi ? { ...q, ...patch } : q));
  const updateOpt = (qi: number, oi: number, val: string) => setQuestions(qs => qs.map((q,i)=> i===qi ? { ...q, options: q.options.map((o,j)=> j===oi ? val : o) } : q));

  const resetEditor = () => { setTitle(''); setDescription(''); setPoints(3); setQuestions([{ text: '', options: ['', ''], answerIndex: 0 }]); setEditingQuizId(null); };
  const create = async () => {
    if (!title.trim()) return;
    const body = { title, description, points, questions: questions.map(q => ({ text: q.text, options: q.options, answerIndex: q.answerIndex })) };
    const res = await fetch('/api/teacher/quizzes', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify(body) });
    if (!res.ok) {
      const e = await res.json().catch(()=>({} as any));
      return alert(e?.error || 'Failed to create quiz');
    }
    resetEditor();
    await load();
  };
  const startEdit = (q: any) => {
    setEditingQuizId(q.id);
    setTitle(q.title || '');
    setDescription(q.description || '');
    setPoints(Number(q.points || 3));
    setQuestions(Array.isArray(q.questions) ? q.questions.map((qq: any) => ({ id: qq.id, text: qq.text, options: qq.options || [], answerIndex: Number(qq.answerIndex || 0) })) : [{ text: '', options: ['', ''], answerIndex: 0 }]);
  };
  const saveEdit = async () => {
    if (!editingQuizId) return;
    if (!title.trim()) return;
    const body = { title, description, points, questions: questions.map(q => ({ id: q.id, text: q.text, options: q.options, answerIndex: q.answerIndex })) };
    const res = await fetch(`/api/teacher/quizzes/${encodeURIComponent(editingQuizId)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify(body) });
    if (!res.ok) {
      const e = await res.json().catch(()=>({} as any));
      return alert(e?.error || 'Failed to update quiz');
    }
    resetEditor();
    await load();
  };
  const removeQuiz = async (id: string) => {
    if (!confirm('Delete this quiz? This cannot be undone.')) return;
    const res = await fetch(`/api/teacher/quizzes/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { 'X-Username': username || '' } });
    if (!res.ok) {
      const e = await res.json().catch(()=>({} as any));
      return alert(e?.error || 'Failed to delete quiz');
    }
    if (editingQuizId === id) resetEditor();
    await load();
  };

  return (
    <Section title="Quizzes">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">{editingQuizId ? 'Edit Quiz' : 'Create Quiz'}</h3>
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
                        <input type="radio" name={`ans-${qi}`} checked={q.answerIndex === oi} onChange={()=>updateQ(qi, { answerIndex: oi })} /> Correct
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
            {!editingQuizId ? (
              <Button className="bg-earth-orange hover:bg-earth-orange-hover" onClick={create}>Create Quiz</Button>
            ) : (
              <div className="flex gap-2">
                <Button className="bg-earth-orange hover:bg-earth-orange-hover" onClick={saveEdit}>Save Changes</Button>
                <Button variant="secondary" onClick={resetEditor}>Cancel</Button>
              </div>
            )}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Your Quizzes</h3>
          <div className="space-y-2">
            {list.length === 0 && <p className="text-sm text-earth-muted">No quizzes yet.</p>}
            {list.map(q => (
              <div key={q.id} className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium">{q.title} <span className="text-xs text-earth-muted">• {q.points} pts • {q.questions?.length||0} Qs</span></div>
                    {q.description && <div className="text-sm text-earth-muted">{q.description}</div>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setExpanded(e => ({ ...e, [q.id]: !e[q.id] }))}>{expanded[q.id] ? 'Hide' : 'View'} Questions</Button>
                    <Button variant="secondary" onClick={() => startEdit(q)}>Edit</Button>
                    <Button className="bg-red-600 hover:bg-red-700" onClick={() => removeQuiz(q.id)}>Delete</Button>
                  </div>
                </div>
                {expanded[q.id] && Array.isArray(q.questions) && (
                  <div className="mt-3 space-y-2">
                    {q.questions.map((qq:any, idx:number) => (
                      <div key={qq.id || idx} className="p-2 rounded-lg bg-[var(--background)]/30 border border-[var(--earth-border)]">
                        <div className="text-sm font-medium">Q{idx+1}. {qq.text}</div>
                        <ul className="mt-1 text-xs list-disc list-inside text-earth-muted">
                          {qq.options?.map((opt:string, oi:number) => (
                            <li key={oi} className={oi === Number(qq.answerIndex) ? 'text-emerald-400' : ''}>
                              {opt} {oi === Number(qq.answerIndex) ? '✓' : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function Assignments() {
  const { username } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [maxPoints, setMaxPoints] = useState(10);
  const [subs, setSubs] = useState<any[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);
  const [activeAssignmentTitle, setActiveAssignmentTitle] = useState<string>('');
  const load = async () => {
    const data = await fetch('/api/teacher/assignments', { headers: { 'X-Username': username || '' } }).then(r => r.json());
    setList(Array.isArray(data) ? data : []);
  };
  const loadSubs = async (assignmentId?: string) => {
    setSubsLoading(true);
    try {
      const url = assignmentId ? `/api/teacher/assignment-submissions?assignmentId=${encodeURIComponent(assignmentId)}` : '/api/teacher/assignment-submissions';
      const data = await fetch(url, { headers: { 'X-Username': username || '' } }).then(r => r.json());
      setSubs(Array.isArray(data) ? data : []);
    } finally {
      setSubsLoading(false);
    }
  };
  useEffect(() => { load(); loadSubs(); }, []);

  const create = async () => {
    if (!title.trim()) return;
    const res = await fetch('/api/teacher/assignments', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify({ title, description, deadline, maxPoints }) });
    if (!res.ok) {
      const e = await res.json().catch(()=>({} as any));
      return alert(e?.error || 'Failed to create assignment');
    }
    setTitle(''); setDescription(''); setDeadline(''); setMaxPoints(10);
    await load();
  };

  const review = async (id: string, status: 'approved' | 'rejected', points?: number) => {
    const body: any = { status };
    if (typeof points !== 'undefined') body.points = points;
    const res = await fetch(`/api/teacher/assignment-submissions/${encodeURIComponent(id)}/review`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify(body) });
    if (!res.ok) {
      const e = await res.json().catch(() => ({} as any));
      return alert(e?.error || 'Failed to review');
    }
    await loadSubs(activeAssignmentId || undefined);
  };

  return (
    <Section title="Assignments">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Create Assignment</h3>
          <div className="space-y-2">
            <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
            <textarea className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder="Description (optional)" value={description} onChange={e=>setDescription(e.target.value)} />
            <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" type="date" value={deadline} onChange={e=>setDeadline(e.target.value)} />
            <div className="flex items-center gap-2">
              <span className="text-earth-muted text-sm">Max Points (1–10)</span>
              <input className="w-24 rounded-lg px-3 py-2 text-[var(--foreground)]" type="number" min={1} max={10} value={maxPoints} onChange={e=>setMaxPoints(Number(e.target.value))} />
            </div>
            <Button className="bg-earth-orange hover:bg-earth-orange-hover" onClick={create}>Create Assignment</Button>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Your Assignments</h3>
          <div className="space-y-2">
            {list.length === 0 && <p className="text-sm text-earth-muted">No assignments yet.</p>}
            {list.map(a => (
              <div key={a.id} className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium">{a.title} <span className="text-xs text-earth-muted">• Max {a.maxPoints} pts</span></div>
                    {a.description && <div className="text-sm text-earth-muted">{a.description}</div>}
                    {a.deadline && <div className="text-xs text-earth-muted">Deadline: {a.deadline}</div>}
                  </div>
                  <div>
                    <Button variant="secondary" onClick={() => { setActiveAssignmentId(a.id); setActiveAssignmentTitle(a.title); loadSubs(a.id); }}>View Submissions</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Assignment Submissions {activeAssignmentId ? <span className="text-earth-muted text-sm">for “{activeAssignmentTitle}”</span> : null}</h3>
            {activeAssignmentId && (
              <div className="mb-2">
                <Button variant="secondary" onClick={() => { setActiveAssignmentId(null); setActiveAssignmentTitle(''); loadSubs(); }}>Show all submissions</Button>
              </div>
            )}
            {subsLoading && <p className="text-sm text-earth-muted">Loading…</p>}
            {!subsLoading && subs.length === 0 && <p className="text-sm text-earth-muted">{activeAssignmentId ? 'No submissions for this assignment yet.' : 'No submissions yet.'}</p>}
            <div className="space-y-2">
              {subs.map((s: any) => (
                <AssignmentSubmissionCard key={s.id} s={s} onReview={review} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function AssignmentSubmissionCard({ s, onReview }: { s: any; onReview: (id: string, status: 'approved' | 'rejected', points?: number) => Promise<void> }) {
  const [points, setPoints] = useState<number>(() => {
    const current = Number(s.points);
    return Number.isFinite(current) ? current : 0;
  });
  const maxPts = Number(s.assignmentMaxPoints || 10);
  const approved = s.status === 'approved';
  const rejected = s.status === 'rejected';
  const submitted = s.status === 'submitted';
  return (
    <div className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm">
          <div><span className="text-earth-muted">Student:</span> @{s.studentUsername} {s.studentName ? (<span className="text-earth-muted">• {s.studentName}</span>) : null}</div>
          {(s.className || s.section) && (
            <div className="text-xs text-earth-muted">Class: {s.className || '-'} • Section: {s.section || '-'}</div>
          )}
          <div className="text-xs text-earth-muted">Max {maxPts} pts</div>
          <div className="text-sm mt-1"><span className="text-earth-muted">Status:</span> {s.status}{typeof s.points !== 'undefined' ? ` • ${s.points} pts` : ''}</div>
        </div>
        <div className="text-xs text-earth-muted">{new Date(s.submittedAt).toLocaleString()}</div>
      </div>
      <div className="pt-2 flex gap-2 flex-wrap text-xs">
        {Array.isArray(s.files) && s.files.length > 0 && s.files.map((f: string, i: number) => (
          <a key={i} href={f} target="_blank" rel="noreferrer" className="px-2 py-1 rounded border border-[var(--earth-border)] hover:underline">File {i+1}</a>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-3">
        <label className="text-sm text-earth-muted flex items-center gap-2">
          Points
          <input
            className="w-24 rounded-lg px-3 py-2 text-[var(--foreground)]"
            type="number"
            min={0}
            max={maxPts}
            value={points}
            onChange={e => setPoints(Number(e.target.value))}
            disabled={approved}
          />
          <span className="text-xs">/ {maxPts}</span>
        </label>
      </div>
      <div className="mt-2 flex gap-2">
        {submitted && (
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => onReview(s.id, 'approved', points)}>Approve</Button>
        )}
        {submitted && (
          <Button className="bg-red-600 hover:bg-red-700" onClick={() => onReview(s.id, 'rejected')}>Reject</Button>
        )}
        {approved && (
          <span className="text-emerald-400 text-sm">Approved • {s.points} pts</span>
        )}
        {rejected && (
          <span className="text-red-400 text-sm">Rejected</span>
        )}
      </div>
    </div>
  );
}

function Students() {
  const { username } = useAuth();
  const [list, setList] = useState<Array<{ username: string; name?: string; className?: string; section?: string }>>([]);
  useEffect(() => {
    let mounted = true;
    fetch('/api/teacher/students', { headers: { 'X-Username': username || '' } })
      .then(r => r.json())
      .then(d => { if (mounted) setList(Array.isArray(d)?d:[]); });
    return () => { mounted = false; };
  }, [username]);
  return (
    <Section title="Students">
      <div className="space-y-2 text-sm">
        {list.length === 0 && <p className="text-earth-muted">No students found for your school.</p>}
        {list.map(s => (
          <div key={s.username} className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">
            <div className="font-medium">{s.name || '-'} <span className="text-xs text-earth-muted">(@{s.username})</span></div>
            <div className="text-xs text-earth-muted">Class: {s.className || '-'} • Section: {s.section || '-'}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Announcements() {
  const { username } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const load = async () => {
    const data = await fetch('/api/teacher/announcements', { headers: { 'X-Username': username || '' } }).then(r => r.json());
    setList(Array.isArray(data) ? data : []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!title.trim()) return;
    const res = await fetch('/api/teacher/announcements', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify({ title, body }) });
    if (!res.ok) {
      const e = await res.json().catch(()=>({} as any));
      return alert(e?.error || 'Failed to post announcement');
    }
    setTitle(''); setBody('');
    await load();
  };

  return (
    <Section title="Announcements">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Post Announcement</h3>
          <div className="space-y-2">
            <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
            <textarea className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" placeholder="Write something…" value={body} onChange={e=>setBody(e.target.value)} />
            <Button className="bg-earth-orange hover:bg-earth-orange-hover" onClick={create}>Post</Button>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Your Announcements</h3>
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
    </Section>
  );
}

function Profile() {
  const { username } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([]);
  const [data, setData] = useState<any>({});

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const [p, s] = await Promise.all([
          fetch('/api/me/profile', { headers: { 'X-Username': username || '' } }).then(r => r.json()),
          fetch('/api/schools').then(r => r.json()),
        ]);
        if (!mounted) return;
        setData(p || {});
        setSchools(Array.isArray(s) ? s : []);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [username]);

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setData((d:any) => ({ ...d, photoDataUrl: String(reader.result || '') }));
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/me/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify({
        name: data.name || '',
        email: data.email || '',
        schoolId: data.schoolId || '',
        photoDataUrl: data.photoDataUrl || '',
        teacherId: data.teacherId || '',
        subject: data.subject || '',
      }) });
      if (!res.ok) {
        const e = await res.json().catch(() => ({} as any));
        alert(e?.error || 'Failed to save profile');
        return;
      }
      const p = await res.json();
      setData(p);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section title="Profile">
      {loading ? (
        <div className="text-earth-muted">Loading…</div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div>
              {data.photoDataUrl ? (
                <img src={data.photoDataUrl} alt="Profile" className="h-20 w-20 object-cover rounded-full" />
              ) : (
                <div className="h-20 w-20 rounded-full bg-[var(--earth-border)] flex items-center justify-center text-earth-muted">No Photo</div>
              )}
            </div>
            <div>
              <input type="file" accept="image/*" onChange={onPhoto} className="text-[var(--foreground)] bg-white rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-sm text-earth-muted mb-1">Username</span>
              <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" value={`@${data.username || username}`}
                readOnly />
            </label>
            <label className="block">
              <span className="block text-sm text-earth-muted mb-1">Role</span>
              <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" value={data.role || 'teacher'} readOnly />
            </label>
            <label className="block">
              <span className="block text-sm text-earth-muted mb-1">Full Name</span>
              <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" value={data.name || ''} onChange={e => setData({ ...data, name: e.target.value })} />
            </label>
            <label className="block">
              <span className="block text-sm text-earth-muted mb-1">Email</span>
              <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" value={data.email || ''} onChange={e => setData({ ...data, email: e.target.value })} />
            </label>
            <label className="block">
              <span className="block text-sm text-earth-muted mb-1">School</span>
              <select className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" value={data.schoolId || ''} onChange={e => setData({ ...data, schoolId: e.target.value })}>
                <option value="">Select school…</option>
                {schools.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-sm text-earth-muted mb-1">Teacher ID</span>
              <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" value={data.teacherId || ''} onChange={e => setData({ ...data, teacherId: e.target.value })} />
            </label>
            <label className="block">
              <span className="block text-sm text-earth-muted mb-1">Subject</span>
              <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" value={data.subject || ''} onChange={e => setData({ ...data, subject: e.target.value })} />
            </label>
          </div>
          <div className="flex gap-2">
            <Button className="bg-earth-orange hover:bg-earth-orange-hover" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>
          </div>
          <p className="text-xs text-earth-muted">All fields are shown even if empty. You can fill them here and save.</p>
        </div>
      )}
    </Section>
  );
}
