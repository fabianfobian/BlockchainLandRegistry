import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/dashboard-layout";
import StatsCard from "@/components/stats-card";
import { 
  Users, 
  ShieldCheck,
  Building,
  ArrowRightLeft,
  RefreshCcw,
  UserPlus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateVerifierOpen, setIsCreateVerifierOpen] = useState(false);
  const [isCreatingVerifier, setIsCreatingVerifier] = useState(false);
  
  // Form state for creating a new verifier
  const [verifierData, setVerifierData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: ""
  });
  
  // Fetch system stats
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['/api/system/stats'],
    onError: (error) => {
      toast({
        title: "Error loading system stats",
        description: error instanceof Error ? error.message : "Failed to load system statistics",
        variant: "destructive",
      });
    },
  });
  
  // Handle creating a new verifier
  const handleCreateVerifier = async () => {
    if (!verifierData.username || !verifierData.email || !verifierData.password || !verifierData.fullName) {
      toast({
        title: "Validation Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreatingVerifier(true);
    
    try {
      await apiRequest("POST", "/api/admin/create-verifier", verifierData);
      
      toast({
        title: "Verifier Created",
        description: "The verifier account has been successfully created",
      });
      
      // Reset form and close dialog
      setVerifierData({
        username: "",
        email: "",
        password: "",
        fullName: ""
      });
      setIsCreateVerifierOpen(false);
      
      // Refetch stats
      refetchStats();
    } catch (error) {
      toast({
        title: "Failed to create verifier",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCreatingVerifier(false);
    }
  };
  
  return (
    <DashboardLayout title="Admin Dashboard" requireRole={UserRole.ADMIN}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="Total Users"
          value={stats?.userCount || "-"}
          icon={Users}
          color="primary"
        />
        <StatsCard
          title="Verifiers"
          value={stats?.verifierCount || "-"}
          icon={ShieldCheck}
          color="info"
        />
        <StatsCard
          title="Registered Properties"
          value={stats?.landCount || "-"}
          icon={Building}
          color="success"
        />
        <StatsCard
          title="Transfers This Month"
          value={stats?.transactionCount || "-"}
          icon={ArrowRightLeft}
          color="warning"
        />
      </div>
      
      {/* System Health */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>System Health</CardTitle>
            <Button variant="outline" size="sm" className="h-8" onClick={() => {}}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <dl>
            <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-800">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Blockchain Status</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2 flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                Connected (Block #13247852)
              </dd>
            </div>
            <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50 dark:bg-gray-800">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Database Status</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2 flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                Operational (5ms response time)
              </dd>
            </div>
            <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-800">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">IPFS Storage</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2 flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                Connected (28.4 GB used)
              </dd>
            </div>
            <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50 dark:bg-gray-800">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Smart Contracts</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2 flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                All contracts operational (v2.3.1)
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
      
      {/* Land Registration Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Land Registration Status</CardTitle>
            <CardDescription>
              Current status of land registrations in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="text-center py-6">
                <svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Verified Lands */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Verified Properties</p>
                    <p className="text-sm text-muted-foreground">Successfully verified land registrations</p>
                  </div>
                  <div className="font-bold text-xl">
                    {stats?.verifiedLands || 0}
                  </div>
                </div>
                <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full" 
                    style={{ width: `${stats ? (stats.verifiedLands / stats.landCount) * 100 : 0}%` }}
                  ></div>
                </div>
                
                {/* Pending Registrations */}
                <div className="flex items-center justify-between mt-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Pending Registrations</p>
                    <p className="text-sm text-muted-foreground">Awaiting government verification</p>
                  </div>
                  <div className="font-bold text-xl">
                    {stats?.pendingRegistrations || 0}
                  </div>
                </div>
                <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 rounded-full" 
                    style={{ width: `${stats ? (stats.pendingRegistrations / stats.landCount) * 100 : 0}%` }}
                  ></div>
                </div>
                
                {/* Pending Transfers */}
                <div className="flex items-center justify-between mt-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Pending Transfers</p>
                    <p className="text-sm text-muted-foreground">Ownership transfers awaiting approval</p>
                  </div>
                  <div className="font-bold text-xl">
                    {stats?.pendingTransfers || 0}
                  </div>
                </div>
                <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${stats ? (stats.pendingTransfers / stats.landCount) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Verifier Management</CardTitle>
                <CardDescription>
                  Government officials who verify land registrations
                </CardDescription>
              </div>
              <Dialog open={isCreateVerifierOpen} onOpenChange={setIsCreateVerifierOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Verifier
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Verifier</DialogTitle>
                    <DialogDescription>
                      Add a new government official with verification powers.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        className="col-span-3"
                        value={verifierData.fullName}
                        onChange={(e) => setVerifierData({...verifierData, fullName: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="username" className="text-right">
                        Username
                      </Label>
                      <Input
                        id="username"
                        className="col-span-3"
                        value={verifierData.username}
                        onChange={(e) => setVerifierData({...verifierData, username: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        className="col-span-3"
                        value={verifierData.email}
                        onChange={(e) => setVerifierData({...verifierData, email: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="password" className="text-right">
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        className="col-span-3"
                        value={verifierData.password}
                        onChange={(e) => setVerifierData({...verifierData, password: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreateVerifierOpen(false)}
                      disabled={isCreatingVerifier}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateVerifier}
                      disabled={isCreatingVerifier}
                    >
                      {isCreatingVerifier ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating...
                        </>
                      ) : "Create Verifier"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Government Verifier</TableCell>
                    <TableCell>verifier</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Active
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                  {/* More rows would be here with real data */}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent System Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent System Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Activity Item 1 */}
            <div className="flex items-center justify-between p-3 border rounded-md bg-white dark:bg-gray-800">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-2 text-green-600 dark:bg-green-900 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Land Registration Approved</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Property #1024 verified by Verifier</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Transaction Hash: <span className="mono">0x71C7656EC7...</span></p>
                </div>
              </div>
              <div className="ml-2 flex-shrink-0 flex">
                <p className="text-xs text-gray-500 dark:text-gray-400">3 mins ago</p>
              </div>
            </div>
            
            {/* Activity Item 2 */}
            <div className="flex items-center justify-between p-3 border rounded-md bg-white dark:bg-gray-800">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-2 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">New Verifier Added</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">New verifier was assigned by Admin</p>
                </div>
              </div>
              <div className="ml-2 flex-shrink-0 flex">
                <p className="text-xs text-gray-500 dark:text-gray-400">1 hour ago</p>
              </div>
            </div>
            
            {/* Activity Item 3 */}
            <div className="flex items-center justify-between p-3 border rounded-md bg-white dark:bg-gray-800">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-yellow-100 rounded-md p-2 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400">
                  <RefreshCcw className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">System Maintenance</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Smart contracts updated to version 2.3.1</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Transaction Hash: <span className="mono">0x4F92651AB...</span></p>
                </div>
              </div>
              <div className="ml-2 flex-shrink-0 flex">
                <p className="text-xs text-gray-500 dark:text-gray-400">Yesterday</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

function CheckCircle(props: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={props.className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
