import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, Eye } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useState, useRef } from "react";

export function AppHamburger() {
  const { role, clear } = useAuth();
  const [profileId, setProfileId] = useState("");
  const [showProfileInput, setShowProfileInput] = useState(false);
  const [, setLocation] = useLocation();
  const sheetCloseRef = useRef<HTMLButtonElement>(null);

  const handleViewProfile = () => {
    console.log("handleViewProfile called with profileId:", profileId);
    if (profileId.trim()) {
      // Check if it's a full URL or just the profile ID
      let extractedProfileId = profileId.trim();
      
      // If it's a full URL, extract the profile ID from it
      if (profileId.includes('/profile/')) {
        const parts = profileId.split('/profile/');
        if (parts.length > 1) {
          extractedProfileId = parts[1];
        }
      }
      
      const targetUrl = `/profile/${extractedProfileId}`;
      console.log("Navigating to:", targetUrl);
      
      // Close the sheet first, then navigate
      setShowProfileInput(false);
      setProfileId("");
      
      // Close the sheet
      if (sheetCloseRef.current) {
        sheetCloseRef.current.click();
      }
      
      // Use setTimeout to ensure the sheet closes first
      setTimeout(() => {
        setLocation(targetUrl);
      }, 200);
    } else {
      console.log("No profile ID provided");
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button aria-label="Open menu" className="w-9 h-9 bg-earth-orange hover:bg-earth-orange-hover rounded-lg flex items-center justify-center shadow-orange transition-colors pointer-events-auto">
          <Menu className="h-5 w-5 text-white" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-[var(--earth-card)] border-[var(--earth-border)] text-white">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        
        {/* Hidden close button for programmatic closing */}
        <SheetClose ref={sheetCloseRef} className="hidden" />
        
        <nav className="mt-4 grid gap-3">
          <SheetClose asChild>
            <Link href="/">
              <Button className="w-full justify-start rounded-2xl bg-white text-[var(--foreground)] hover:bg-white/90">Home</Button>
            </Link>
          </SheetClose>
          {!role && (
            <>
              <SheetClose asChild>
                <Link href="/signin">
                  <Button className="w-full justify-start rounded-2xl bg-white text-[var(--foreground)] hover:bg-white/90">Sign In</Button>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/signup">
                  <Button className="w-full justify-start rounded-2xl bg-white text-[var(--foreground)] hover:bg-white/90">Sign Up</Button>
                </Link>
              </SheetClose>
            </>
          )}
          {role === 'student' && (
            <SheetClose asChild>
              <Link href="/student">
                <Button className="w-full justify-start rounded-2xl bg-white text-[var(--foreground)] hover:bg-white/90">Student App</Button>
              </Link>
            </SheetClose>
          )}
          {role === 'teacher' && (
            <SheetClose asChild>
              <Link href="/teacher">
                <Button className="w-full justify-start rounded-2xl bg-white text-[var(--foreground)] hover:bg-white/90">Teacher App</Button>
              </Link>
            </SheetClose>
          )}
          {role === 'admin' && (
            <SheetClose asChild>
              <Link href="/admin">
                <Button className="w-full justify-start rounded-2xl bg-white text-[var(--foreground)] hover:bg-white/90">Admin Portal</Button>
              </Link>
            </SheetClose>
          )}
          <SheetClose asChild>
            <Link href="/games">
              <Button className="w-full justify-start rounded-2xl bg-white text-[var(--foreground)] hover:bg-white/90">Games</Button>
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link href="/quizzes">
              <Button className="w-full justify-start rounded-2xl bg-white text-[var(--foreground)] hover:bg-white/90">Quizzes</Button>
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link href="/videos">
              <Button className="w-full justify-start rounded-2xl bg-white text-[var(--foreground)] hover:bg-white/90">Videos</Button>
            </Link>
          </SheetClose>
          {role === 'teacher' ? (
            <>
              <SheetClose asChild>
                <Link href="/teacher?tab=Assignments">
                  <Button className="w-full justify-start rounded-2xl bg-white text-[var(--foreground)] hover:bg-white/90">Assignments</Button>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/teacher?tab=Announcements">
                  <Button className="w-full justify-start rounded-2xl bg-white text-[var(--foreground)] hover:bg-white/90">Announcements</Button>
                </Link>
              </SheetClose>
            </>
          ) : (
            <>
              <SheetClose asChild>
                <Link href="/assignments">
                  <Button className="w-full justify-start rounded-2xl bg-white text-[var(--foreground)] hover:bg-white/90">Assignments</Button>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/announcements">
                  <Button className="w-full justify-start rounded-2xl bg-white text-[var(--foreground)] hover:bg-white/90">Announcements</Button>
                </Link>
              </SheetClose>
            </>
          )}
          <SheetClose asChild>
            <Link href="/leaderboard">
              <Button className="w-full justify-start rounded-2xl bg-white text-[var(--foreground)] hover:bg-white/90">Leaderboard</Button>
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link href="/tasks">
              <Button className="w-full justify-start rounded-2xl bg-white text-[var(--foreground)] hover:bg-white/90">Tasks</Button>
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link href="/contact">
              <Button className="w-full justify-start rounded-2xl bg-white text-[var(--foreground)] hover:bg-white/90">Contact & Help</Button>
            </Link>
          </SheetClose>
          
          {/* View Public Profile Option */}
          <div className="border-t border-[var(--earth-border)] pt-3 mt-3">
            <div className="space-y-2">
              <Button
                onClick={() => setShowProfileInput(!showProfileInput)}
                className="w-full justify-start rounded-2xl bg-blue-500 text-white hover:bg-blue-600"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Public Profile
              </Button>
              
              {showProfileInput && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Paste profile link or ID here"
                    value={profileId}
                    onChange={(e) => setProfileId(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/60 text-sm"
                  />
                  <Button
                    onClick={handleViewProfile}
                    className="w-full text-sm rounded-2xl bg-green-500 text-white hover:bg-green-600"
                    disabled={!profileId.trim()}
                  >
                    View Profile
                  </Button>
                  <p className="text-white/60 text-xs">
                    Paste the full shareable link or just the profile ID
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {!!role && (
            <SheetClose asChild>
              <button
                onClick={() => clear()}
                className="w-full justify-start rounded-2xl bg-transparent text-white border border-[var(--earth-border)] px-4 py-2 text-left"
              >
                Sign Out
              </button>
            </SheetClose>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
