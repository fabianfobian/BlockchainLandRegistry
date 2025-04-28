import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import LandownerDashboard from "@/pages/dashboard/landowner";
import BuyerDashboard from "@/pages/dashboard/buyer";
import VerifierDashboard from "@/pages/dashboard/verifier";
import AdminDashboard from "@/pages/dashboard/admin";
import { ProtectedRoute } from "./lib/protected-route";
import LandRegistration from "@/pages/land-registration";
import LandDetails from "@/pages/land-details";
import { ThemeProvider } from "@/components/theme-provider";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      {/* Role-specific dashboard routes */}
      <ProtectedRoute path="/dashboard/landowner" component={LandownerDashboard} />
      <ProtectedRoute path="/dashboard/buyer" component={BuyerDashboard} />
      <ProtectedRoute path="/dashboard/verifier" component={VerifierDashboard} />
      <ProtectedRoute path="/dashboard/admin" component={AdminDashboard} />
      
      {/* Feature routes */}
      <ProtectedRoute path="/land/register" component={LandRegistration} />
      <ProtectedRoute path="/land/:id" component={LandDetails} />
      
      {/* Redirect to appropriate dashboard based on role */}
      <ProtectedRoute path="/" component={() => <div>Redirecting...</div>} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="land-registry-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
