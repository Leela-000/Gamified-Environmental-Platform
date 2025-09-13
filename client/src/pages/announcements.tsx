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
    <div 
      className="min-h-screen text-white p-6 relative"
      style={{
        backgroundImage: 'url(/api/image/360_F_819000674_C4KBdZyevZiKOZUXUqDnx7Vq1Hjskq3g.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white/90">Announcements</h1>
          <p className="mt-2 text-white/70">Stay updated with the latest news and updates</p>
        </div>
        
        {loading ? (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6">
            <p className="text-white/70">Loading…</p>
          </div>
        ) : (
          <div className="space-y-4">
            {list.length === 0 && (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6">
                <p className="text-white/70">No announcements yet.</p>
              </div>
            )}
            {list.map(a => (
              <div key={a.id} className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6 hover:bg-white/20 transition-colors">
                <div className="font-medium text-white/90 text-lg">{a.title}</div>
                {a.body && <div className="text-sm text-white/80 whitespace-pre-wrap mt-2">{a.body}</div>}
                <div className="text-xs text-white/60 mt-3">{new Date(a.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
