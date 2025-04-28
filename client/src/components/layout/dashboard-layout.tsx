import { ReactNode } from "react";
import { useLocation, useRoute } from "wouter";
import DashboardHeader from "@/components/ui/dashboard-header";
import Sidebar from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@shared/schema";
import { redirectToDashboard } from "@/lib/redirect-to-dashboard";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  requireRole?: UserRole | UserRole[];
}

export default function DashboardLayout({
  children,
  title,
  requireRole,
}: DashboardLayoutProps) {
  const { user } = useAuth();
  const [_, navigate] = useLocation();

  // Check if user has required role
  if (user && requireRole) {
    const requiredRoles = Array.isArray(requireRole) ? requireRole : [requireRole];
    if (!requiredRoles.includes(user.role as UserRole)) {
      redirectToDashboard(user.role as UserRole, navigate);
      return null;
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar className="w-64 hidden md:block" />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">{title}</h1>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
