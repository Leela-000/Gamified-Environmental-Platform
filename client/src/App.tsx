import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import Home from "@/pages/home";
import IntegrationsPage from "@/pages/integrations";
import NotFound from "@/pages/not-found";
import AboutPage from "@/pages/about";
import SignInPage from "@/pages/signin";
import SignUpPage from "@/pages/signup";
import GamesPage from "@/pages/games";
import GamePlayPage from "./pages/game-play";
import QuizzesPage from "@/pages/quizzes";
import LeaderboardPage from "@/pages/leaderboard";
import TasksPage from "@/pages/tasks";
import AssignmentsPage from "@/pages/assignments";
import AnnouncementsPage from "@/pages/announcements";
import ContactHelpPage from "@/pages/contact";
import AdminPortal from "@/pages/admin";
import StudentSignupWizard from "@/pages/student-signup";
import TeacherSignupWizard from "@/pages/teacher-signup";
import StudentAppShell from "@/pages/student";
import TeacherAppShell from "@/pages/teacher";
import { AppHamburger } from "@/components/AppHamburger";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={AboutPage} />
      <Route path="/signin" component={SignInPage} />
      <Route path="/signup" component={SignUpPage} />
      <Route path="/admin" component={AdminPortal} />
      <Route path="/student/signup" component={StudentSignupWizard} />
      <Route path="/teacher/signup" component={TeacherSignupWizard} />
      <Route path="/student" component={StudentAppShell} />
      <Route path="/teacher" component={TeacherAppShell} />
  <Route path="/games/play/:id" component={GamePlayPage} />
  <Route path="/games" component={GamesPage} />
      <Route path="/quizzes" component={QuizzesPage} />
      <Route path="/leaderboard" component={LeaderboardPage} />
      <Route path="/tasks" component={TasksPage} />
  <Route path="/assignments" component={AssignmentsPage} />
  <Route path="/announcements" component={AnnouncementsPage} />
      <Route path="/contact" component={ContactHelpPage} />
      <Route path="/integrations" component={IntegrationsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          {/* Global menu overlay available on all routes */}
          <div className="fixed top-4 left-4 z-[60] pointer-events-none">
            <AppHamburger />
          </div>
          {/* Safe area to prevent content underlapping the hamburger on small screens */}
          <div className="pl-16 md:pl-6">
            <Router />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
