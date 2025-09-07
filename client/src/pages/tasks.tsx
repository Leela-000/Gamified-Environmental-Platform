import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';

type Task = {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  maxPoints?: number;
  proofType?: 'photo' | 'text';
  groupMode?: 'solo' | 'group';
  maxGroupSize?: number;
};

export default function TasksPage() {
  const { role, username } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [studentItems, setStudentItems] = useState<Array<{ task: Task; submission?: { id: string; status: 'submitted'|'approved'|'rejected'; points?: number } }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({});
  const [stagedPhotos, setStagedPhotos] = useState<Record<string, string[]>>({});
  const [resubmitOpen, setResubmitOpen] = useState<Record<string, boolean>>({});

  const loadForTeacher = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/teacher/tasks', { headers: { 'X-Username': username || '' } });
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'teacher') {
      loadForTeacher();
    } else if (role === 'student') {
      loadForStudent();
    }
  }, [role]);

  const loadForStudent = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/student/tasks', { headers: { 'X-Username': username || '' } });
      const data = await res.json();
      setStudentItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const ensureGroup = async (taskId: string) => {
    try {
      await fetch(`/api/student/tasks/${encodeURIComponent(taskId)}/group`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Username': username || '' },
        body: JSON.stringify({ members: [] }),
      });
    } catch {}
  };

  const onPickFile = (taskId: string) => {
    const input = fileInputsRef.current[taskId];
    if (input) input.click();
  };

  const toDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const submitProof = async (taskId: string, filesOrUrls: Array<File | string>) => {
    setLoading(true);
    setError(null);
    try {
      const photos = await Promise.all(filesOrUrls.map(async f => typeof f === 'string' ? f : await toDataUrl(f)));
      const res = await fetch(`/api/student/tasks/${encodeURIComponent(taskId)}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Username': username || '' },
        body: JSON.stringify({ photos }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({} as any));
        const msg = e?.error || 'Submit failed';
        // If group required, try to create and retry once
        if (/group/i.test(msg)) {
      await ensureGroup(taskId);
      const retry = await fetch(`/api/student/tasks/${encodeURIComponent(taskId)}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Username': username || '' },
            body: JSON.stringify({ photos }),
          });
          if (!retry.ok) {
            const e2 = await retry.json().catch(() => ({} as any));
            throw new Error(e2?.error || 'Submit failed');
          }
        } else {
          throw new Error(msg);
        }
      }
      await loadForStudent();
    setStagedPhotos(prev => ({ ...prev, [taskId]: [] }));
    setResubmitOpen(prev => ({ ...prev, [taskId]: false }));
    } catch (err: any) {
      setError(err?.message || 'Submit failed');
    } finally {
      setLoading(false);
    }
  };

  const seed = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetch('/api/dev/seed-teacher-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, count: 12 })
      });
      await loadForTeacher();
    } catch (e) {
      setError('Seed failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-space-gradient text-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Tasks</h1>
        {role && <div className="text-xs text-earth-muted">as @{username}</div>}
      </div>
      {role !== 'teacher' && (
        <p className="mt-2 text-earth-muted">Complete missions to earn points.</p>
      )}

      {role === 'teacher' && (
        <div className="space-y-4">
          {loading && <div className="text-earth-muted">Loading…</div>}
          {error && <div className="text-red-300">{error}</div>}
          {!loading && tasks.length === 0 && (
            <div className="space-y-3">
              <div className="text-earth-muted text-sm">No tasks yet.</div>
              <Button onClick={seed} className="bg-earth-orange hover:bg-earth-orange-hover">Seed 12 demo tasks</Button>
            </div>
          )}
          {tasks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((t) => (
                <div key={t.id} className="p-4 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">
                  <div className="text-lg font-semibold">{t.title}</div>
                  {t.description && <div className="text-sm text-earth-muted line-clamp-3">{t.description}</div>}
                  <div className="mt-2 text-xs text-earth-muted">
                    {t.maxPoints ?? 0} pts • {t.groupMode === 'group' ? `Group${t.maxGroupSize ? ` up to ${t.maxGroupSize}` : ''}` : 'Solo'} • Proof: {t.proofType}
                  </div>
                  {t.deadline && <div className="text-xs text-earth-muted mt-1">Deadline: {t.deadline}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {role === 'student' && (
        <div className="space-y-4">
          {loading && <div className="text-earth-muted">Loading…</div>}
          {error && <div className="text-red-300">{error}</div>}
          {!loading && studentItems.length === 0 && (
            <div className="text-earth-muted text-sm">No tasks available yet.</div>
          )}
          {studentItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentItems.map(({ task, submission }) => (
                <div key={task.id} className="p-4 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">
                  <div className="text-lg font-semibold">{task.title}</div>
                  {task.description && <div className="text-sm text-earth-muted line-clamp-3">{task.description}</div>}
                  <div className="mt-2 text-xs text-earth-muted">
                    {task.maxPoints ?? 0} pts • {task.groupMode === 'group' ? `Group${task.maxGroupSize ? ` up to ${task.maxGroupSize}` : ''}` : 'Solo'} • Proof: {task.proofType}
                  </div>
                  {task.deadline && <div className="text-xs text-earth-muted mt-1">Deadline: {task.deadline}</div>}

                  <div className="mt-3 text-sm">
                    <div className={
                      submission?.status === 'approved' ? 'text-emerald-400' :
                      submission?.status === 'rejected' ? 'text-red-400' :
                      submission?.status === 'submitted' ? 'text-amber-300' : 'text-earth-muted'
                    }>
                      Status: {submission?.status ? submission.status : 'not submitted'}
                    </div>
                    {submission?.status === 'approved' && (
                      <div className="text-emerald-400 text-xs">Approved • {submission.points ?? 0} pts</div>
                    )}
                    {submission?.status === 'rejected' && (
                      <div className="text-red-400 text-xs">Rejected • you can resubmit</div>
                    )}
                    {submission?.status === 'submitted' && (
                      <div className="text-amber-300 text-xs">Waiting for review…</div>
                    )}
                  </div>

                  {task.groupMode === 'group' && (
                    <div className="mt-2">
                      <Button variant="secondary" onClick={() => ensureGroup(task.id)}>Ensure Group</Button>
                    </div>
                  )}

                  {/* Controls per status */}
                  {submission?.status === 'approved' ? null : (
                    <>
                      {/* When never submitted: show staging controls */}
                      {!submission ? (
                        <>
                          <div className="mt-3 flex items-center gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              hidden
                              ref={(el) => { fileInputsRef.current[task.id] = el; }}
                              onChange={(e) => {
                                const files = Array.from(e.currentTarget.files || []);
                                if (files.length) {
                                  Promise.all(files.map(toDataUrl)).then((urls) => {
                                    setStagedPhotos(prev => ({ ...prev, [task.id]: [...(prev[task.id] || []), ...urls] }));
                                  });
                                }
                                e.currentTarget.value = '';
                              }}
                            />
                            <Button variant="secondary" onClick={() => onPickFile(task.id)}>Add Photos</Button>
                            <Button className="bg-earth-orange hover:bg-earth-orange-hover" disabled={loading || !(stagedPhotos[task.id]?.length)} onClick={() => submitProof(task.id, stagedPhotos[task.id] || [])}>Submit</Button>
                          </div>
                          {Array.isArray(stagedPhotos[task.id]) && stagedPhotos[task.id].length > 0 && (
                            <div className="mt-2 flex gap-2 flex-wrap">
                              {stagedPhotos[task.id].map((p, i) => (
                                <div key={i} className="relative">
                                  <img src={p} alt={`Staged ${i+1}`} className="h-16 w-16 object-cover rounded border border-[var(--earth-border)]" />
                                  <button className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-600 text-white text-xs" onClick={() => setStagedPhotos(prev => ({ ...prev, [task.id]: (prev[task.id] || []).filter((_, idx) => idx !== i) }))}>×</button>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        // Has submission (submitted or rejected): show Resubmit toggle
                        <div className="mt-3">
                          <Button variant="secondary" onClick={() => setResubmitOpen(prev => ({ ...prev, [task.id]: !prev[task.id] }))}>
                            {resubmitOpen[task.id] ? 'Cancel' : 'Resubmit'}
                          </Button>
                          {resubmitOpen[task.id] && (
                            <>
                              <div className="mt-3 flex items-center gap-2">
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  hidden
                                  ref={(el) => { fileInputsRef.current[task.id] = el; }}
                                  onChange={(e) => {
                                    const files = Array.from(e.currentTarget.files || []);
                                    if (files.length) {
                                      Promise.all(files.map(toDataUrl)).then((urls) => {
                                        setStagedPhotos(prev => ({ ...prev, [task.id]: [...(prev[task.id] || []), ...urls] }));
                                      });
                                    }
                                    e.currentTarget.value = '';
                                  }}
                                />
                                <Button variant="secondary" onClick={() => onPickFile(task.id)}>Add Photos</Button>
                                <Button className="bg-earth-orange hover:bg-earth-orange-hover" disabled={loading || !(stagedPhotos[task.id]?.length)} onClick={() => submitProof(task.id, stagedPhotos[task.id] || [])}>Submit</Button>
                              </div>
                              {Array.isArray(stagedPhotos[task.id]) && stagedPhotos[task.id].length > 0 && (
                                <div className="mt-2 flex gap-2 flex-wrap">
                                  {stagedPhotos[task.id].map((p, i) => (
                                    <div key={i} className="relative">
                                      <img src={p} alt={`Staged ${i+1}`} className="h-16 w-16 object-cover rounded border border-[var(--earth-border)]" />
                                      <button className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-600 text-white text-xs" onClick={() => setStagedPhotos(prev => ({ ...prev, [task.id]: (prev[task.id] || []).filter((_, idx) => idx !== i) }))}>×</button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* Show last submitted photos (read-only) */}
                  {submission && (Array.isArray((submission as any).photos) || (submission as any).photoDataUrl) && (
                    <div className="mt-3">
                      <div className="text-xs text-earth-muted mb-1">Last submitted</div>
                      <div className="flex gap-2 flex-wrap">
                        {Array.isArray((submission as any).photos) && (submission as any).photos.length > 0 ? (
                          (submission as any).photos.map((p: string, i: number) => (
                            <img key={i} src={p} alt={`Submitted ${i+1}`} className="h-16 w-16 object-cover rounded border border-[var(--earth-border)]" />
                          ))
                        ) : (submission as any).photoDataUrl ? (
                          <img src={(submission as any).photoDataUrl} alt="Submitted" className="h-16 w-16 object-cover rounded border border-[var(--earth-border)]" />
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
