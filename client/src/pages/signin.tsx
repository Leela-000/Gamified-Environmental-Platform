import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useState } from "react";

export default function SignInPage() {
  const { setSession, role } = useAuth();
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [pendingUser, setPendingUser] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search);
      if (q.get("role") === "admin") setIsAdminMode(true);
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (role) {
      if (role === "admin") navigate("/admin");
      else if (role === "teacher") navigate("/teacher");
      else navigate("/student");
    }
  }, [role, navigate]);

  const signin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();
      if (!data.ok) throw new Error("Invalid credentials or not approved yet");
      setSession({ role: data.role, username: data.username });
      
      // Small delay to ensure session is set
      setTimeout(() => {
        if (data.role === "admin") navigate("/admin");
        else if (data.role === "teacher") navigate("/teacher");
        else navigate("/student");
      }, 100);
    } catch (e: any) {
      try {
        const st = await fetch(
          `/api/application-status/${encodeURIComponent(username)}`
        ).then((r) => r.json());
        if (st?.status === "pending") {
          setPendingUser(username);
          setError(null);
        } else {
          setError(e?.message || "Login error");
        }
      } catch {
        setError(e?.message || "Login error");
      }
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!username) return;
    setChecking(true);
    try {
      const res = await fetch(
        `/api/application-status/${encodeURIComponent(username)}`
      );
      const data = await res.json();
      if (data.status === "approved") {
        setPendingUser(null);
        setError(null);
      } else if (data.status === "rejected") {
        setPendingUser(null);
        setError("Your application was rejected.");
      } else {
        setError("Application is still pending approval.");
      }
    } catch {
      setError("Could not check status.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div
      className="min-h-screen text-white p-6 relative"
      style={{
        backgroundImage: "url(/api/image/nature-319.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10">
        <div className="max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-8">
            <h1 className="text-3xl font-bold text-white/90">
              {isAdminMode ? "Admin Sign In" : "Sign In"}
            </h1>
            <p className="mt-2 text-white/70">
              Enter your credentials to access your account.
            </p>

            {pendingUser && (
              <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
                <div className="text-yellow-200 text-sm">
                  Your application is pending approval. Check back later or click
                  below to check status.
                </div>
                <Button
                  className="mt-2 bg-yellow-500/80 hover:bg-yellow-600/80 text-white"
                  disabled={checking}
                  onClick={checkStatus}
                >
                  {checking ? "Checking..." : "Check Status"}
                </Button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-500/20 border border-red-400/30 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50"
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50"
                  placeholder="Enter your password"
                />
              </div>
              <Button
                className="w-full bg-blue-500/80 hover:bg-blue-600/80 text-white border border-blue-400/50"
                disabled={loading || pendingUser !== null}
                onClick={signin}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </div>

            <div className="text-white/70 text-sm mt-6 text-center">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="text-white underline hover:text-white/80"
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
