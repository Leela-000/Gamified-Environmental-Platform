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
    <div 
      className="min-h-screen text-white p-6 relative"
      style={{
        backgroundImage: 'url(/api/image/stunning-high-resolution-nature-and-landscape-backgrounds-breathtaking-scenery-in-hd-photo.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/60"></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white/90">Assignments</h1>
          <p className="mt-2 text-white/70">Complete and submit your assignments</p>
        </div>
        
        {loading ? (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6">
            <p className="text-white/70">Loading…</p>
          </div>
        ) : (
          <div className="space-y-4">
            {list.length === 0 && (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6">
                <p className="text-white/70">No assignments yet.</p>
              </div>
            )}
            {list.map(row => {
              const a = row.assignment || row;
              const submission = row.submission;
              return (
                <div key={a.id} className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6 hover:bg-white/20 transition-colors">
                  <div className="font-medium text-white/90 text-lg">{a.title} <span className="text-xs text-white/60">• Max {a.maxPoints} pts</span></div>
                  {a.description && <div className="text-sm text-white/80 mt-2">{a.description}</div>}
                  {a.deadline && <div className="text-xs text-white/60 mt-1">Deadline: {a.deadline}</div>}
                  {submission ? (
                    <div className="text-sm text-white/80 mt-3 p-3 bg-white/20 rounded-lg">
                      Status: {submission.status}{typeof submission.points !== 'undefined' ? ` • ${submission.points} pts` : ''}
                    </div>
                  ) : (
                    <div className="mt-4">
                      <input 
                        type="file" 
                        multiple 
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                        onChange={e => onUpload(a.id, e.target.files)} 
                        className="text-white bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/30 file:text-white hover:file:bg-white/40" 
                      />
                      {uploadingId === a.id && <div className="text-xs text-white/60 mt-2">Uploading…</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
