import { Link, useLocation } from "wouter";
import { UserRole } from "@shared/schema";
import { cn } from "@/lib/utils";
import {
  Home,
  UserPlus,
  Building,
  Wallet,
  History,
  List,
  ShoppingBag,
  Search,
  CheckSquare,
  Repeat,
  FileCheck,
  Users,
  ShieldCheck,
  PieChart,
  Settings,
  LogOut,
  BarChart3
} from "lucide-react";
import { Separator } from "./separator";
import { useAuth } from "@/hooks/use-auth";

interface NavItem {
  title: string;
  icon: React.ReactNode;
  href: string;
  roles?: UserRole[];
}

const navItems: NavItem[] = [
  // Land Owner Items
  {
    title: "Dashboard",
    icon: <Home className="w-5 h-5" />,
    href: "/dashboard/landowner",
    roles: [UserRole.LANDOWNER]
  },
  {
    title: "Register Land",
    icon: <UserPlus className="w-5 h-5" />,
    href: "/land/register",
    roles: [UserRole.LANDOWNER]
  },
  {
    title: "My Properties",
    icon: <Building className="w-5 h-5" />,
    href: "/dashboard/landowner/properties",
    roles: [UserRole.LANDOWNER]
  },
  {
    title: "List for Sale",
    icon: <List className="w-5 h-5" />,
    href: "/dashboard/landowner/list-sale",
    roles: [UserRole.LANDOWNER]
  },
  {
    title: "Transaction History",
    icon: <History className="w-5 h-5" />,
    href: "/dashboard/landowner/transactions",
    roles: [UserRole.LANDOWNER]
  },
  
  // Buyer Items
  {
    title: "Dashboard",
    icon: <Home className="w-5 h-5" />,
    href: "/dashboard/buyer",
    roles: [UserRole.BUYER]
  },
  {
    title: "Browse Properties",
    icon: <Search className="w-5 h-5" />,
    href: "/dashboard/buyer/browse",
    roles: [UserRole.BUYER]
  },
  {
    title: "My Purchases",
    icon: <ShoppingBag className="w-5 h-5" />,
    href: "/dashboard/buyer/purchases",
    roles: [UserRole.BUYER]
  },
  {
    title: "Transaction History",
    icon: <History className="w-5 h-5" />,
    href: "/dashboard/buyer/transactions",
    roles: [UserRole.BUYER]
  },
  
  // Verifier Items
  {
    title: "Dashboard",
    icon: <Home className="w-5 h-5" />,
    href: "/dashboard/verifier",
    roles: [UserRole.VERIFIER]
  },
  {
    title: "Pending Verifications",
    icon: <CheckSquare className="w-5 h-5" />,
    href: "/dashboard/verifier/pending",
    roles: [UserRole.VERIFIER]
  },
  {
    title: "Transfer Requests",
    icon: <Repeat className="w-5 h-5" />,
    href: "/dashboard/verifier/transfers",
    roles: [UserRole.VERIFIER]
  },
  {
    title: "Verified Properties",
    icon: <FileCheck className="w-5 h-5" />,
    href: "/dashboard/verifier/verified",
    roles: [UserRole.VERIFIER]
  },
  {
    title: "Verification History",
    icon: <History className="w-5 h-5" />,
    href: "/dashboard/verifier/history",
    roles: [UserRole.VERIFIER]
  },
  
  // Admin Items
  {
    title: "Dashboard",
    icon: <Home className="w-5 h-5" />,
    href: "/dashboard/admin",
    roles: [UserRole.ADMIN]
  },
  {
    title: "User Management",
    icon: <Users className="w-5 h-5" />,
    href: "/dashboard/admin/user-management",
    roles: [UserRole.ADMIN]
  },
  {
    title: "Verifier Management",
    icon: <ShieldCheck className="w-5 h-5" />,
    href: "/dashboard/admin/verifier-management",
    roles: [UserRole.ADMIN]
  },
  {
    title: "System Analytics",
    icon: <BarChart3 className="w-5 h-5" />,
    href: "/dashboard/admin/system-analytics",
    roles: [UserRole.ADMIN]
  },
  {
    title: "Settings",
    icon: <Settings className="w-5 h-5" />,
    href: "/dashboard/admin/settings",
    roles: [UserRole.ADMIN]
  },
];

export interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  // Filter items based on user role
  const filteredItems = navItems.filter(
    item => !item.roles || item.roles.includes(user?.role as UserRole)
  );
  
  return (
    <div className={cn("flex flex-col h-full bg-sidebar dark:bg-sidebar text-sidebar-foreground dark:text-sidebar-foreground", className)}>
      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="px-2 space-y-1">
          {filteredItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  location === item.href
                    ? "text-sidebar-primary-foreground bg-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                {item.icon}
                <span className="ml-3">{item.title}</span>
              </a>
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="flex-shrink-0 p-4 border-t border-sidebar-border">
        <button
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="flex items-center w-full px-2 py-2 text-sm font-medium rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="w-5 h-5" />
          <span className="ml-3">Logout</span>
        </button>
      </div>
    </div>
  );
}
