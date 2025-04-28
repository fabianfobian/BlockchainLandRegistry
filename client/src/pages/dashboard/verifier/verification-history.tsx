import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, HistoryIcon, ClipboardCheck, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function VerificationHistory() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    data: logs,
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/verification-logs/verifier'],
    onError: (error) => {
      toast({
        title: "Error loading verification history",
        description: error instanceof Error ? error.message : "Failed to load your verification history",
        variant: "destructive",
      });
    },
  });
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const getActionBadge = (action: string) => {
    switch (action) {
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case 'approved-transfer':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Transfer Approved
          </Badge>
        );
      case 'rejected-transfer':
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800">
            <XCircle className="w-3 h-3 mr-1" />
            Transfer Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {action}
          </Badge>
        );
    }
  };
  
  return (
    <DashboardLayout title="Verification History" requireRole={UserRole.VERIFIER}>
      <div className="mb-6 flex items-center">
        <Link href="/dashboard/verifier">
          <Button variant="ghost" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader className="border-b border-gray-200 dark:border-gray-800">
          <CardTitle>Your Verification Activities</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading verification history...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 dark:text-red-400">Failed to load verification history. Please try again later.</p>
            </div>
          ) : !logs?.length ? (
            <div className="text-center py-12">
              <HistoryIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No verification history</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                You haven't verified any properties yet.
              </p>
              <div className="mt-6">
                <Link href="/dashboard/verifier/pending-verifications">
                  <Button>
                    <ClipboardCheck className="w-4 h-4 mr-2" />
                    Start Verifying
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Land ID</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Transaction Hash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs?.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{formatDate(log.createdAt)}</TableCell>
                      <TableCell>
                        <Link href={`/land/${log.landId}`}>
                          <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                            {log.landId}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell className="max-w-xs truncate">{log.reason || "-"}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.txHash ? (
                          <span className="truncate max-w-[140px] inline-block">{log.txHash}</span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}