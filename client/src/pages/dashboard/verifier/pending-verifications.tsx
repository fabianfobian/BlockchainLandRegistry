import { useAuth } from "@/hooks/use-auth";
import { UserRole, LandStatus } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, ClipboardCheck, FolderOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VerificationItem from "@/components/verification-item";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function PendingVerifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    data: pendingLands,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/lands/status/pending'],
    onError: (error) => {
      toast({
        title: "Error loading pending verifications",
        description: error instanceof Error ? error.message : "Failed to load pending land verifications",
        variant: "destructive",
      });
    },
  });
  
  const verifyMutation = useMutation({
    mutationFn: async ({ landId, approved, reason, txHash }: { landId: number, approved: boolean, reason?: string, txHash?: string }) => {
      const status = approved ? LandStatus.VERIFIED : LandStatus.REJECTED;
      const res = await apiRequest("PATCH", `/api/lands/${landId}/status`, {
        status,
        reason: reason || (approved ? "Property verified and approved" : "Verification requirements not met"),
        txHash
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Verification complete",
        description: "The land verification has been processed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/lands/status/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/verification-logs/verifier'] });
    },
    onError: (error) => {
      toast({
        title: "Verification failed",
        description: error instanceof Error ? error.message : "Failed to process verification",
        variant: "destructive",
      });
    },
  });
  
  const handleVerify = (landId: number, approved: boolean) => {
    verifyMutation.mutate({ 
      landId, 
      approved,
      txHash: approved ? `0x${Math.random().toString(16).substring(2, 38)}` : undefined
    });
  };
  
  return (
    <DashboardLayout title="Pending Verifications" requireRole={UserRole.VERIFIER}>
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
          <CardTitle>Pending Land Verifications</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading pending verifications...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 dark:text-red-400">Failed to load pending verifications. Please try again later.</p>
            </div>
          ) : !pendingLands?.length ? (
            <div className="text-center py-12">
              <ClipboardCheck className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No pending verifications</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                All land registrations have been reviewed.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingLands?.map((land) => (
                <VerificationItem
                  key={land.id}
                  land={land}
                  onVerify={handleVerify}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}