import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useState } from "react";

export default function SignInPage() {
  const { setSession } = useAuth();
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [pendingUser, setPendingUser] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // If navigated with ?role=admin, show a hint
    if (typeof window !== 'undefined') {
      const q = new URLSearchParams(window.location.search);
      if (q.get('role') === 'admin') setIsAdminMode(true);
    }
  }, []);

  const signin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      if (!data.ok) throw new Error('Invalid credentials or not approved yet');
  setSession({ role: data.role, username: data.username });
      if (data.role === 'admin') navigate('/admin');
      else if (data.role === 'teacher') navigate('/teacher');
      else navigate('/student');
    } catch (e: any) {
      // If login failed, detect if the application is pending
      try {
        const st = await fetch(`/api/application-status/${encodeURIComponent(username)}`).then(r => r.json());
        if (st?.status === 'pending') {
          setPendingUser(username);
          setError(null);
        } else {
          setError(e?.message || 'Login error');
        }
      } catch {
        setError(e?.message || 'Login error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Poll for approval when pending
  useEffect(() => {
    if (!pendingUser) return;
    let timer: number | undefined;
    let cancelled = false;
    const tick = async () => {
      if (cancelled) return;
      setChecking(true);
      try {
        const st = await fetch(`/api/application-status/${encodeURIComponent(pendingUser)}`).then(r => r.json());
        if (st?.status === 'approved') {
          setChecking(false);
          // Try logging in again with same credentials to route correctly
          setPendingUser(null);
          await signin();
          return;
        }
      } catch {}
      setChecking(false);
      timer = window.setTimeout(tick, 3000);
    };
    tick();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [pendingUser]);

  return (
    <div className="min-h-screen bg-space-gradient text-white p-6">
      <h1 className="text-3xl font-bold">Sign In</h1>
      {isAdminMode && (
        <p className="mt-2 text-earth-muted text-sm">Admin sign-in: use username <span className="text-white">admin123</span> and your password.</p>
      )}
      <div className="mt-6 max-w-md space-y-3">
        {pendingUser && (
          <div className="p-3 rounded-lg bg-[var(--earth-card)] border border-[var(--earth-border)]">
            <div className="font-medium">@{pendingUser}</div>
            <div className="text-sm text-earth-muted">Your application is pending admin approval.</div>
            <div className="text-xs text-earth-muted mt-1">We’ll check automatically and continue once approved{checking ? '…' : '.'}</div>
            <div className="mt-2 flex gap-2">
              <Button variant="secondary" onClick={() => setPendingUser(null)}>Back to Sign In</Button>
              <Button variant="secondary" onClick={() => setPendingUser(pendingUser)} disabled>
                {checking ? 'Checking…' : 'Waiting'}
              </Button>
            </div>
          </div>
        )}
        <label className="block">
          <span className="block text-sm text-earth-muted mb-1">Username</span>
          <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label className="block">
          <span className="block text-sm text-earth-muted mb-1">Password</span>
          <input type="password" className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <div className="pt-2">
          <Button className="bg-earth-orange hover:bg-earth-orange-hover" onClick={signin} disabled={loading || !username || !password}>
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </div>
        <div className="text-earth-muted text-sm">
          New here? <a href="/signup" className="text-white underline">Create an account</a>
        </div>
      </div>
    </div>
  );
}
