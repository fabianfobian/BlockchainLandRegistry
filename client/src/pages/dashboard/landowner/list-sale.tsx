import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { UserRole, LandStatus } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useSearch } from "wouter";
import { ArrowLeft, FolderDot, Home, BadgeDollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import PropertyCard from "@/components/property-card";

export default function ListForSale() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const search = useSearch();
  const landId = new URLSearchParams(search).get("id");
  
  const [selectedLandId, setSelectedLandId] = useState<string | null>(landId);
  const [price, setPrice] = useState<string>("");
  
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
  
  // Filter only verified lands that are not already for sale
  const verifiedLands = lands?.filter(land => 
    land.status === LandStatus.VERIFIED && !land.isForSale
  ) || [];
  
  const selectedLand = lands?.find(land => land.id.toString() === selectedLandId);
  
  const listForSaleMutation = useMutation({
    mutationFn: async ({ landId, price }: { landId: number, price: number }) => {
      const res = await apiRequest("PATCH", `/api/lands/${landId}/sale`, {
        isForSale: true,
        price,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Property listed for sale",
        description: "Your property has been successfully listed for sale on the marketplace",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/lands/my'] });
      navigate("/dashboard/landowner/properties");
    },
    onError: (error) => {
      toast({
        title: "Failed to list property",
        description: error instanceof Error ? error.message : "An error occurred while listing your property for sale",
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLandId) {
      toast({
        title: "No property selected",
        description: "Please select a property to list for sale",
        variant: "destructive",
      });
      return;
    }
    
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid price greater than zero",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Submitting property for sale:", { landId: selectedLandId, price });

    listForSaleMutation.mutate({ 
      landId: parseInt(selectedLandId), 
      price: Number(price) 
    }, {
      onError: (error) => {
        console.error("Error listing property for sale:", error);
        toast({
          title: "Error",
          description: "Failed to list the property for sale. Please try again.",
          variant: "destructive",
        });
      }
    });
  };
  
  return (
    <DashboardLayout title="List Property for Sale" requireRole={UserRole.LANDOWNER}>
      <div className="mb-6 flex items-center">
        <Link href="/dashboard/landowner">
          <Button variant="ghost" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>List a Property for Sale</CardTitle>
            <CardDescription>
              Make your verified land property available on the marketplace
            </CardDescription>
          </CardHeader>
          <CardContent>
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
            ) : verifiedLands.length === 0 ? (
              <div className="text-center py-12">
                <Home className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No verified properties</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  You don't have any verified properties that can be listed for sale.
                </p>
                <div className="mt-6">
                  <Link href="/dashboard/landowner/properties">
                    <Button variant="outline">
                      View My Properties
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="property">Select Property</Label>
                  <Select 
                    value={selectedLandId || ""} 
                    onValueChange={setSelectedLandId}
                  >
                    <SelectTrigger id="property">
                      <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                    <SelectContent>
                      {verifiedLands.map((land) => (
                        <SelectItem key={land.id} value={land.id.toString()}>
                          {land.title} - {land.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price (ETH)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.001"
                    min="0.001"
                    placeholder="Enter price in ETH"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-accent hover:bg-accent/90 text-white"
                  disabled={listForSaleMutation.isPending}
                >
                  {listForSaleMutation.isPending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <BadgeDollarSign className="w-4 h-4 mr-2" />
                      List for Sale
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
        
        {selectedLand && (
          <Card>
            <CardHeader>
              <CardTitle>Property Preview</CardTitle>
              <CardDescription>
                Review your property details before listing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PropertyCard property={selectedLand} showStatus={true} />
              
              {price && (
                <div className="mt-4 p-4 bg-muted rounded-md">
                  <p className="font-medium">Listing Price</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-2xl font-bold text-accent">{price} ETH</span>
                    <BadgeDollarSign className="h-6 w-6 text-accent" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}