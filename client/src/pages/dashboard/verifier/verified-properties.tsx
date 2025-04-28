import { useAuth } from "@/hooks/use-auth";
import { UserRole, LandStatus } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/dashboard-layout";
import PropertyCard from "@/components/property-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, CheckCheck, PackagePlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifiedProperties() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    data: verifiedLands,
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/lands/status/verified'],
    onError: (error) => {
      toast({
        title: "Error loading verified properties",
        description: error instanceof Error ? error.message : "Failed to load verified properties",
        variant: "destructive",
      });
    },
  });
  
  return (
    <DashboardLayout title="Verified Properties" requireRole={UserRole.VERIFIER}>
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
          <CardTitle>Verified Land Properties</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading verified properties...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 dark:text-red-400">Failed to load verified properties. Please try again later.</p>
            </div>
          ) : !verifiedLands?.length ? (
            <div className="text-center py-12">
              <CheckCheck className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No verified properties</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                No properties have been verified yet.
              </p>
              <div className="mt-6">
                <Link href="/dashboard/verifier/pending-verifications">
                  <Button>
                    Check Pending Verifications
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {verifiedLands?.map((land) => (
                <PropertyCard 
                  key={land.id} 
                  property={land}
                  showStatus
                  showOwner
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}