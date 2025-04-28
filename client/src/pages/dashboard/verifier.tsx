import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { UserRole, LandStatus, Land } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/dashboard-layout";
import StatsCard from "@/components/stats-card";
import VerificationItem from "@/components/verification-item";
import TransactionItem from "@/components/transaction-item";
import { 
  CheckCheck, 
  ArrowRightLeft, 
  CheckCircle, 
  XCircle,
  Clock,
  History
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function VerifierDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("registrations");
  const [verifiedThisMonth, setVerifiedThisMonth] = useState(0);
  const [rejectedThisMonth, setRejectedThisMonth] = useState(0);
  
  // Fetch pending land registrations
  const {
    data: pendingLands,
    isLoading: isLoadingLands,
    error: landsError,
    refetch: refetchPendingLands
  } = useQuery<Land[]>({
    queryKey: [`/api/lands/status/${LandStatus.PENDING}`],
    onError: (error) => {
      toast({
        title: "Error loading pending registrations",
        description: error instanceof Error ? error.message : "Failed to load pending registrations",
        variant: "destructive",
      });
    },
  });
  
  // Fetch pending transfer requests
  const {
    data: pendingTransfers,
    isLoading: isLoadingTransfers,
    error: transfersError,
    refetch: refetchPendingTransfers
  } = useQuery({
    queryKey: ['/api/transactions/pending'],
    onError: (error) => {
      toast({
        title: "Error loading transfer requests",
        description: error instanceof Error ? error.message : "Failed to load pending transfers",
        variant: "destructive",
      });
    },
  });
  
  // Fetch verification logs
  const {
    data: verificationLogs,
    isLoading: isLoadingLogs,
    error: logsError
  } = useQuery({
    queryKey: ['/api/verification-logs/verifier'],
    onError: (error) => {
      toast({
        title: "Error loading verification logs",
        description: error instanceof Error ? error.message : "Failed to load verification history",
        variant: "destructive",
      });
    },
  });
  
  // Calculate verified and rejected this month
  useEffect(() => {
    if (verificationLogs) {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      const thisMonthLogs = verificationLogs.filter(log => 
        new Date(log.createdAt) >= firstDayOfMonth
      );
      
      const approved = thisMonthLogs.filter(log => 
        log.action === 'approved' || log.action === 'approved-transfer'
      ).length;
      
      const rejected = thisMonthLogs.filter(log => 
        log.action === 'rejected' || log.action === 'rejected-transfer'
      ).length;
      
      setVerifiedThisMonth(approved);
      setRejectedThisMonth(rejected);
    }
  }, [verificationLogs]);
  
  // Handler for verification
  const handleVerification = (landId: number, approved: boolean) => {
    refetchPendingLands();
  };
  
  // Handler for transfer verification
  const handleTransferVerification = (transactionId: number, approved: boolean) => {
    refetchPendingTransfers();
  };
  
  return (
    <DashboardLayout title="Verifier Dashboard" requireRole={UserRole.VERIFIER}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="Pending Registrations"
          value={pendingLands?.length || 0}
          icon={CheckCheck}
          color="warning"
        />
        <StatsCard
          title="Transfer Requests"
          value={pendingTransfers?.length || 0}
          icon={ArrowRightLeft}
          color="info"
        />
        <StatsCard
          title="Verified This Month"
          value={verifiedThisMonth}
          icon={CheckCircle}
          color="success"
        />
        <StatsCard
          title="Rejected This Month"
          value={rejectedThisMonth}
          icon={XCircle}
          color="error"
        />
      </div>
      
      {/* Tabs for Pending Verifications */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="registrations">
            Land Registrations
            {pendingLands && pendingLands.length > 0 && (
              <span className="ml-2 text-xs bg-primary text-white rounded-full px-2 py-0.5">
                {pendingLands.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="transfers">
            Transfer Requests
            {pendingTransfers && pendingTransfers.length > 0 && (
              <span className="ml-2 text-xs bg-primary text-white rounded-full px-2 py-0.5">
                {pendingTransfers.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        {/* Land Registrations Tab */}
        <TabsContent value="registrations">
          <Card>
            <CardHeader>
              <CardTitle>Pending Land Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingLands ? (
                <div className="text-center py-12">
                  <Clock className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500 animate-pulse" />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading pending registrations...</p>
                </div>
              ) : landsError ? (
                <div className="text-center py-12">
                  <p className="text-red-500 dark:text-red-400">Failed to load pending registrations.</p>
                </div>
              ) : pendingLands?.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="mx-auto h-10 w-10 text-green-500 dark:text-green-400" />
                  <p className="mt-2 text-sm text-gray-900 dark:text-gray-100 font-medium">All caught up!</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">There are no pending land registrations to verify.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingLands?.map((land) => (
                    <VerificationItem 
                      key={land.id} 
                      land={land}
                      onVerify={handleVerification}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Transfer Requests Tab */}
        <TabsContent value="transfers">
          <Card>
            <CardHeader>
              <CardTitle>Pending Transfer Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingTransfers ? (
                <div className="text-center py-12">
                  <Clock className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500 animate-pulse" />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading transfer requests...</p>
                </div>
              ) : transfersError ? (
                <div className="text-center py-12">
                  <p className="text-red-500 dark:text-red-400">Failed to load transfer requests.</p>
                </div>
              ) : pendingTransfers?.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="mx-auto h-10 w-10 text-green-500 dark:text-green-400" />
                  <p className="mt-2 text-sm text-gray-900 dark:text-gray-100 font-medium">All caught up!</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">There are no pending transfer requests to verify.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingTransfers?.map((transaction) => (
                    <TransactionItem 
                      key={transaction.id} 
                      transaction={transaction}
                      onVerify={handleTransferVerification}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Verification History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Verification Activity</CardTitle>
          <Link href="/dashboard/verifier/history">
            <Button variant="outline" size="sm">
              <History className="w-4 h-4 mr-2" />
              View Full History
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoadingLogs ? (
            <div className="text-center py-6">
              <Clock className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 animate-pulse" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading verification history...</p>
            </div>
          ) : logsError ? (
            <div className="text-center py-6">
              <p className="text-red-500 dark:text-red-400">Failed to load verification history.</p>
            </div>
          ) : verificationLogs?.length === 0 ? (
            <div className="text-center py-6">
              <History className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No verification history yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {verificationLogs?.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center p-3 border rounded-md bg-white dark:bg-gray-800">
                  <div className={`p-2 rounded-full ${log.action.includes('approved') ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'}`}>
                    {log.action.includes('approved') ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">
                      {log.action.includes('approved') ? 'Approved' : 'Rejected'} 
                      {log.action.includes('transfer') ? ' Transfer' : ' Registration'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Land ID: {log.landId} • {new Date(log.createdAt).toLocaleString()}
                    </p>
                    {log.reason && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Reason: {log.reason}
                      </p>
                    )}
                  </div>
                  {log.txHash && (
                    <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                      <code className="mono truncate-address">{log.txHash}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
