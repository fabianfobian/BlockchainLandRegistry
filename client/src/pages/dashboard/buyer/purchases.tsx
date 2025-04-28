import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, ShoppingBag, Clock, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import TransactionItem from "@/components/transaction-item";

export default function MyPurchases() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    data: transactions,
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/transactions/my'],
    onError: (error) => {
      toast({
        title: "Error loading transactions",
        description: error instanceof Error ? error.message : "Failed to load your purchases",
        variant: "destructive",
      });
    },
  });
  
  // Filter purchases (transactions where user is the buyer)
  const myPurchases = transactions?.filter(tx => tx.toUserId === user?.id) || [];
  const pendingPurchases = myPurchases.filter(tx => tx.status === 'pending');
  const completedPurchases = myPurchases.filter(tx => tx.status === 'completed');
  const rejectedPurchases = myPurchases.filter(tx => tx.status === 'rejected');
  
  return (
    <DashboardLayout title="My Purchases" requireRole={UserRole.BUYER}>
      <div className="mb-6 flex items-center">
        <Link href="/dashboard/buyer">
          <Button variant="ghost" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
        </Link>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Purchase Status</CardTitle>
          <CardDescription>
            Track the status of your property purchases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted rounded-lg p-4 text-center">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900 w-12 h-12 flex items-center justify-center mx-auto mb-2">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-medium">Pending</h3>
              <p className="text-2xl font-bold mt-1">{pendingPurchases.length}</p>
            </div>
            
            <div className="bg-muted rounded-lg p-4 text-center">
              <div className="rounded-full bg-green-100 dark:bg-green-900 w-12 h-12 flex items-center justify-center mx-auto mb-2">
                <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-medium">Completed</h3>
              <p className="text-2xl font-bold mt-1">{completedPurchases.length}</p>
            </div>
            
            <div className="bg-muted rounded-lg p-4 text-center">
              <div className="rounded-full bg-red-100 dark:bg-red-900 w-12 h-12 flex items-center justify-center mx-auto mb-2">
                <ShoppingBag className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="font-medium">Rejected</h3>
              <p className="text-2xl font-bold mt-1">{rejectedPurchases.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex items-center justify-between">
              <CardTitle>Purchase History</CardTitle>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all">
              {isLoading ? (
                <div className="text-center py-12">
                  <svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading purchases...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-500 dark:text-red-400">Failed to load purchases. Please try again later.</p>
                </div>
              ) : myPurchases.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No purchases yet</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Start browsing the marketplace to find your first property.
                  </p>
                  <div className="mt-6">
                    <Link href="/dashboard/buyer/browse">
                      <Button>
                        Browse Properties
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 mt-4">
                  {myPurchases.map((transaction) => (
                    <TransactionItem 
                      key={transaction.id} 
                      transaction={transaction}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="pending">
              {!isLoading && !error && (
                <div className="space-y-4 mt-4">
                  {pendingPurchases.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">No pending purchases</p>
                    </div>
                  ) : (
                    pendingPurchases.map((transaction) => (
                      <TransactionItem 
                        key={transaction.id} 
                        transaction={transaction}
                      />
                    ))
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed">
              {!isLoading && !error && (
                <div className="space-y-4 mt-4">
                  {completedPurchases.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">No completed purchases</p>
                    </div>
                  ) : (
                    completedPurchases.map((transaction) => (
                      <TransactionItem 
                        key={transaction.id} 
                        transaction={transaction}
                      />
                    ))
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </DashboardLayout>
  );
}