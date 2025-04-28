import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Land, PropertyType } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Building, ArrowLeft, ArrowRight } from "lucide-react";
import PropertyCard from "./property-card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

export default function PropertyListing() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [propertyType, setPropertyType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const {
    data: properties,
    isLoading,
    error
  } = useQuery<Land[]>({
    queryKey: ["/api/lands/marketplace"],
    onError: (error) => {
      toast({
        title: "Error loading properties",
        description: error instanceof Error ? error.message : "Failed to load properties",
        variant: "destructive",
      });
    },
  });
  
  // Handle purchase
  const handlePurchase = async (property: Land) => {
    try {
      if (!user?.walletAddress) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet to make a purchase",
          variant: "destructive",
        });
        return;
      }
      
      await apiRequest("POST", "/api/transactions", {
        landId: property.id,
        price: property.price
      });
      
      toast({
        title: "Purchase initiated",
        description: "Your purchase request has been submitted for approval",
      });
    } catch (error) {
      toast({
        title: "Purchase failed",
        description: error instanceof Error ? error.message : "Failed to purchase property",
        variant: "destructive",
      });
    }
  };
  
  // Filter properties based on search term and property type
  const filteredProperties = properties
    ? properties.filter((property) => {
        const matchesSearch = searchTerm
          ? property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
            property.city.toLowerCase().includes(searchTerm.toLowerCase())
          : true;
          
        const matchesType = propertyType !== "all" 
          ? property.propertyType === propertyType
          : true;
          
        return matchesSearch && matchesType;
      })
    : [];
    
  // Pagination
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="flex justify-center">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading properties...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-red-500 dark:text-red-400">Failed to load properties.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="px-4 pt-5 sm:px-6 flex justify-between items-center flex-col sm:flex-row gap-4">
        <CardTitle>Available Properties</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="text"
              placeholder="Search properties..."
              className="pl-8 pr-4 w-full sm:w-[200px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="property-type" className="sr-only">
              Property Type
            </Label>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value={PropertyType.RESIDENTIAL}>Residential</SelectItem>
                <SelectItem value={PropertyType.COMMERCIAL}>Commercial</SelectItem>
                <SelectItem value={PropertyType.AGRICULTURAL}>Agricultural</SelectItem>
                <SelectItem value={PropertyType.INDUSTRIAL}>Industrial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="border-t border-gray-200 dark:border-gray-800">
        {paginatedProperties.length > 0 ? (
          <div className="space-y-4">
            {paginatedProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                showStatus={false}
                actionButton={
                  <Button 
                    size="sm" 
                    onClick={() => handlePurchase(property)}
                    disabled={!user?.walletAddress || user.role !== 'buyer'}
                    className="bg-accent hover:bg-accent/90 text-white"
                  >
                    <Building className="w-4 h-4 mr-1" />
                    Purchase
                  </Button>
                }
              />
            ))}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-4 mt-4">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, filteredProperties.length)}
                    </span>{" "}
                    of <span className="font-medium">{filteredProperties.length}</span> results
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No properties found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || propertyType !== "all"
                ? "Try adjusting your search or filter criteria."
                : "There are no properties listed for sale yet."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
