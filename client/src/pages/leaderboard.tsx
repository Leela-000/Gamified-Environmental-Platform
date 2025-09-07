import { useEffect, useMemo, useState } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Crown, School, Search, Trophy, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";

type SchoolRow = { schoolId: string; schoolName: string; ecoPoints: number; students: number };
type StudentRow = { username: string; name?: string; ecoPoints: number };
type GlobalStudentRow = {
  username: string;
  name?: string;
  schoolId?: string;
  schoolName?: string;
  ecoPoints: number;
  achievements?: string[];
  snapshot?: { tasksApproved: number; quizzesCompleted: number };
};
type TeacherRow = { username: string; name?: string; schoolId?: string; schoolName?: string; ecoPoints: number; tasksCreated: number; quizzesCreated: number };

export default function LeaderboardPage() {
  const [schools, setSchools] = useState<SchoolRow[] | null>(null);
  const [schoolsError, setSchoolsError] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<SchoolRow | null>(null);
  const [students, setStudents] = useState<StudentRow[] | null>(null);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const { username: me } = useAuth();

  // Header filters and tabs
  type Scope = 'global' | 'school' | 'class';
  const [scope, setScope] = useState<Scope>('global');
  type Tab = 'schools' | 'students' | 'teachers';
  const [tab, setTab] = useState<Tab>('schools');
  const [search, setSearch] = useState('');
  const [globalStudents, setGlobalStudents] = useState<GlobalStudentRow[] | null>(null);
  const [teachers, setTeachers] = useState<TeacherRow[] | null>(null);
  const [loadingTab, setLoadingTab] = useState(false);
  const [schoolsList, setSchoolsList] = useState<Array<{ id: string; name: string }>>([]);
  const [schoolFilter, setSchoolFilter] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setSchoolsError(null);
      try {
        const res = await fetch(`/api/leaderboard/schools?limit=50`);
        if (!res.ok) throw new Error(`${res.status}`);
        const list = (await res.json()) as SchoolRow[];
        if (mounted) setSchools(Array.isArray(list) ? list : []);
      } catch (e: any) {
        if (mounted) setSchoolsError(e?.message || "Failed to load");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Load tab content for Students/Teachers (global scope)
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (tab === 'students') {
        setLoadingTab(true);
        try {
          const url = `/api/leaderboard/students?limit=100${schoolFilter ? `&schoolId=${encodeURIComponent(schoolFilter)}` : ''}`;
          const res = await fetch(url);
          const list = (await res.json()) as GlobalStudentRow[];
          if (mounted) setGlobalStudents(Array.isArray(list) ? list : []);
        } catch {
          if (mounted) setGlobalStudents([]);
        } finally {
          if (mounted) setLoadingTab(false);
        }
      } else if (tab === 'teachers') {
        setLoadingTab(true);
        try {
          const url = `/api/leaderboard/teachers?limit=100${schoolFilter ? `&schoolId=${encodeURIComponent(schoolFilter)}` : ''}`;
          const res = await fetch(url);
          const list = (await res.json()) as TeacherRow[];
          if (mounted) setTeachers(Array.isArray(list) ? list : []);
        } catch {
          if (mounted) setTeachers([]);
        } finally {
          if (mounted) setLoadingTab(false);
        }
      }
    };
    run();
    return () => { mounted = false; };
  }, [tab, schoolFilter]);

  // Derive schools for filter dropdown from loaded leaderboard schools
  useEffect(() => {
    if (Array.isArray(schools)) {
      setSchoolsList(schools.map(s => ({ id: s.schoolId, name: s.schoolName })));
    }
  }, [schools]);

  const loadStudents = async (school: SchoolRow) => {
    setSelectedSchool(school);
    setStudents(null);
    setStudentsError(null);
    setLoadingStudents(true);
    try {
      const res = await fetch(`/api/leaderboard/school/${encodeURIComponent(school.schoolId)}/students?limit=50`);
      if (!res.ok) throw new Error(`${res.status}`);
      const list = (await res.json()) as StudentRow[];
      setStudents(Array.isArray(list) ? list : []);
    } catch (e: any) {
      setStudentsError(e?.message || "Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  };

  const backToGlobal = () => {
    setSelectedSchool(null);
    setStudents(null);
    setStudentsError(null);
  };

  return (
    <div className="min-h-screen bg-space-gradient text-white p-6">
      <div className="flex items-center gap-3 mb-4">
        {selectedSchool && (
          <Button variant="secondary" size="sm" onClick={backToGlobal}>
            <ArrowLeft size={14} className="mr-1" /> Back
          </Button>
        )}
        <h1 className="text-3xl font-bold">Leaderboard</h1>
      </div>

      {/* Header filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="inline-flex rounded-full border border-[var(--earth-border)] bg-[var(--earth-card)] p-1">
          {(['global','school','class'] as const).map((s) => (
            <button key={s} onClick={()=>setScope(s)} className={`px-3 py-1 rounded-full text-sm ${scope===s?'bg-white/10':'hover:bg-white/5'}`}>{s==='global'?'🌍 Global':s==='school'?'🏫 School':'👥 Class'}</button>
          ))}
        </div>
        <div className="inline-flex rounded-full border border-[var(--earth-border)] bg-[var(--earth-card)] p-1 ml-2">
          {(['schools','students','teachers'] as const).map((t)=> (
            <button key={t} onClick={()=>setTab(t)} className={`px-3 py-1 rounded-full text-sm ${tab===t?'bg-white/10':'hover:bg-white/5'}`}>{t[0].toUpperCase()+t.slice(1)}</button>
          ))}
        </div>
        {(tab==='students' || tab==='teachers') && (
          <div className="ml-2">
            <select value={schoolFilter} onChange={(e)=>setSchoolFilter(e.target.value)} className="rounded-md border border-[var(--earth-border)] bg-[var(--earth-card)] px-2 py-1 text-sm">
              <option value="">All Schools</option>
              {schoolsList.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
            </select>
          </div>
        )}
        <div className="ml-auto flex items-center gap-2 rounded-lg border border-[var(--earth-border)] bg-[var(--earth-card)] px-2">
          <Search size={14} className="text-earth-muted" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search school or student…" className="bg-transparent outline-none text-sm py-1" />
        </div>
      </div>

      {!selectedSchool ? (
        <div>
          {tab === 'schools' && (
            <>
          <p className="mt-1 text-earth-muted">Global top schools ranked by eco-points.</p>
          <div className="mt-4 rounded-lg border border-[var(--earth-border)] bg-[var(--earth-card)] overflow-hidden">
            <div className="grid grid-cols-12 px-4 py-2 text-xs text-earth-muted border-b border-[var(--earth-border)]">
              <div className="col-span-2">Rank</div>
              <div className="col-span-4">School</div>
              <div className="col-span-3">Top Student</div>
              <div className="col-span-1 text-right">👥</div>
              <div className="col-span-2 text-right">Eco-Points</div>
            </div>
            <div className="divide-y divide-[var(--earth-border)]">
              {loading && <div className="px-4 py-6 text-earth-muted text-sm">Loading…</div>}
              {schoolsError && <div className="px-4 py-6 text-red-300 text-sm">{schoolsError}</div>}
              {(!loading && !schoolsError && (schools?.length ?? 0) === 0) && (
                <div className="px-4 py-6 text-earth-muted text-sm">No schools yet.</div>
              )}
              {(schools || []).filter(s=>!search||s.schoolName.toLowerCase().includes(search.toLowerCase())).map((s, idx) => (
                <HoverCard key={s.schoolId}>
                  <HoverCardTrigger asChild>
                    <button
                      className="w-full grid grid-cols-12 px-4 py-3 hover:bg-white/5 text-left"
                      onClick={() => loadStudents(s)}
                    >
                      <div className="col-span-2 flex items-center gap-2 text-sm">
                        {idx===0?<Crown size={14} className="text-yellow-300"/>:<Trophy size={14} className={idx < 3 ? 'text-yellow-300' : 'text-earth-muted'} />}
                        #{idx + 1}
                      </div>
                      <div className="col-span-4 flex items-center gap-2">
                        <School size={16} className="text-emerald-300" />
                        <span className="truncate">{s.schoolName}</span>
                      </div>
                      <div className="col-span-3 text-sm text-earth-muted">{/* Top student will be fetched in hover preview */}—</div>
                      <div className="col-span-1 text-right text-earth-muted flex items-center justify-end gap-1">
                        <Users size={14} /> {s.students}
                      </div>
                      <div className="col-span-2 text-right font-medium">{formatPoints(s.ecoPoints)}</div>
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <SchoolHoverPreview schoolId={s.schoolId} fallback={{ schoolName: s.schoolName, ecoPoints: s.ecoPoints, students: s.students }} />
                  </HoverCardContent>
                </HoverCard>
              ))}
            </div>
          </div>
            </>
          )}

          {tab === 'students' && (
            <div className="mt-4 rounded-lg border border-[var(--earth-border)] bg-[var(--earth-card)] overflow-hidden">
              <div className="grid grid-cols-12 px-4 py-2 text-xs text-earth-muted border-b border-[var(--earth-border)]">
                <div className="col-span-2">Rank</div>
                <div className="col-span-4">Student</div>
                <div className="col-span-4">School</div>
                <div className="col-span-2 text-right">Eco-Points</div>
              </div>
              <div className="divide-y divide-[var(--earth-border)]">
                {loadingTab && <div className="px-4 py-6 text-earth-muted text-sm">Loading…</div>}
                {(!loadingTab && (globalStudents?.length ?? 0) === 0) && <div className="px-4 py-6 text-earth-muted text-sm">No students found.</div>}
                {(globalStudents || []).filter(r => !search || r.username.toLowerCase().includes(search.toLowerCase()) || (r.name||'').toLowerCase().includes(search.toLowerCase()) || (r.schoolName||'').toLowerCase().includes(search.toLowerCase())).map((r, idx) => (
                  <GlobalStudentRowItem key={r.username} row={r} rank={idx + 1} isMe={me === r.username} />
                ))}
              </div>
            </div>
          )}

          {tab === 'teachers' && (
            <div className="mt-4 rounded-lg border border-[var(--earth-border)] bg-[var(--earth-card)] overflow-hidden">
              <div className="grid grid-cols-12 px-4 py-2 text-xs text-earth-muted border-b border-[var(--earth-border)]">
                <div className="col-span-2">Rank</div>
                <div className="col-span-4">Teacher</div>
                <div className="col-span-2">School</div>
                <div className="col-span-2 text-right">Eco-Points</div>
                <div className="col-span-1 text-right">Tasks</div>
                <div className="col-span-1 text-right">Quizzes</div>
              </div>
              <div className="divide-y divide-[var(--earth-border)]">
                {loadingTab && <div className="px-4 py-6 text-earth-muted text-sm">Loading…</div>}
                {(!loadingTab && (teachers?.length ?? 0) === 0) && <div className="px-4 py-6 text-earth-muted text-sm">No teachers found.</div>}
                {(teachers || []).filter(r => !search || r.username.toLowerCase().includes(search.toLowerCase()) || (r.name||'').toLowerCase().includes(search.toLowerCase()) || (r.schoolName||'').toLowerCase().includes(search.toLowerCase())).map((t, idx) => (
                  <HoverCard key={t.username}>
                    <HoverCardTrigger asChild>
                      <div className="grid grid-cols-12 px-4 py-3 hover:bg-white/5">
                        <div className="col-span-2 text-sm">#{idx + 1}</div>
                        <div className="col-span-4 font-medium">@{t.username} {t.name && <span className="text-earth-muted ml-1">{t.name}</span>}</div>
                        <div className="col-span-2 text-earth-muted">{t.schoolName || '—'}</div>
                        <div className="col-span-2 text-right font-medium">{formatPoints(t.ecoPoints)}</div>
                        <div className="col-span-1 text-right">{t.tasksCreated}</div>
                        <div className="col-span-1 text-right">{t.quizzesCreated}</div>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      <TeacherHoverPreview username={t.username} />
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-earth-muted text-xs">Global › School</div>
              <h2 className="text-2xl font-semibold">{selectedSchool.schoolName}</h2>
              <div className="text-sm text-earth-muted">Top students in this school</div>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-[var(--earth-border)] bg-[var(--earth-card)] overflow-hidden">
            <div className="grid grid-cols-12 px-4 py-2 text-xs text-earth-muted border-b border-[var(--earth-border)]">
              <div className="col-span-2">Rank</div>
              <div className="col-span-6">Student</div>
              <div className="col-span-4 text-right">Eco-Points</div>
            </div>
            <div className="divide-y divide-[var(--earth-border)]">
              {loadingStudents && <div className="px-4 py-6 text-earth-muted text-sm">Loading…</div>}
              {studentsError && <div className="px-4 py-6 text-red-300 text-sm">{studentsError}</div>}
              {(!loadingStudents && !studentsError && (students?.length ?? 0) === 0) && (
                <div className="px-4 py-6 text-earth-muted text-sm">No students yet.</div>
              )}
              {(students || []).map((u, idx) => (
                <StudentRowItem key={u.username} row={u} rank={idx + 1} isMe={me === u.username} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SchoolHoverPreview({ schoolId, fallback }: { schoolId: string; fallback?: { schoolName: string; ecoPoints: number; students: number } }) {
  const [data, setData] = useState<{ schoolId: string; schoolName: string; ecoPoints: number; students: number; topStudent?: { username: string; name?: string; ecoPoints: number } } | null>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/leaderboard/school/${encodeURIComponent(schoolId)}/preview`);
        if (!res.ok) throw new Error('');
        const j = await res.json();
        if (mounted) setData(j);
      } catch {
        if (mounted && fallback) setData({ schoolId, ...fallback });
      } finally {
        if (mounted) setLoaded(true);
      }
    })();
    return () => { mounted = false; };
  }, [schoolId]);
  if (!loaded && !data) return <div className="text-xs text-earth-muted">Loading…</div>;
  if (!data) return <div className="text-xs text-red-300">Not available</div>;
  return (
    <div className="text-sm">
      <div className="font-medium">{data.schoolName}</div>
      <div className="text-xs text-earth-muted">Eco-Points: <span className="text-white font-semibold">{formatPoints(data.ecoPoints)}</span></div>
      <div className="text-xs text-earth-muted">Students: <span className="text-white">{data.students}</span></div>
      {data.topStudent && (
        <div className="mt-2 text-xs">
          Top Student: <span className="font-medium">@{data.topStudent.username}</span> <span className="text-earth-muted">{data.topStudent.name || ''}</span>
          <span className="ml-1">· {formatPoints(data.topStudent.ecoPoints)} pts</span>
        </div>
      )}
      <div className="mt-3 text-[10px] text-earth-muted">Click to view top students</div>
    </div>
  );
}

function StudentRowItem({ row, rank, isMe }: { row: StudentRow; rank: number; isMe: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <HoverCard open={open} onOpenChange={(o)=>setOpen(o)}>
      <HoverCardTrigger asChild>
        <div className="grid grid-cols-12 px-4 py-3 hover:bg-white/5 cursor-default" onMouseEnter={()=>setOpen(true)} onMouseLeave={()=>setOpen(false)}>
          <div className="col-span-2 text-sm">#{rank}</div>
          <div className="col-span-6">
            <span className="font-medium">@{row.username}</span>
            {row.name && <span className="text-earth-muted ml-2">{row.name}</span>}
            {isMe && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-700/30 border border-emerald-600 text-emerald-200">you</span>}
          </div>
          <div className="col-span-4 text-right font-medium">{formatPoints(row.ecoPoints)}</div>
        </div>
      </HoverCardTrigger>
      <StudentHoverPreview username={row.username} open={open} />
    </HoverCard>
  );
}

function GlobalStudentRowItem({ row, rank, isMe }: { row: GlobalStudentRow; rank: number; isMe: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <HoverCard open={open} onOpenChange={setOpen}>
      <HoverCardTrigger asChild>
        <div className="grid grid-cols-12 px-4 py-3 hover:bg-white/5 cursor-default" onMouseEnter={()=>setOpen(true)} onMouseLeave={()=>setOpen(false)}>
          <div className="col-span-2 text-sm">#{rank}</div>
          <div className="col-span-4">
            <span className="font-medium">@{row.username}</span>
            {row.name && <span className="text-earth-muted ml-2">{row.name}</span>}
            {isMe && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-700/30 border border-emerald-600 text-emerald-200">you</span>}
          </div>
          <div className="col-span-4 text-earth-muted">{row.schoolName || '—'}</div>
          <div className="col-span-2 text-right font-medium">{formatPoints(row.ecoPoints)}</div>
          <div className="col-span-12 pl-6 mt-1 flex gap-2 text-sm text-amber-200">
            {(row.achievements || []).slice(0,3).map((a: string, i: number)=>(<span key={i}>{a}</span>))}
            {row.snapshot && (
              <span className="text-xs text-earth-muted ml-auto">{row.snapshot.tasksApproved} tasks · {row.snapshot.quizzesCompleted} quizzes</span>
            )}
          </div>
        </div>
      </HoverCardTrigger>
      <StudentHoverPreview username={row.username} open={open} />
    </HoverCard>
  );
}

function StudentHoverPreview({ username, open }: { username: string; open: boolean }) {
  const [data, setData] = useState<{ username: string; name?: string; ecoPoints: number; schoolId?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const { username: me } = useAuth();

  // Load once on first open
  useEffect(() => {
    let active = true;
    if (!open || loaded) return;
    (async () => {
      try {
        const res = await fetch(`/api/leaderboard/student/${encodeURIComponent(username)}/preview`);
        if (!res.ok) throw new Error(`${res.status}`);
        const json = await res.json();
        if (active) setData(json);
      } catch (e: any) {
        if (active) setError(e?.message || "Failed to load");
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => { active = false; };
  }, [open, loaded, username]);

  return (
    <HoverCardContent>
      {!loaded && <div className="text-xs text-earth-muted">Loading…</div>}
      {error && <div className="text-xs text-red-300">{error}</div>}
      {data && (
        <div className="text-sm">
          <div className="font-medium">@{data.username} {data.name && <span className="text-earth-muted">· {data.name}</span>}</div>
          <div className="text-xs text-earth-muted">Eco-Points: <span className="text-white font-semibold">{formatPoints(data.ecoPoints)}</span></div>
          {me === data.username ? (
            <div className="mt-3">
              <a href="/student" className="text-xs underline text-emerald-300">View your eco-profile</a>
            </div>
          ) : (
            <div className="mt-3 text-[10px] text-earth-muted">Full profile is private; ask them to share.</div>
          )}
        </div>
      )}
    </HoverCardContent>
  );
}

function TeacherHoverPreview({ username }: { username: string }) {
  const [data, setData] = useState<{ username: string; name?: string; ecoPoints: number; schoolId?: string; schoolName?: string; tasksCreated: number; quizzesCreated: number } | null>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/leaderboard/teacher/${encodeURIComponent(username)}/preview`);
        if (!res.ok) throw new Error('');
        const j = await res.json();
        if (mounted) setData(j);
      } catch {
        if (mounted) setData(null);
      } finally {
        if (mounted) setLoaded(true);
      }
    })();
    return () => { mounted = false; };
  }, [username]);
  if (!loaded) return <div className="text-xs text-earth-muted">Loading…</div>;
  if (!data) return <div className="text-xs text-red-300">Not available</div>;
  return (
    <div className="text-sm">
      <div className="font-medium">@{data.username} {data.name && <span className="text-earth-muted">· {data.name}</span>}</div>
      <div className="text-xs text-earth-muted">School: <span className="text-white">{data.schoolName || '—'}</span></div>
      <div className="text-xs text-earth-muted">Eco-Points: <span className="text-white font-semibold">{formatPoints(data.ecoPoints)}</span></div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        <div>Tasks: <span className="text-white">{data.tasksCreated}</span></div>
        <div>Quizzes: <span className="text-white">{data.quizzesCreated}</span></div>
      </div>
    </div>
  );
}

function formatPoints(n: number) {
  const v = Math.floor(Number(n) || 0);
  return v.toLocaleString();
}
