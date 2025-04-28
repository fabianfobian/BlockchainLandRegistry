import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const [_, navigate] = useLocation();
  
  // Redirect to the appropriate dashboard based on user role
  useEffect(() => {
    if (!isLoading && user) {
      switch (user.role) {
        case UserRole.LANDOWNER:
          navigate("/dashboard/landowner");
          break;
        case UserRole.BUYER:
          navigate("/dashboard/buyer");
          break;
        case UserRole.VERIFIER:
          navigate("/dashboard/verifier");
          break;
        case UserRole.ADMIN:
          navigate("/dashboard/admin");
          break;
        default:
          navigate("/auth");
      }
    } else if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);
  
  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-700 dark:text-gray-300">Redirecting to your dashboard...</span>
      </div>
    );
  }
  
  return null; // Will redirect, no need to render anything
}
