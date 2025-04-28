import { useAuth } from "@/hooks/use-auth";
import { UserRole, LandStatus } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/dashboard-layout";
import PropertyCard from "@/components/property-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, FolderDot, BadgeDollarSign, PackagePlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandownerProperties() {
  const { user } = useAuth();
  const { toast } = useToast();
  
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
  
  return (
    <DashboardLayout title="My Properties" requireRole={UserRole.LANDOWNER}>
      <div className="mb-6 flex items-center justify-between">
        <Link href="/dashboard/landowner">
          <Button variant="ghost" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
        </Link>
        
        <Link href="/land/register">
          <Button>
            <PackagePlus className="w-4 h-4 mr-2" />
            Register New Land
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <CardTitle>All Properties</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
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
            <div className="space-y-6">
              {lands?.map((land) => (
                <PropertyCard 
                  key={land.id} 
                  property={land}
                  actionButton={
                    land.status === LandStatus.VERIFIED && !land.isForSale ? (
                      <Link href={`/dashboard/landowner/list-sale?id=${land.id}`}>
                        <Button size="sm" className="bg-accent hover:bg-accent/90 text-white">
                          <BadgeDollarSign className="w-4 h-4 mr-1" />
                          List for Sale
                        </Button>
                      </Link>
                    ) : undefined
                  }
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}