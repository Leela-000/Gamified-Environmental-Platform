import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";

export default function AnnouncementsPage() {
  const { username } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
  const me = await fetch('/api/me/profile', { headers: { 'X-Username': username || '' } }).then(r => r.json());
  const teacherMode = me?.role === 'teacher';
  const url = teacherMode ? '/api/teacher/announcements' : '/api/student/announcements';
  const data = await fetch(url, { headers: { 'X-Username': username || '' } }).then(r => r.json());
        if (!mounted) return;
        setList(Array.isArray(data) ? data : []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [username]);
  return (
    <div className="min-h-screen bg-space-gradient text-white p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Announcements</h1>
      {loading ? <p className="text-earth-muted">Loading…</p> : (
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
      )}
    </div>
  );
}
