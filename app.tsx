import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import MessagesPage from "./pages/MessagesPage";
import IdentityPage from "./pages/IdentityPage";
import ContactsPage from "./pages/ContactsPage";
import ArchitecturePage from "./pages/ArchitecturePage";
import AppShell from "./components/AppShell";

function Router() {
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/messages" component={MessagesPage} />
        <Route path="/identity" component={IdentityPage} />
        <Route path="/contacts" component={ContactsPage} />
        <Route path="/architecture" component={ArchitecturePage} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster 
            theme="dark"
            toastOptions={{
              style: {
                background: 'rgba(10, 22, 40, 0.95)',
                border: '1px solid rgba(34, 211, 238, 0.2)',
                color: '#e2e8f0',
                fontFamily: "'DM Sans', sans-serif",
              }
            }}
          />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;