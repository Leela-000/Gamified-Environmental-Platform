import { Globe3D } from "@/components/Globe3D";
import { TopicCards } from "@/components/TopicCards";
import { SocialSidebar } from "@/components/SocialSidebar";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const [globalTint, setGlobalTint] = useState<null | "signin" | "signup">(null);
  const { role, clear } = useAuth();
  const handleWatchVideo = () => {
    // TODO: Implement video player or navigation
    console.log("Watch video clicked");
  };

  return (
    <div className="min-h-screen bg-space-gradient text-white relative overflow-hidden">
      {/* Header */}
      {/* Full-screen hover tint for Sign In / Sign Up */}
      <div
        className={`fixed inset-0 z-30 pointer-events-none transition-opacity duration-300 ${
          globalTint === "signin"
            ? "bg-[var(--earth-cyan)]/35 opacity-100"
            : globalTint === "signup"
            ? "bg-earth-orange/40 opacity-100"
            : "opacity-0"
        }`}
      />

      <header className="absolute top-0 left-0 right-0 z-40 p-4 md:p-6">
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {/* Global menu overlay handles navigation; left space kept clean */}
          </div>
          <nav className="flex items-center gap-4 md:gap-6">
            <Link href="/about">
              <a className="text-white hover:text-earth-cyan transition-colors duration-300 font-medium" data-testid="link-about">
                About
              </a>
            </Link>
            <Link href="/contact">
              <a className="text-white hover:text-earth-cyan transition-colors duration-300 font-medium" data-testid="link-contact">
                Contact
              </a>
            </Link>
            {!role ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/signin">
                  <a
                    onMouseEnter={() => setGlobalTint("signin")}
                    onMouseLeave={() => setGlobalTint(null)}
                    className="px-4 py-2 rounded-lg border border-[var(--earth-border)] bg-[var(--earth-card)] hover:bg-white/5"
                  >
                    Sign In
                  </a>
                </Link>
                <Link href="/signup">
                  <a
                    onMouseEnter={() => setGlobalTint("signup")}
                    onMouseLeave={() => setGlobalTint(null)}
                    className="px-4 py-2 rounded-lg bg-earth-orange hover:bg-earth-orange-hover text-white"
                  >
                    Sign Up
                  </a>
                </Link>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href={role === 'student' ? '/student' : role === 'teacher' ? '/teacher' : '/admin'}>
                  <a className="px-3 py-2 rounded-lg border border-[var(--earth-border)] bg-[var(--earth-card)] hover:bg-white/5">
                    Open {role === 'student' ? 'Student' : role === 'teacher' ? 'Teacher' : 'Admin'} Portal
                  </a>
                </Link>
                <button onClick={clear} className="px-3 py-2 rounded-lg border border-[var(--earth-border)] bg-[var(--earth-card)] hover:bg-white/5">Logout</button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Social Sidebar */}
      <SocialSidebar />

      {/* Main Content */}
      {/* Main Content */}
      <main className="min-h-screen flex items-center justify-between pl-20 md:pl-24 lg:pl-28 pr-4 md:pr-8 lg:pr-12 xl:pr-16 py-20">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Hero Text */}
          <div className="lg:col-span-3 xl:col-span-4 space-y-6 text-center lg:text-left pl-12 lg:pl-0 relative z-30">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                ECO-GENIUS<br />
                <span className="text-earth-cyan">ACADEMY</span>
              </h1>
              <p className="text-earth-muted text-base md:text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
                Master Quests. Unlock Knowledge.<br />
                Become a Planet Hero.
              </p>
            </div>
            <Button 
              onClick={handleWatchVideo}
              className="bg-earth-orange hover:bg-earth-orange-hover px-8 py-4 text-white font-semibold rounded-lg flex items-center space-x-3 relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px] hover:shadow-orange"
              data-testid="button-watch-video"
            >
              <Play className="h-4 w-4" />
              <span>START YOUR JOURNEY</span>
            </Button>
          </div>

          {/* 3D Globe */}
          <div className="lg:col-span-6 xl:col-span-5 flex justify-center order-first lg:order-none relative z-0">
            <div className="globe-container floating lg:-ml-8 xl:-ml-14 2xl:-ml-20 lg:-mt-4 xl:-mt-6 relative z-0">
              <Globe3D />
            </div>
          </div>

          {/* Topic Cards */}
          <div className="lg:col-span-3 xl:col-span-3 w-full max-w-[420px] xl:max-w-[470px] ml-auto lg:mr-2 xl:mr-4 relative z-30">
            <TopicCards />
          </div>
          
        </div>
      </main>
    </div>
  );
}
