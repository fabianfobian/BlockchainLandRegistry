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

// Landowner pages
import LandownerProperties from "@/pages/dashboard/landowner/properties";
import ListForSale from "@/pages/dashboard/landowner/list-sale";

// Buyer pages
import BrowseProperties from "@/pages/dashboard/buyer/browse";
import MyPurchases from "@/pages/dashboard/buyer/purchases";

// Verifier pages
import PendingVerifications from "@/pages/dashboard/verifier/pending-verifications";
import TransferRequests from "@/pages/dashboard/verifier/transfer-requests";
import VerifiedProperties from "@/pages/dashboard/verifier/verified-properties";
import VerificationHistory from "@/pages/dashboard/verifier/verification-history";

// Admin pages
import UserManagement from "@/pages/dashboard/admin/user-management";
import VerifierManagement from "@/pages/dashboard/admin/verifier-management";
import SystemAnalytics from "@/pages/dashboard/admin/system-analytics";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      {/* Role-specific dashboard routes */}
      <ProtectedRoute path="/dashboard/landowner" component={LandownerDashboard} />
      <ProtectedRoute path="/dashboard/buyer" component={BuyerDashboard} />
      <ProtectedRoute path="/dashboard/verifier" component={VerifierDashboard} />
      <ProtectedRoute path="/dashboard/admin" component={AdminDashboard} />
      
      {/* Landowner sub-routes */}
      <ProtectedRoute path="/dashboard/landowner/properties" component={LandownerProperties} />
      <ProtectedRoute path="/dashboard/landowner/list-sale" component={ListForSale} />
      
      {/* Buyer sub-routes */}
      <ProtectedRoute path="/dashboard/buyer/browse" component={BrowseProperties} />
      <ProtectedRoute path="/dashboard/buyer/purchases" component={MyPurchases} />
      
      {/* Verifier sub-routes */}
      <ProtectedRoute path="/dashboard/verifier/pending-verifications" component={PendingVerifications} />
      <ProtectedRoute path="/dashboard/verifier/transfer-requests" component={TransferRequests} />
      <ProtectedRoute path="/dashboard/verifier/verified-properties" component={VerifiedProperties} />
      <ProtectedRoute path="/dashboard/verifier/verification-history" component={VerificationHistory} />
      
      {/* Admin sub-routes */}
      <ProtectedRoute path="/dashboard/admin/user-management" component={UserManagement} />
      <ProtectedRoute path="/dashboard/admin/verifier-management" component={VerifierManagement} />
      <ProtectedRoute path="/dashboard/admin/system-analytics" component={SystemAnalytics} />
      
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
