import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { UserRole, LandStatus } from "@shared/schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/dashboard-layout";
import StatsCard from "@/components/stats-card";
import PropertyCard from "@/components/property-card";
import TransactionHistory from "@/components/transaction-history";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { FolderDot, UserRound, CheckCheck, Link as LinkIcon, PackagePlus, BadgeDollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandownerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
    data: lands,
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/lands/my'],
    onError: (error) => {
      toast({
        title: "Error loading properties",
        description: error instanceof Error ? error.message : "Failed to load your properties",
        variant: "destructive",
      });
    },
  });
  
  // Stats calculations
  const totalProperties = lands?.length || 0;
  const verifiedProperties = lands?.filter(land => land.status === LandStatus.VERIFIED).length || 0;
  const pendingProperties = lands?.filter(land => land.status === LandStatus.PENDING).length || 0;
  
  return (
    <DashboardLayout title="Land Owner Dashboard" requireRole={UserRole.LANDOWNER}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="Total Properties"
          value={totalProperties}
          icon={FolderDot}
          color="primary"
        />
        <StatsCard
          title="Verified Properties"
          value={verifiedProperties}
          icon={UserRound}
          color="success"
        />
        <StatsCard
          title="Pending Approval"
          value={pendingProperties}
          icon={CheckCheck}
          color="warning"
        />
        <StatsCard
          title="Transactions"
          value="--"
          icon={LinkIcon}
          color="info"
        />
      </div>
      
      {/* Recent Land Properties */}
      <Card className="mb-6">
        <CardHeader className="px-4 py-5 sm:px-6 flex justify-between flex-wrap items-center">
          <CardTitle>My Properties</CardTitle>
          <Link href="/land/register">
            <Button>
              <PackagePlus className="w-4 h-4 mr-2" />
              Register New Land
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="border-t border-gray-200 dark:border-gray-800">
          {isLoading ? (
            <div className="text-center py-12">
              <svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading your properties...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 dark:text-red-400">Failed to load your properties. Please try again later.</p>
            </div>
          ) : lands?.length === 0 ? (
            <div className="text-center py-12">
              <FolderDot className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No properties yet</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by registering your first land property.
              </p>
              <div className="mt-6">
                <Link href="/land/register">
                  <Button>
                    <PackagePlus className="w-4 h-4 mr-2" />
                    Register Land
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {lands?.slice(0, 3).map((land) => (
                <PropertyCard 
                  key={land.id} 
                  property={land}
                  actionButton={
                    land.status === LandStatus.VERIFIED ? (
                      land.isForSale ? (
                        <button 
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                          onClick={async () => {
                            try {
                              await fetch(`/api/lands/${land.id}/sale`, {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ isForSale: false }),
                              });
                              queryClient.setQueryData(['/api/lands/my'], (oldData) => {
                                return oldData.map((item) =>
                                  item.id === land.id ? { ...item, isForSale: false } : item
                                );
                              });
                              toast({
                                title: "Property removed from sale",
                                description: "The property is no longer listed for sale.",
                              });
                            } catch (error) {
                              toast({
                                title: "Failed to update property",
                                description: error instanceof Error ? error.message : "An error occurred.",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          Remove from Sale
                        </button>
                      ) : (
                        <button 
                          className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded"
                          onClick={() => {
                            window.location.href = `/dashboard/landowner/list-sale?id=${land.id}`;
                          }}
                        >
                          List for Sale
                        </button>
                      )
                    ) : undefined
                  }
                />
              ))}
              
              {lands && lands.length > 3 && (
                <div className="text-center pt-4">
                  <Link href="/dashboard/landowner/properties">
                    <Button variant="outline">View All Properties</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Quick Links */}
      <div className="flex flex-col sm:flex-row sm:gap-4 mb-6">
        <Card className="flex-1 mb-4 sm:mb-0">
          <CardHeader className="p-4 border-b border-gray-200 dark:border-gray-800">
            <CardTitle className="text-md">Register New Land</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Start the process of registering a new land property on the blockchain
            </p>
            <Link href="/land/register">
              <Button className="w-full inline-flex justify-center items-center">
                <PackagePlus className="w-4 h-4 mr-2" />
                Register Land
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="flex-1">
          <CardHeader className="p-4 border-b border-gray-200 dark:border-gray-800">
            <CardTitle className="text-md">List Property for Sale</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Make your verified property available for purchase on the marketplace
            </p>
            <Link href="/dashboard/landowner/list-sale">
              <Button className="w-full inline-flex justify-center items-center bg-accent hover:bg-accent/90 text-white">
                <BadgeDollarSign className="w-4 h-4 mr-2" />
                List Property
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Transactions */}
      <TransactionHistory />
    </DashboardLayout>
  );
}
