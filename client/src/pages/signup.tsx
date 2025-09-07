import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";

export default function SignUpPage() {
  const { setRole } = useAuth();
  const [, navigate] = useLocation();

  const choose = (r: "student" | "teacher" | "admin") => {
    if (r === "admin") {
      // Do not set role. Admin must sign in.
      navigate("/signin?role=admin");
      return;
    }
  setRole(r);
  if (r === "student") navigate("/student/signup");
  else navigate("/teacher/signup");
  };

  return (
    <div className="min-h-screen bg-space-gradient text-white p-6">
      <h1 className="text-3xl font-bold">Sign Up</h1>
      <p className="mt-2 text-earth-muted">Choose your role to create an account.</p>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl">
        <Button className="bg-white text-[var(--foreground)] hover:bg-white/90" onClick={() => choose("student")}>I’m a Student</Button>
        <Button className="bg-white text-[var(--foreground)] hover:bg-white/90" onClick={() => choose("teacher")}>I’m a Teacher</Button>
        <Button className="bg-earth-orange hover:bg-earth-orange-hover" onClick={() => choose("admin")}>Admin</Button>
      </div>
      <div className="text-earth-muted text-sm mt-6">
        Already have an account? <a href="/signin" className="text-white underline">Sign In</a>
      </div>
    </div>
  );
}
