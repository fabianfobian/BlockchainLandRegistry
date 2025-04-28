import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TransactionItem from "@/components/transaction-item";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function TransferRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    data: pendingTransactions,
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/transactions/pending'],
    onError: (error) => {
      toast({
        title: "Error loading transfer requests",
        description: error instanceof Error ? error.message : "Failed to load pending transfer requests",
        variant: "destructive",
      });
    },
  });
  
  const verifyTransactionMutation = useMutation({
    mutationFn: async ({ transactionId, approved, reason }: { transactionId: number, approved: boolean, reason?: string }) => {
      const status = approved ? "completed" : "rejected";
      const txHash = approved ? `0x${Math.random().toString(16).substring(2, 38)}` : undefined;
      
      const res = await apiRequest("PATCH", `/api/transactions/${transactionId}`, {
        status,
        reason: reason || (approved ? "Transfer approved" : "Transfer requirements not met"),
        txHash
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Transfer request processed",
        description: "The transfer request has been processed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/verification-logs/verifier'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to process transfer",
        description: error instanceof Error ? error.message : "An error occurred while processing the transfer request",
        variant: "destructive",
      });
    },
  });
  
  const handleVerify = (transactionId: number, approved: boolean) => {
    verifyTransactionMutation.mutate({ transactionId, approved });
  };
  
  return (
    <DashboardLayout title="Transfer Requests" requireRole={UserRole.VERIFIER}>
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
          <CardTitle>Pending Transfer Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading transfer requests...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 dark:text-red-400">Failed to load transfer requests. Please try again later.</p>
            </div>
          ) : !pendingTransactions?.length ? (
            <div className="text-center py-12">
              <RefreshCw className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No pending transfers</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                All property transfer requests have been processed.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingTransactions?.map((transaction) => (
                <div key={transaction.id} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                  <TransactionItem 
                    transaction={transaction}
                  />
                  
                  <div className="mt-4 flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-800 pt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30"
                      onClick={() => handleVerify(transaction.id, false)}
                      disabled={verifyTransactionMutation.isPending}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject Transfer
                    </Button>
                    
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleVerify(transaction.id, true)}
                      disabled={verifyTransactionMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve Transfer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}