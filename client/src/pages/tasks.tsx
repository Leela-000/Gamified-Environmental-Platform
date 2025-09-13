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
  const [groupInfo, setGroupInfo] = useState<Record<string, { memberUsernames: string[] } | null>>({});

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
      const items = Array.isArray(data) ? data : [];
      setStudentItems(items);
      
      // Load group information for group tasks
      const groupInfoPromises = items
        .filter(({ task }) => task.groupMode === 'group')
        .map(async ({ task }) => {
          try {
            const groupRes = await fetch(`/api/student/tasks/${encodeURIComponent(task.id)}/group`, {
              headers: { 'X-Username': username || '' }
            });
            if (groupRes.ok) {
              const groupData = await groupRes.json();
              return { taskId: task.id, group: groupData };
            }
          } catch (e) {
            // Group doesn't exist yet
          }
          return { taskId: task.id, group: null };
        });
      
      const groupResults = await Promise.all(groupInfoPromises);
      const newGroupInfo: Record<string, { memberUsernames: string[] } | null> = {};
      groupResults.forEach(({ taskId, group }) => {
        newGroupInfo[taskId] = group;
      });
      setGroupInfo(newGroupInfo);
    } catch (e) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const ensureGroup = async (taskId: string) => {
    setLoading(true);
    setError(null);
    try {
      // First, check if user is already in a group
      const groupCheck = await fetch(`/api/student/tasks/${encodeURIComponent(taskId)}/group`, {
        headers: { 'X-Username': username || '' }
      });
      
      if (groupCheck.ok) {
        const existingGroup = await groupCheck.json();
        if (existingGroup && existingGroup.memberUsernames?.length > 0) {
          setError(`Already in group with: ${existingGroup.memberUsernames.join(', ')}`);
          return;
        }
      }
      
      // If no existing group, prompt for member usernames
      const membersInput = prompt('Enter usernames of group members (comma-separated, excluding yourself):');
      if (!membersInput) {
        setError('Group creation cancelled');
        return;
      }
      
      const members = membersInput
        .split(',')
        .map(u => u.trim())
        .filter(u => u.length > 0 && u !== username);
      
      if (members.length === 0) {
        setError('You need at least one other member to form a group');
        return;
      }
      
      const response = await fetch(`/api/student/tasks/${encodeURIComponent(taskId)}/group`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Username': username || '' },
        body: JSON.stringify({ members }),
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create group');
      }
      
      setError(`Group created successfully with: ${result.group.memberUsernames.join(', ')}`);
      
      // Update group info state
      setGroupInfo(prev => ({
        ...prev,
        [taskId]: result.group
      }));
      
      await loadForStudent(); // Refresh the tasks
    } catch (err: any) {
      setError(err.message || 'Failed to manage group');
    } finally {
      setLoading(false);
    }
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
      if (!filesOrUrls || filesOrUrls.length === 0) {
        throw new Error('Please add at least one photo before submitting');
      }
      
      const photos = await Promise.all(filesOrUrls.map(async f => typeof f === 'string' ? f : await toDataUrl(f)));
      
      if (photos.length === 0) {
        throw new Error('No valid photos to submit');
      }
      
      const res = await fetch(`/api/student/tasks/${encodeURIComponent(taskId)}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Username': username || '' },
        body: JSON.stringify({ photos }),
      });
      
      if (!res.ok) {
        const e = await res.json().catch(() => ({} as any));
        const msg = e?.error || 'Submit failed';
        // If group required, try to create and retry once
        if (/group/i.test(msg) || msg.includes('Create or join a group first')) {
          setError('This task requires a group. Please click "Create Group" first to create or join a group.');
          return;
        } else {
          throw new Error(msg);
        }
      }
      
      await loadForStudent();
      setStagedPhotos(prev => ({ ...prev, [taskId]: [] }));
      setResubmitOpen(prev => ({ ...prev, [taskId]: false }));
      setError('Task submitted successfully!');
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
    <div 
      className="min-h-screen text-white p-6 relative"
      style={{
        backgroundImage: 'url(/api/image/golden-sunset-hd-backgrounds-captivatings-for-serene-scenes-photo.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Glassmorphic header */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white/90">Tasks</h1>
            {role && <div className="text-xs text-white/70">as @{username}</div>}
          </div>
          {role !== 'teacher' && (
            <p className="mt-2 text-white/70">Complete missions to earn points.</p>
          )}
        </div>

      {role === 'teacher' && (
        <div className="space-y-4">
          {loading && <div className="text-white/70">Loading…</div>}
          {error && <div className="text-red-300">{error}</div>}
          {!loading && tasks.length === 0 && (
            <div className="space-y-3">
              <div className="text-white/70 text-sm">No tasks yet.</div>
              <Button onClick={seed} className="bg-earth-orange hover:bg-earth-orange-hover">Seed 12 demo tasks</Button>
            </div>
          )}
          {tasks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((t) => (
                <div key={t.id} className="p-4 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
                  <div className="text-lg font-semibold text-white/90">{t.title}</div>
                  {t.description && <div className="text-sm text-white/70 line-clamp-3">{t.description}</div>}
                  <div className="mt-2 text-xs text-white/70">
                    {t.maxPoints ?? 0} pts • {t.groupMode === 'group' ? `Group${t.maxGroupSize ? ` up to ${t.maxGroupSize}` : ''}` : 'Solo'} • Proof: {t.proofType}
                  </div>
                  {t.deadline && <div className="text-xs text-white/70 mt-1">Deadline: {t.deadline}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {role === 'student' && (
        <div className="space-y-4">
          {loading && <div className="text-white/70">Loading…</div>}
          {error && <div className="text-red-300 bg-red-500/20 p-3 rounded-lg border border-red-400/30">{error}</div>}
          {!loading && studentItems.length === 0 && (
            <div className="text-white/70 text-sm">No tasks available yet.</div>
          )}
          {studentItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentItems.map(({ task, submission }) => (
                <div key={task.id} className="p-4 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
                  <div className="text-lg font-semibold text-white/90">{task.title}</div>
                  {task.description && <div className="text-sm text-white/70 line-clamp-3">{task.description}</div>}
                  <div className="mt-2 text-xs text-white/70">
                    {task.maxPoints ?? 0} pts • {task.groupMode === 'group' ? `Group${task.maxGroupSize ? ` up to ${task.maxGroupSize}` : ''}` : 'Solo'} • Proof: {task.proofType}
                  </div>
                  {task.deadline && <div className="text-xs text-white/70 mt-1">Deadline: {task.deadline}</div>}

                  <div className="mt-3 text-sm">
                    <div className={
                      submission?.status === 'approved' ? 'text-emerald-300' :
                      submission?.status === 'rejected' ? 'text-red-300' :
                      submission?.status === 'submitted' ? 'text-amber-200' : 'text-white/70'
                    }>
                      Status: {submission?.status ? submission.status : 'not submitted'}
                    </div>
                    {submission?.status === 'approved' && (
                      <div className="text-emerald-300 text-xs">Approved • {submission.points ?? 0} pts</div>
                    )}
                    {submission?.status === 'rejected' && (
                      <div className="text-red-300 text-xs">Rejected • you can resubmit</div>
                    )}
                    {submission?.status === 'submitted' && (
                      <div className="text-amber-200 text-xs">Waiting for review…</div>
                    )}
                  </div>

                  {task.groupMode === 'group' && (
                    <div className="mt-2">
                      <Button 
                        variant="secondary" 
                        onClick={() => ensureGroup(task.id)}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                      >
                        Ensure Group
                      </Button>
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
                            <Button 
                              variant="secondary" 
                              onClick={() => onPickFile(task.id)}
                              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                            >
                              Add Photos
                            </Button>
                            <Button 
                              className="bg-orange-500/80 hover:bg-orange-600/80 text-white border border-orange-400/50" 
                              disabled={loading || !(stagedPhotos[task.id]?.length)} 
                              onClick={() => submitProof(task.id, stagedPhotos[task.id] || [])}
                            >
                              Submit
                            </Button>
                          </div>
                          {Array.isArray(stagedPhotos[task.id]) && stagedPhotos[task.id].length > 0 && (
                            <div className="mt-2 flex gap-2 flex-wrap">
                              {stagedPhotos[task.id].map((p, i) => (
                                <div key={i} className="relative">
                                  <img src={p} alt={`Staged ${i+1}`} className="h-16 w-16 object-cover rounded border border-white/30" />
                                  <button className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500/80 text-white text-xs hover:bg-red-600/80" onClick={() => setStagedPhotos(prev => ({ ...prev, [task.id]: (prev[task.id] || []).filter((_, idx) => idx !== i) }))}>×</button>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        // Has submission (submitted or rejected): show Resubmit toggle
                        <div className="mt-3">
                          <Button 
                            variant="secondary" 
                            onClick={() => setResubmitOpen(prev => ({ ...prev, [task.id]: !prev[task.id] }))}
                            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                          >
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
                                <Button 
                                  variant="secondary" 
                                  onClick={() => onPickFile(task.id)}
                                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                                >
                                  Add Photos
                                </Button>
                                <Button 
                                  className="bg-orange-500/80 hover:bg-orange-600/80 text-white border border-orange-400/50" 
                                  disabled={loading || !(stagedPhotos[task.id]?.length)} 
                                  onClick={() => submitProof(task.id, stagedPhotos[task.id] || [])}
                                >
                                  Submit
                                </Button>
                              </div>
                              {Array.isArray(stagedPhotos[task.id]) && stagedPhotos[task.id].length > 0 && (
                                <div className="mt-2 flex gap-2 flex-wrap">
                                  {stagedPhotos[task.id].map((p, i) => (
                                    <div key={i} className="relative">
                                      <img src={p} alt={`Staged ${i+1}`} className="h-16 w-16 object-cover rounded border border-white/30" />
                                      <button className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500/80 text-white text-xs hover:bg-red-600/80" onClick={() => setStagedPhotos(prev => ({ ...prev, [task.id]: (prev[task.id] || []).filter((_, idx) => idx !== i) }))}>×</button>
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
                      <div className="text-xs text-white/70 mb-1">Last submitted</div>
                      <div className="flex gap-2 flex-wrap">
                        {Array.isArray((submission as any).photos) && (submission as any).photos.length > 0 ? (
                          (submission as any).photos.map((p: string, i: number) => (
                            <img key={i} src={p} alt={`Submitted ${i+1}`} className="h-16 w-16 object-cover rounded border border-white/30" />
                          ))
                        ) : (submission as any).photoDataUrl ? (
                          <img src={(submission as any).photoDataUrl} alt="Submitted" className="h-16 w-16 object-cover rounded border border-white/30" />
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
    </div>
  );
}
