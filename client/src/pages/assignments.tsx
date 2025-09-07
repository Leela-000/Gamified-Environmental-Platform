import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";

export default function AssignmentsPage() {
  const { username } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await fetch('/api/me/profile', { headers: { 'X-Username': username || '' } }).then(r => r.json());
        const teacherMode = me?.role === 'teacher';
        let data: any[] = [];
        if (teacherMode) {
          data = await fetch('/api/teacher/assignments', { headers: { 'X-Username': username || '' } }).then(r => r.json());
        } else {
          data = await fetch('/api/student/assignments', { headers: { 'X-Username': username || '' } }).then(r => r.json());
        }
        if (!mounted) return;
        setList(Array.isArray(data) ? data : []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [username]);

  const onUpload = async (assignmentId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const accepted = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const arr: string[] = [];
    for (const f of Array.from(files)) {
      if (!accepted.includes(f.type)) continue;
      const b64 = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result || ''));
        r.onerror = () => reject(new Error('read failed'));
        r.readAsDataURL(f);
      });
      arr.push(b64);
    }
    if (arr.length === 0) {
      alert('Only PDF/DOC/DOCX files are accepted.');
      return;
    }
    setUploadingId(assignmentId);
    try {
      const res = await fetch(`/api/student/assignments/${encodeURIComponent(assignmentId)}/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify({ files: arr }) });
      if (!res.ok) {
        const e = await res.json().catch(() => ({} as any));
        alert(e?.error || 'Failed to submit assignment');
        return;
      }
      // reload list
      const data = await fetch('/api/student/assignments', { headers: { 'X-Username': username || '' } }).then(r => r.json());
      setList(Array.isArray(data) ? data : []);
    } finally {
      setUploadingId(null);
    }
  };
  return (
    <div className="min-h-screen bg-space-gradient text-white p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Assignments</h1>
      {loading ? <p className="text-earth-muted">Loading…</p> : (
        <div className="space-y-2">
          {list.length === 0 && <p className="text-sm text-earth-muted">No assignments yet.</p>}
          {list.map(row => {
            const a = row.assignment || row;
            const submission = row.submission;
            return (
              <div key={a.id} className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">
                <div className="font-medium">{a.title} <span className="text-xs text-earth-muted">• Max {a.maxPoints} pts</span></div>
                {a.description && <div className="text-sm text-earth-muted">{a.description}</div>}
                {a.deadline && <div className="text-xs text-earth-muted">Deadline: {a.deadline}</div>}
                {submission ? (
                  <div className="text-xs text-earth-muted mt-2">Status: {submission.status}{typeof submission.points !== 'undefined' ? ` • ${submission.points} pts` : ''}</div>
                ) : (
                  <div className="mt-2">
                    <input type="file" multiple accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={e => onUpload(a.id, e.target.files)} className="text-[var(--foreground)] bg-white rounded" />
                    {uploadingId === a.id && <div className="text-xs text-earth-muted mt-1">Uploading…</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
