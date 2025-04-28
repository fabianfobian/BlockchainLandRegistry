import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Shield, Search, UserPlus, ShieldCheck, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function VerifierManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newVerifier, setNewVerifier] = useState({
    username: "",
    email: "",
    password: "",
    fullName: ""
  });
  
  const {
    data: verifiers,
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/users/verifiers'],
    onError: (error) => {
      toast({
        title: "Error loading verifiers",
        description: error instanceof Error ? error.message : "Failed to load verifier data",
        variant: "destructive",
      });
    },
  });
  
  const createVerifierMutation = useMutation({
    mutationFn: async (verifierData: typeof newVerifier) => {
      const res = await apiRequest("POST", "/api/users/verifier", {
        ...verifierData,
        role: UserRole.VERIFIER
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Verifier created",
        description: "The new verifier account has been created successfully",
      });
      setIsDialogOpen(false);
      setNewVerifier({
        username: "",
        email: "",
        password: "",
        fullName: ""
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users/verifiers'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to create verifier",
        description: error instanceof Error ? error.message : "An error occurred while creating the verifier account",
        variant: "destructive",
      });
    },
  });
  
  // Filter verifiers based on search term
  const filteredVerifiers = verifiers?.filter((verifier) => {
    return searchTerm === "" || 
      verifier.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verifier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verifier.fullName.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewVerifier({
      ...newVerifier,
      [name]: value
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newVerifier.username || !newVerifier.email || !newVerifier.password || !newVerifier.fullName) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields to create a new verifier",
        variant: "destructive",
      });
      return;
    }
    
    createVerifierMutation.mutate(newVerifier);
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <DashboardLayout title="Verifier Management" requireRole={UserRole.ADMIN}>
      <div className="mb-6 flex items-center justify-between">
        <Link href="/dashboard/admin">
          <Button variant="ghost" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
        </Link>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Verifier
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Verifier</DialogTitle>
              <DialogDescription>
                Create a new government verifier account with the authority to verify land registrations and transfers.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Enter full name"
                    value={newVerifier.fullName}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="Enter username"
                    value={newVerifier.username}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    value={newVerifier.email}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter password"
                    value={newVerifier.password}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createVerifierMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {createVerifierMutation.isPending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      Create Verifier
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Government Verifiers</CardTitle>
          <CardDescription>
            Manage verifiers who can approve land registrations and transfers
          </CardDescription>
          
          <div className="relative mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="text"
              placeholder="Search verifiers..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading verifiers...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 dark:text-red-400">Failed to load verifiers. Please try again later.</p>
            </div>
          ) : !filteredVerifiers?.length ? (
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No verifiers found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? "Try adjusting your search criteria."
                  : "No verifiers have been added yet."}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Verifier
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Verifier</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Wallet Connected</TableHead>
                    <TableHead>Added On</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVerifiers?.map((verifier) => (
                    <TableRow key={verifier.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Shield className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{verifier.fullName}</div>
                            <div className="text-xs text-gray-500">@{verifier.username}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{verifier.email}</TableCell>
                      <TableCell>
                        {verifier.walletAddress ? (
                          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800">
                            Not Connected
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(verifier.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Mail className="h-3.5 w-3.5 mr-1" />
                            Contact
                          </Button>
                          <Button variant="ghost" size="sm">
                            Details
                          </Button>
                        </div>
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