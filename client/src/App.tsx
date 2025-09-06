import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import IntegrationsPage from "@/pages/integrations";
import NotFound from "@/pages/not-found";
import AboutPage from "@/pages/about";
import SignInPage from "@/pages/signin";
import SignUpPage from "@/pages/signup";
import GamesPage from "@/pages/games";
import QuizzesPage from "@/pages/quizzes";
import LeaderboardPage from "@/pages/leaderboard";
import TasksPage from "@/pages/tasks";
import ContactHelpPage from "@/pages/contact";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
  <Route path="/about" component={AboutPage} />
  <Route path="/signin" component={SignInPage} />
  <Route path="/signup" component={SignUpPage} />
  <Route path="/games" component={GamesPage} />
  <Route path="/quizzes" component={QuizzesPage} />
  <Route path="/leaderboard" component={LeaderboardPage} />
  <Route path="/tasks" component={TasksPage} />
  <Route path="/contact" component={ContactHelpPage} />
  <Route path="/integrations" component={IntegrationsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
