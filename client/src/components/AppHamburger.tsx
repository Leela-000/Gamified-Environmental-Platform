import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";

export function AppHamburger() {
  const { role, clear } = useAuth();
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
