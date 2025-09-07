// Helper input components
function LabeledInput({ label, value, onChange, onBlur, helper, type, disabled }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onBlur?: () => void; helper?: string; type?: string; disabled?: boolean }) {
  return (
    <label className="block">
      <span className="block text-sm text-earth-muted mb-1">{label}</span>
      <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" value={value} onChange={onChange} onBlur={onBlur} type={type} disabled={disabled} />
      {helper && <span className="block text-xs text-earth-muted mt-1">{helper}</span>}
    </label>
  );
}

function PhotoInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result || ""));
    reader.readAsDataURL(file);
  };
  return (
    <label className="block">
      <span className="block text-sm text-earth-muted mb-1">{label}</span>
      <input type="file" accept="image/*" onChange={onFile} className="w-full rounded-lg px-3 py-2 text-[var(--foreground)] bg-white" />
      {value && <img src={value} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded-full" />}
    </label>
  );
}

function SchoolPicker({ value, onChange, helper }: { value: string; onChange: (v: string) => void; helper?: string }) {
  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch('/api/schools')
      .then(r => r.json())
      .then(data => { if (mounted) setSchools(data || []); })
      .catch(() => { if (mounted) setError('Failed to load schools'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);
  return (
    <label className="block">
      <span className="block text-sm text-earth-muted mb-1">School</span>
      <select className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{loading ? 'Loading…' : error ? 'Failed to load' : 'Select school…'}</option>
        {schools.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      {helper && <span className="block text-xs text-earth-muted mt-1">{helper}</span>}
    </label>
  );
}
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";

export default function TeacherSignupWizard() {
  const { setRole } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    id: "",
    username: "",
    schoolId: "",
    subject: "",
    photoDataUrl: "",
  password: "",
  confirmPassword: "",
  });
  const [usernameStatus, setUsernameStatus] = useState<"unknown" | "checking" | "available" | "taken">("unknown");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(1, s - 1));

  async function checkUsername() {
    if (!form.username) return;
    setUsernameStatus('checking');
    try {
      const res = await fetch(`/api/username-available/${encodeURIComponent(form.username)}`).then(r => r.json());
      setUsernameStatus(res.available ? 'available' : 'taken');
    } catch {
      setUsernameStatus('unknown');
    }
  }

  async function requestOtp() {
    if (!form.email) return;
    await fetch('/api/otp/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email }) });
    setOtpSent(true);
  }

  const submit = async () => {
    const sanitized = otpCode.replace(/\D/g, '').slice(0, 6);
    if (sanitized.length !== 6) {
      alert('Please enter the 6-digit OTP sent to your email.');
      return;
    }
    if (!form.password || form.password.length < 6) {
      alert('Please set a password with at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    try {
      const avail = await fetch(`/api/username-available/${encodeURIComponent(form.username)}`).then(r => r.json());
      if (!avail.available) {
        alert('Username is taken. Please choose another.');
        return;
      }
    } catch {}

    setSubmitting(true);
  const verify = await fetch('/api/otp/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email, code: sanitized }) }).then(r => r.json());
  if (!verify.ok) {
      setSubmitting(false);
      alert('Invalid OTP. Please try again.');
      return;
    }

    await fetch('/api/signup/teacher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        username: form.username,
        schoolId: form.schoolId,
        id: form.id,
        subject: form.subject,
        photoDataUrl: form.photoDataUrl,
  password: form.password,
      })
    });
    setSubmitting(false);
    alert('Application submitted. Please wait for admin approval. You can sign in after approval.');
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-space-gradient text-white p-6">
      <h1 className="text-3xl font-bold mb-4">Teacher Sign Up</h1>
      <div className="max-w-2xl space-y-6">
        <section className="space-y-3">
          <LabeledInput label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} helper="Example: Jane Smith" />
          <LabeledInput label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} helper="OTP will be sent to this email" disabled={otpSent} />
          <LabeledInput label="Unique Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} onBlur={checkUsername} helper="This must be unique. Example: jane_smith_01" />
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={checkUsername} disabled={!form.username || usernameStatus === 'checking'}>
              {usernameStatus === 'checking' ? 'Checking…' : 'Check Username'}
            </Button>
            {usernameStatus === 'available' && <span className="text-green-400 text-sm">Available</span>}
            {usernameStatus === 'taken' && <span className="text-red-400 text-sm">Taken</span>}
          </div>
          <LabeledInput label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} helper="Example: 123@123 (you can change later)" />
          <LabeledInput label="Confirm Password" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
          <LabeledInput label="Teacher ID" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} helper="Set your own unique ID" />
          <PhotoInput label="Upload Profile Photo" value={form.photoDataUrl} onChange={(v) => setForm({ ...form, photoDataUrl: v })} />
        </section>
        <section className="space-y-3">
          <SchoolPicker value={form.schoolId} onChange={(v) => setForm({ ...form, schoolId: v })} helper="Don’t see yours? Ask admin to add your school." />
          <LabeledInput label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} helper="Example: Mathematics" />
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Verify Email</h2>
          <p className="text-earth-muted text-sm">We’ll send a one-time code to your email.</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={requestOtp} disabled={!form.email || otpSent}>
              {otpSent ? 'OTP Sent' : 'Send OTP to Email'}
            </Button>
            {otpSent && (
              <input
                placeholder="Enter 6-digit OTP"
                className="rounded-lg px-3 py-2 text-[var(--foreground)] w-40"
                value={otpCode}
                maxLength={6}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            )}
          </div>
          {otpSent && <p className="text-earth-muted text-xs">OTP sent to: <span className="text-white">{form.email}</span></p>}
        </section>
        <div className="pt-2">
          <Button className="bg-earth-orange hover:bg-earth-orange-hover" onClick={submit} disabled={submitting || usernameStatus === 'taken' || !otpCode}>
            {submitting ? 'Submitting…' : 'Submit Application'}
          </Button>
          <p className="mt-2 text-earth-muted text-sm">After submission, your application will be pending until an admin approves it.</p>
        </div>
      </div>
    </div>
  );
}
