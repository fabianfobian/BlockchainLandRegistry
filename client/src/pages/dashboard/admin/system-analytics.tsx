import { useAuth } from "@/hooks/use-auth";
import { UserRole, LandStatus } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/dashboard-layout";
import StatsCard from "@/components/stats-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, BarChart3, Users, Clock, CheckCircle, XCircle, Home, AreaChart, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";

export default function SystemAnalytics() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    data: stats,
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/system/stats'],
    onError: (error) => {
      toast({
        title: "Error loading stats",
        description: error instanceof Error ? error.message : "Failed to load system analytics",
        variant: "destructive",
      });
    },
  });
  
  // Mock data for charts since we don't have time-series data yet
  const usersByRole = [
    { name: "Land Owners", value: stats?.usersByRole?.landowner || 0, color: "#4ade80" },
    { name: "Buyers", value: stats?.usersByRole?.buyer || 0, color: "#f59e0b" },
    { name: "Verifiers", value: stats?.usersByRole?.verifier || 0, color: "#3b82f6" },
    { name: "Admins", value: stats?.usersByRole?.admin || 0, color: "#8b5cf6" },
  ];
  
  const propertiesByType = [
    { name: "Residential", value: stats?.landsByType?.residential || 0, color: "#60a5fa" },
    { name: "Commercial", value: stats?.landsByType?.commercial || 0, color: "#34d399" },
    { name: "Agricultural", value: stats?.landsByType?.agricultural || 0, color: "#fbbf24" },
    { name: "Industrial", value: stats?.landsByType?.industrial || 0, color: "#f472b6" },
  ];
  
  const propertiesByStatus = [
    { name: "Pending", value: stats?.landsByStatus?.pending || 0, color: "#f59e0b" },
    { name: "Verified", value: stats?.landsByStatus?.verified || 0, color: "#4ade80" },
    { name: "Rejected", value: stats?.landsByStatus?.rejected || 0, color: "#f43f5e" },
    { name: "Transfer Pending", value: stats?.landsByStatus?.transfer_pending || 0, color: "#a855f7" },
  ];
  
  const transactionData = [
    { name: "Jan", transactions: 5, value: 12.5 },
    { name: "Feb", transactions: 8, value: 19.2 },
    { name: "Mar", transactions: 12, value: 27.8 },
    { name: "Apr", transactions: 15, value: 35.4 },
    { name: "May", transactions: 10, value: 23.1 },
    { name: "Jun", transactions: 18, value: 42.6 },
  ];
  
  return (
    <DashboardLayout title="System Analytics" requireRole={UserRole.ADMIN}>
      <div className="mb-6 flex items-center justify-between">
        <Link href="/dashboard/admin">
          <Button variant="ghost" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
        </Link>
        
        <Button variant="outline">
          <BarChart3 className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>
      
      {/* Main Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="Total Users"
          value={stats?.users || 0}
          icon={Users}
          color="primary"
        />
        <StatsCard
          title="Registered Properties"
          value={stats?.lands || 0}
          icon={Home}
          color="info"
        />
        <StatsCard
          title="Pending Verifications"
          value={stats?.pendingVerifications || 0}
          icon={Clock}
          color="warning"
        />
        <StatsCard
          title="Transactions"
          value={stats?.transactions || 0}
          icon={Activity}
          color="success"
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
            <CardDescription>
              Distribution of users across different roles in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : error ? (
              <div className="h-80 flex items-center justify-center">
                <p className="text-red-500 dark:text-red-400">Failed to load data</p>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={usersByRole}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {usersByRole.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} users`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Properties by Type</CardTitle>
            <CardDescription>
              Distribution of registered land properties by type
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : error ? (
              <div className="h-80 flex items-center justify-center">
                <p className="text-red-500 dark:text-red-400">Failed to load data</p>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={propertiesByType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} properties`, 'Count']} />
                    <Legend />
                    <Bar dataKey="value" name="Properties" fill="#8884d8">
                      {propertiesByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Properties by Status</CardTitle>
            <CardDescription>
              Current status of registered land properties
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : error ? (
              <div className="h-80 flex items-center justify-center">
                <p className="text-red-500 dark:text-red-400">Failed to load data</p>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={propertiesByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {propertiesByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} properties`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Transaction Activity</CardTitle>
            <CardDescription>
              Property transactions over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : error ? (
              <div className="h-80 flex items-center justify-center">
                <p className="text-red-500 dark:text-red-400">Failed to load data</p>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={transactionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="transactions" name="Transactions" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line yAxisId="right" type="monotone" dataKey="value" name="Value (ETH)" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}