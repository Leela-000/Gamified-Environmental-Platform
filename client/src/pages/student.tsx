import { useAuth } from "@/lib/auth";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Bell } from "lucide-react";

export default function StudentAppShell() {
  const { role, username, clear } = useAuth();
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  const Guard = useMemo(() => {
    if (role !== 'student') {
      return (
        <div className="min-h-screen bg-space-gradient text-white p-6 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold mb-4">Student Portal</h1>
          <p className="text-earth-muted">Access denied. Please log in as a student.</p>
        </div>
      );
    }
    return null;
  }, [role]);
  if (Guard) return Guard;

  return (
    <div className="min-h-screen bg-space-gradient text-white p-6">
      <div className="flex items-center justify-between mb-6">
  <h1 className="text-3xl font-bold">Student Portal</h1>
        <div className="flex gap-2 items-center">
          <NotificationsBell />
          <Button variant="secondary" onClick={clear}>Logout</Button>
        </div>
      </div>

      {!showProfileEditor ? <StudentProfileView /> : <StudentProfileEditor onClose={() => setShowProfileEditor(false)} />}

      {/* Bottom bar */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center pointer-events-none">
        <div className="pointer-events-auto rounded-full border border-[var(--earth-border)] bg-[var(--earth-card)] shadow-lg px-2 py-1">
          <Button size="sm" variant="secondary" onClick={()=>setShowProfileEditor(true)}>Profile</Button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <div className="p-4 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">{children}</div>
    </section>
  );
}

function StudentProfileView() {
  const { username } = useAuth();
  const [profile, setProfile] = useState<any | null>(null); // /api/student/profile
  const [me, setMe] = useState<any | null>(null); // /api/me/profile (for avatar/schoolId)
  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([]);
  const [saving, setSaving] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [p, m, s] = await Promise.all([
          fetch('/api/student/profile', { headers: { 'X-Username': username || '' } }).then(r => r.json()),
          fetch('/api/me/profile', { headers: { 'X-Username': username || '' } }).then(r => r.json()),
          fetch('/api/schools').then(r => r.json()),
        ]);
        if (!mounted) return;
        setProfile(p);
        setMe(m);
        setSchools(Array.isArray(s) ? s : []);
        // Trigger a small celebration if any achievement unlocked
        if ((p?.achievements || []).some((a: any) => a.unlocked)) {
          setCelebrate(true);
          setTimeout(() => setCelebrate(false), 2000);
        }
      } catch {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [username]);

  const togglePrivacy = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await fetch('/api/student/profile/privacy', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify({ allowExternalView: !profile.allowExternalView }) });
      const p = await fetch('/api/student/profile', { headers: { 'X-Username': username || '' } }).then(r => r.json());
      setProfile(p);
    } finally {
      setSaving(false);
    }
  };

  const schoolName = useMemo(() => {
    if (!me?.schoolId) return '';
    const f = schools.find(s => s.id === me.schoolId);
    return f?.name || me.schoolId || '';
  }, [me?.schoolId, schools]);

  const stageEmoji = profile?.ecoTreeStage === 'Big Tree' ? '🌳' : profile?.ecoTreeStage === 'Small Tree' ? '🌲' : '🌱';
  const ecoPoints = Number(profile?.ecoPoints || 0);
  const progress = (() => {
    if (ecoPoints >= 500) return 100;
    const prev = ecoPoints >= 100 ? 100 : 0;
    const next = ecoPoints >= 100 ? 500 : 100;
    return Math.max(0, Math.min(100, Math.round(((ecoPoints - prev) / (next - prev)) * 100)));
  })();

  return (
    <div className="space-y-6">
      {!profile ? (
        <div className="text-earth-muted">Loading…</div>
      ) : (
        <>
          {/* Header card */}
          <div className="relative p-4 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)] flex items-center gap-4 overflow-hidden">
            {me?.photoDataUrl ? (
              <img src={me.photoDataUrl} alt="Avatar" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-[var(--earth-border)] flex items-center justify-center text-2xl">👩‍🎓</div>
            )}
            <div className="flex-1">
              <div className="text-lg font-semibold">{me?.name || 'Student'} <span className="text-earth-muted font-normal">(@{username})</span></div>
              <div className="text-sm text-earth-muted">{schoolName || '—'}</div>
              {/* Profile completion */}
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-earth-muted mb-1">
                  <span>Profile {Math.max(0, Math.min(100, Number(profile.profileCompletion || 0)))}% complete</span>
                  <span>Next goal: {ecoPoints >= 500 ? 'Maxed!' : ecoPoints >= 100 ? `${500 - ecoPoints} pts → Big Tree` : `${100 - ecoPoints} pts → Small Tree`}</span>
                </div>
                <Progress value={Math.max(0, Math.min(100, Number(profile.profileCompletion || 0)))} />
              </div>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-700/30 border border-emerald-600 text-emerald-200 text-xs">Eco-Points: {ecoPoints}</span>
              <span className="px-3 py-1 rounded-full bg-indigo-700/30 border border-indigo-600 text-indigo-200 text-xs">Global #{profile.ranks?.global || '-'}</span>
              <span className="px-3 py-1 rounded-full bg-amber-700/30 border border-amber-600 text-amber-200 text-xs">School #{profile.ranks?.school || '-'}</span>
            </div>
            {celebrate && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-4xl animate-bounce">🎉</div>
            )}
          </div>

          {/* Main grid: left content + right sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6 lg:col-span-2">
              {/* Eco-Tree progress */}
              <Section title="My Eco-Tree">
                <div className="flex items-center gap-4">
                  <div className="text-5xl animate-pulse" aria-hidden>{stageEmoji}</div>
                  <div className="flex-1">
                    <div className="text-sm text-earth-muted mb-1">{profile.ecoTreeStage}</div>
                    <div className="h-3 bg-[var(--earth-border)] rounded-full overflow-hidden">
                      <div className="h-3 bg-gradient-to-r from-green-500 to-green-300" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="text-xs text-earth-muted mt-1">{ecoPoints >= 500 ? 'Max stage' : ecoPoints >= 100 ? `${ecoPoints - 100} / 400 to Big Tree` : `${ecoPoints} / 100 to Small Tree`}</div>
                  </div>
                </div>
              </Section>

              {/* Achievements */}
              <Section title="Achievements">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {profile.achievements?.map((a: any) => {
                    const emoji = a.key === 'first_task' ? '🥇' : a.key === 'top10_school' ? '🏅' : '🧠';
                    return (
                      <div key={a.key} className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)] flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-lg ${a.unlocked ? 'bg-emerald-600/40' : 'bg-[var(--earth-border)]'}`}>{emoji}</div>
                        <div>
                          <div className="font-medium">{a.name}</div>
                          <div className="text-xs text-earth-muted">{a.unlocked ? 'Unlocked' : 'Locked'}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Section>

              {/* Timeline */}
              <Section title="Contribution Timeline">
                <div className="space-y-3">
                  {(!profile.timeline || profile.timeline.length === 0) && (
                    <p className="text-earth-muted text-sm">No contributions yet. Complete a task to begin your journey.</p>
                  )}
                  {profile.timeline?.map((t: any, idx: number) => (
                    <div key={idx} className="relative pl-6">
                      <div className="absolute left-2 top-2 h-full w-px bg-[var(--earth-border)]" />
                      <div className="absolute left-0 top-2 h-4 w-4 rounded-full bg-emerald-500" />
                      <div className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">
                        <div className="text-xs text-earth-muted">{new Date(t.when).toLocaleString()}</div>
                        <div className="font-medium">
                          {t.kind === 'quiz' ? `Quiz attempted: ${t.title}` : t.kind === 'game' ? `Played game: ${t.title}` : t.title}
                        </div>
                        {t.photoDataUrl && <img src={t.photoDataUrl} alt="Proof" className="mt-2 h-24 w-24 object-cover rounded" />}
                        {typeof t.scorePercent === 'number' && (
                          <div className="text-xs text-amber-200 mt-1">Score: {t.scorePercent}%</div>
                        )}
                        {typeof t.points === 'number' && t.kind !== 'game' && (
                          <div className="text-xs text-emerald-200 mt-1">Points: {t.points}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Streak Tracker */}
              <Section title="Streak Tracker">
                <WeeklyStreak days={profile.week?.days || []} start={profile.week?.start} />
              </Section>

              {/* Friends/Schoolmates Leaderboard */}
              <Section title="Friends / Schoolmates Leaderboard">
                <div>
                  <div className="text-sm">You're <span className="font-semibold">#{profile.ranks?.school || '-'}</span> in your school</div>
                  {profile.leaderboardNext ? (
                    <div className="text-xs text-earth-muted mt-1">Next to beat <span className="text-white">@{profile.leaderboardNext.username}</span> with {profile.leaderboardNext.points} pts</div>
                  ) : (
                    <div className="text-xs text-earth-muted mt-1">You're at the top! 🎉</div>
                  )}
                </div>
              </Section>
            </div>
          </div>

          {/* Privacy */}
          <Section title="Privacy">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Allow other schools to view my profile</div>
                <div className="text-xs text-earth-muted">Toggle visibility outside your school.</div>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-emerald-500" checked={!!profile.allowExternalView} onChange={togglePrivacy} disabled={saving} />
                <span className="text-sm">{profile.allowExternalView ? 'On' : 'Off'}</span>
              </label>
            </div>
          </Section>
        </>
      )}
    </div>
  );
}

function StudentProfileEditor({ onClose }: { onClose: () => void }) {
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
        studentId: data.studentId || '',
        rollNumber: data.rollNumber || '',
        className: data.className || '',
        section: data.section || '',
      }) });
      if (!res.ok) {
        const e = await res.json().catch(() => ({} as any));
        alert(e?.error || 'Failed to save profile');
        return;
      }
      const p = await res.json();
      setData(p);
      onClose();
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
              <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" value={data.role || 'student'} readOnly />
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
              <span className="block text-sm text-earth-muted mb-1">Student ID</span>
              <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" value={data.studentId || ''} onChange={e => setData({ ...data, studentId: e.target.value })} />
            </label>
            <label className="block">
              <span className="block text-sm text-earth-muted mb-1">Roll Number</span>
              <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" value={data.rollNumber || ''} onChange={e => setData({ ...data, rollNumber: e.target.value })} />
            </label>
            <label className="block">
              <span className="block text-sm text-earth-muted mb-1">Class</span>
              <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" value={data.className || ''} onChange={e => setData({ ...data, className: e.target.value })} />
            </label>
            <label className="block">
              <span className="block text-sm text-earth-muted mb-1">Section</span>
              <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" value={data.section || ''} onChange={e => setData({ ...data, section: e.target.value })} />
            </label>
          </div>
          <div className="flex gap-2">
            <Button className="bg-earth-orange hover:bg-earth-orange-hover" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
          <p className="text-xs text-earth-muted">Update your details. Changes will reflect in your profile header and timeline context.</p>
        </div>
      )}
    </Section>
  );
}

function WeeklyStreak({ days, start }: { days: boolean[]; start?: number }) {
  const labels = ['M','T','W','T','F','S','S'];
  return (
    <div>
      <div className="flex gap-2">
        {labels.map((l, i) => (
          <div key={i} className={`flex flex-col items-center text-xs ${days[i] ? 'text-white' : 'text-earth-muted'}`}>
            <div className={`h-6 w-6 rounded-full border flex items-center justify-center mb-1 ${days[i] ? 'bg-emerald-500/60 border-emerald-400' : 'border-[var(--earth-border)]'}`}>{l}</div>
          </div>
        ))}
      </div>
      {start && <div className="text-[10px] text-earth-muted mt-2">Week of {new Date(start).toLocaleDateString()}</div>}
    </div>
  );
}

function NotificationsBell() {
  const { username } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [unread, setUnread] = useState<number>(0);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const prof = await fetch('/api/student/profile', { headers: { 'X-Username': username || '' } }).then(r => r.json());
        if (!mounted) return;
        setUnread(Number(prof?.unreadNotifications || 0));
      } catch {}
    })();
    return () => { mounted = false; };
  }, [username]);

  const load = async () => {
    const list = await fetch('/api/notifications', { headers: { 'X-Username': username || '' } }).then(r => r.json());
    setItems(Array.isArray(list) ? list : []);
  };
  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      await load();
      await fetch('/api/notifications/read', { method: 'POST', headers: { 'X-Username': username || '' } });
      setUnread(0);
    }
  };
  return (
    <div className="relative">
      <button onClick={toggle} className="relative h-9 w-9 grid place-items-center rounded-md border border-[var(--earth-border)] bg-[var(--earth-card)] hover:bg-white/5">
        <Bell size={16} />
        {unread > 0 && <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-red-500 text-[10px] grid place-items-center">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 max-h-80 overflow-auto rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)] shadow-lg z-10">
          <div className="p-2 text-xs text-earth-muted">Notifications</div>
          <div className="divide-y divide-[var(--earth-border)]">
            {items.length === 0 && <div className="p-3 text-xs text-earth-muted">No notifications</div>}
            {items.map((n, i) => (
              <div key={i} className="p-3 text-sm">
                <div>{n.message}</div>
                <div className="text-[10px] text-earth-muted">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
