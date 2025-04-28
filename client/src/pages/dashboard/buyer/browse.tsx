import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { UserRole, PropertyType } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/dashboard-layout";
import PropertyCard from "@/components/property-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Search, BadgeDollarSign, Home, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BrowseProperties() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyType, setPropertyType] = useState<string>("all");
  
  const {
    data: lands,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['/api/lands/marketplace'],
    onError: (error) => {
      toast({
        title: "Error loading marketplace",
        description: error instanceof Error ? error.message : "Failed to load properties for sale",
        variant: "destructive",
      });
    },
  });
  
  // Filter properties based on search term and property type
  const filteredProperties = lands?.filter((property) => {
    const matchesSearch = searchTerm === "" || 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.description.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesType = propertyType === "all" || property.propertyType === propertyType;
    
    return matchesSearch && matchesType;
  });
  
  return (
    <DashboardLayout title="Browse Properties" requireRole={UserRole.BUYER}>
      <div className="mb-6 flex items-center">
        <Link href="/dashboard/buyer">
          <Button variant="ghost" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
        </Link>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Find Your Perfect Property</CardTitle>
          <CardDescription>
            Browse verified properties available for sale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="text"
                placeholder="Search properties..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="w-full sm:w-48">
              <Select
                value={propertyType}
                onValueChange={setPropertyType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Property Type" />
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
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="border-b border-gray-200 dark:border-gray-800">
          <CardTitle>Properties For Sale</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading properties...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 dark:text-red-400">Failed to load properties. Please try again later.</p>
            </div>
          ) : !filteredProperties?.length ? (
            <div className="text-center py-12">
              <Home className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No properties found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || propertyType !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "There are no properties listed for sale yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredProperties?.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  showOwner={true}
                  actionButton={
                    <Link href={`/land/${property.id}`}>
                      <Button size="sm" className="bg-accent hover:bg-accent/90 text-white">
                        <BadgeDollarSign className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </Link>
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