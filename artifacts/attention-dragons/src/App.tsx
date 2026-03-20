import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/theme-context";
import { AnimatedBackground } from "@/components/animated-background";
import { ThemeStyles } from "@/components/theme-styles";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CharacterHub from "@/pages/character-hub";
import DmDashboard from "@/pages/dm-dashboard";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/character/:characterId" component={CharacterHub} />
      <Route path="/dm" component={DmDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <ThemeStyles />
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AnimatedBackground />
            <div className="relative z-10">
              <Router />
            </div>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
