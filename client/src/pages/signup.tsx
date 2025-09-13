import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";

export default function SignUpPage() {
  const { setRole } = useAuth();
  const [, navigate] = useLocation();

  const choose = (r: "student" | "teacher" | "admin") => {
    if (r === "admin") {
      navigate("/signin?role=admin");
      return;
    }
    setRole(r);
    if (r === "student") navigate("/student/signup");
    else navigate("/teacher/signup");
  };

  return (
    <div 
      className="min-h-screen text-white p-6 relative"
      style={{
        backgroundImage: "url(/api/image/Bhpd8.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-8">
            <h1 className="text-3xl font-bold text-white/90">Sign Up</h1>
            <p className="mt-2 text-white/70">Choose your role to create an account.</p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button 
                className="bg-white/20 text-white hover:bg-white/30 border border-white/30 backdrop-blur-sm" 
                onClick={() => choose("student")}
              >
                I'm a Student
              </Button>
              <Button 
                className="bg-white/20 text-white hover:bg-white/30 border border-white/30 backdrop-blur-sm" 
                onClick={() => choose("teacher")}
              >
                I'm a Teacher
              </Button>
              <Button 
                className="bg-orange-500/80 hover:bg-orange-600/80 text-white border border-orange-400/50" 
                onClick={() => choose("admin")}
              >
                Admin
              </Button>
            </div>
            <div className="text-white/70 text-sm mt-6">
              Already have an account? <a href="/signin" className="text-white underline hover:text-white/80">Sign In</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
