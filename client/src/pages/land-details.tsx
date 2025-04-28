import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Land, LandStatus, PropertyType, UserRole } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import DashboardLayout from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  User,
  Calendar,
  Ruler,
  FileText,
  Home,
  Clock,
  CheckCircle,
  XCircle,
  Building,
  Tag,
  ArrowLeft,
  ArrowDown,
  History,
  ListFilter,
  LinkIcon,
  Edit
} from "lucide-react";
import { Link } from "wouter";

export default function LandDetails() {
  const { id } = useParams<{ id: string }>();
  const landId = parseInt(id);
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("details");
  const [showListDialog, setShowListDialog] = useState(false);
  const [price, setPrice] = useState<string>("");
  
  // Fetch land details
  const {
    data: land,
    isLoading,
    error,
    refetch
  } = useQuery<Land>({
    queryKey: [`/api/lands/${landId}`],
    onError: (error) => {
      toast({
        title: "Error loading land details",
        description: error instanceof Error ? error.message : "Failed to load land details",
        variant: "destructive",
      });
    },
  });
  
  // Fetch verification logs for this land
  const {
    data: verificationLogs,
    isLoading: isLoadingLogs
  } = useQuery({
    queryKey: [`/api/verification-logs/land/${landId}`],
    onError: (error) => {
      console.error("Error loading verification logs:", error);
    },
    enabled: !!landId
  });
  
  // Redirect if invalid ID
  useEffect(() => {
    if (!isLoading && !land && !error) {
      toast({
        title: "Land not found",
        description: "The requested land property could not be found",
        variant: "destructive",
      });
      navigate("/dashboard/landowner");
    }
  }, [isLoading, land, error, navigate, toast]);
  
  // List land for sale
  const handleListForSale = async () => {
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid price greater than 0",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await apiRequest("PATCH", `/api/lands/${landId}/sale`, {
        isForSale: true,
        price: parseFloat(price)
      });
      
      toast({
        title: "Land listed for sale",
        description: "Your property has been listed on the marketplace",
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: [`/api/lands/${landId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/lands/my'] });
      
      // Refresh and close dialog
      refetch();
      setShowListDialog(false);
      
    } catch (error) {
      toast({
        title: "Failed to list land",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };
  
  // Remove land from sale
  const handleRemoveFromSale = async () => {
    try {
      await apiRequest("PATCH", `/api/lands/${landId}/sale`, {
        isForSale: false
      });
      
      toast({
        title: "Removed from sale",
        description: "Your property has been removed from the marketplace",
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: [`/api/lands/${landId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/lands/my'] });
      
      // Refresh
      refetch();
      
    } catch (error) {
      toast({
        title: "Failed to remove listing",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };
  
  // Purchase land
  const handlePurchase = async () => {
    if (!user?.walletAddress) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to make a purchase",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await apiRequest("POST", "/api/transactions", {
        landId: land?.id,
        price: land?.price
      });
      
      toast({
        title: "Purchase initiated",
        description: "Your purchase request has been submitted for approval",
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: [`/api/lands/${landId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/my'] });
      
      // Refresh
      refetch();
      
    } catch (error) {
      toast({
        title: "Purchase failed",
        description: error instanceof Error ? error.message : "Failed to purchase property",
        variant: "destructive",
      });
    }
  };
  
  // Helper functions
  const getStatusBadge = (status: LandStatus) => {
    switch (status) {
      case LandStatus.PENDING:
        return <Badge variant="warning">Pending Approval</Badge>;
      case LandStatus.VERIFIED:
        return <Badge variant="success">Verified</Badge>;
      case LandStatus.REJECTED:
        return <Badge variant="error">Rejected</Badge>;
      case LandStatus.TRANSFER_PENDING:
        return <Badge variant="info">Transfer Pending</Badge>;
      default:
        return null;
    }
  };
  
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <DashboardLayout title="Land Details">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  // Show error state
  if (error || !land) {
    return (
      <DashboardLayout title="Land Details">
        <div className="max-w-5xl mx-auto text-center py-12">
          <XCircle className="mx-auto h-12 w-12 text-red-500 dark:text-red-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">Error Loading Property</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            We couldn't load the requested property details. Please try again later.
          </p>
          <div className="mt-6">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  const isOwner = user?.id === land.ownerId;
  const canBuy = user?.role === UserRole.BUYER && land.isForSale && land.status === LandStatus.VERIFIED;
  const canVerify = user?.role === UserRole.VERIFIER && land.status === LandStatus.PENDING;
  
  return (
    <DashboardLayout title="Land Details">
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <div className="mb-4">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        
        {/* Land title and status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {land.title}
          </h1>
          <div className="flex items-center mt-2 sm:mt-0">
            {getStatusBadge(land.status)}
            {land.isForSale && (
              <Badge variant="info" className="ml-2">For Sale: {land.price} ETH</Badge>
            )}
            {land.tokenId && (
              <Badge variant="default" className="ml-2 flex items-center">
                <LinkIcon className="w-3 h-3 mr-1" />
                <span className="mono">NFT #{land.tokenId}</span>
              </Badge>
            )}
          </div>
        </div>
        
        {/* Property image (placeholder) */}
        <div className="w-full aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-8 flex items-center justify-center">
          <div className="text-center">
            {land.propertyType === PropertyType.RESIDENTIAL ? (
              <Home className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            ) : land.propertyType === PropertyType.COMMERCIAL ? (
              <Building className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            ) : (
              <MapPin className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            )}
            <p className="text-gray-500 dark:text-gray-400">
              Property Image Placeholder
            </p>
          </div>
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Property Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="history">Verification History</TabsTrigger>
          </TabsList>
          
          {/* Details Tab */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Property Information</CardTitle>
                <CardDescription>
                  Detailed information about this land property
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left column */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Property Type</h3>
                      <p className="mt-1 text-lg text-gray-900 dark:text-gray-100 capitalize">
                        {land.propertyType}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Owner ID</h3>
                      <p className="mt-1 text-lg text-gray-900 dark:text-gray-100 flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                        {land.ownerId}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Area</h3>
                      <p className="mt-1 text-lg text-gray-900 dark:text-gray-100 flex items-center">
                        <Ruler className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                        {land.area.toLocaleString()} sq.ft.
                      </p>
                    </div>
                    
                    {land.yearBuilt && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Year Built</h3>
                        <p className="mt-1 text-lg text-gray-900 dark:text-gray-100 flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                          {land.yearBuilt}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Right column */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</h3>
                      <p className="mt-1 text-lg text-gray-900 dark:text-gray-100 flex items-start">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500 mt-1" />
                        <span>
                          {land.address},<br />
                          {land.city}, {land.state} {land.postalCode}
                        </span>
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Registration Date</h3>
                      <p className="mt-1 text-lg text-gray-900 dark:text-gray-100 flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                        {formatDate(land.createdAt)}
                      </p>
                    </div>
                    
                    {land.tokenId && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">NFT Token ID</h3>
                        <p className="mt-1 text-lg text-gray-900 dark:text-gray-100 flex items-center">
                          <LinkIcon className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                          <span className="mono">{land.tokenId}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</h3>
                  <p className="text-gray-900 dark:text-gray-100">
                    {land.description || "No description provided."}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Location</h3>
                  <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">
                        Map Placeholder
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2">
                {isOwner && land.status === LandStatus.VERIFIED && (
                  <>
                    {!land.isForSale ? (
                      <Dialog open={showListDialog} onOpenChange={setShowListDialog}>
                        <DialogTrigger asChild>
                          <Button className="bg-accent hover:bg-accent/90 text-white">
                            <Tag className="w-4 h-4 mr-2" />
                            List for Sale
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>List Property for Sale</DialogTitle>
                            <DialogDescription>
                              Enter the price at which you want to list your property on the marketplace.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Label htmlFor="price">Price (ETH)</Label>
                            <Input
                              id="price"
                              type="number"
                              min="0.01"
                              step="0.01"
                              placeholder="e.g. 1.5"
                              className="mt-2"
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                            />
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowListDialog(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleListForSale}>
                              List Property
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Button variant="outline" onClick={handleRemoveFromSale}>
                        Remove from Sale
                      </Button>
                    )}
                  </>
                )}
                
                {canBuy && (
                  <Button className="bg-accent hover:bg-accent/90 text-white" onClick={handlePurchase}>
                    <Building className="w-4 h-4 mr-2" />
                    Purchase Property
                  </Button>
                )}
                
                {canVerify && (
                  <Link href={`/dashboard/verifier`}>
                    <Button>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify Property
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Property Documents</CardTitle>
                <CardDescription>
                  Official documents related to this property
                </CardDescription>
              </CardHeader>
              <CardContent>
                {land.documents && Array.isArray(land.documents) && land.documents.length > 0 ? (
                  <div className="space-y-4">
                    {land.documents.map((doc, index) => (
                      <div key={index} className="flex items-center p-3 border rounded-md bg-white dark:bg-gray-800">
                        <div className="p-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {doc}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Uploaded on {formatDate(land.createdAt)}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" className="ml-auto" disabled>
                          <LinkIcon className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No documents available</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      This property has no documents attached or they are not accessible to you.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Verification History</CardTitle>
                <CardDescription>
                  Timeline of verification actions for this property
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingLogs ? (
                  <div className="text-center py-6">
                    <Clock className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 animate-pulse" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading verification history...</p>
                  </div>
                ) : verificationLogs && verificationLogs.length > 0 ? (
                  <div className="relative">
                    {/* Line connecting timeline items */}
                    <div className="absolute left-5 h-full w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                    
                    {/* Timeline items */}
                    <div className="space-y-6">
                      {verificationLogs.map((log, index) => (
                        <div key={index} className="relative flex items-start">
                          <div className={`absolute left-5 w-3 h-3 rounded-full -translate-x-1.5 mt-1.5 ${log.action.includes('approved') ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10 ${log.action.includes('approved') ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'}`}>
                            {log.action.includes('approved') ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <XCircle className="h-5 w-5" />
                            )}
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                              {log.action.includes('approved') ? 'Approved' : 'Rejected'}
                              {log.action.includes('transfer') ? ' Transfer' : ' Registration'}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              By Verifier ID: {log.verifierId} • {formatDate(log.createdAt)}
                            </p>
                            {log.reason && (
                              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  <span className="font-medium">Reason:</span> {log.reason}
                                </p>
                              </div>
                            )}
                            {log.txHash && (
                              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                Transaction Hash: <code className="mono">{log.txHash}</code>
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No verification history</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      This property has not been verified yet or has no verification records.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
