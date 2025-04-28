import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/dashboard-layout";
import StatsCard from "@/components/stats-card";
import PropertyListing from "@/components/property-listing";
import TransactionHistory from "@/components/transaction-history";
import { 
  Building, 
  ShoppingBag,
  CheckCheck, 
  Link as LinkIcon,
  ArrowUp,
  Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function BuyerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: transactions } = useQuery({
    queryKey: ['/api/transactions/my'],
    onError: (error) => {
      toast({
        title: "Error loading transactions",
        description: error instanceof Error ? error.message : "Failed to load your transactions",
        variant: "destructive",
      });
    },
  });
  
  // Stats calculations
  const purchasedProperties = transactions?.filter(tx => tx.status === 'completed' && tx.toUserId === user?.id).length || 0;
  const pendingPurchases = transactions?.filter(tx => tx.status === 'pending' && tx.toUserId === user?.id).length || 0;
  const transactionCount = transactions?.length || 0;
  
  return (
    <DashboardLayout title="Buyer Dashboard" requireRole={UserRole.BUYER}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <StatsCard
          title="Properties Purchased"
          value={purchasedProperties}
          icon={Building}
          color="primary"
        />
        <StatsCard
          title="Pending Purchases"
          value={pendingPurchases}
          icon={CheckCheck}
          color="warning"
        />
        <StatsCard
          title="Transactions"
          value={transactionCount}
          icon={LinkIcon}
          color="info"
        />
      </div>
      
      {/* Wallet Status Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Wallet Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {user?.walletAddress ? "1.35 ETH" : "Connect Wallet"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.walletAddress ? "≈ $4,253.25 USD" : "Add your wallet to view balance"}
              </p>
            </div>
            
            {!user?.walletAddress && (
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Connect your wallet to enable property purchases
                </p>
              </div>
            )}
            
            <Button 
              className="w-full bg-accent hover:bg-accent/90 text-white" 
              disabled={!!user?.walletAddress}
            >
              {user?.walletAddress ? "Wallet Connected" : "Connect Wallet"}
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingPurchases > 0 ? (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Purchase #{transactions?.find(tx => tx.status === 'pending' && tx.toUserId === user?.id)?.id || ''}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    Awaiting Approval
                  </span>
                </div>
                
                <Progress value={30} className="h-2 mb-2" />
                
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <span>Payment Completed</span>
                  <span>Government Verification</span>
                  <span>Transfer Complete</span>
                </div>
                
                <Link href="/dashboard/buyer/purchases">
                  <Button variant="outline" size="sm" className="w-full">
                    View All Purchases
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <ShoppingBag className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No pending purchases</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Browse the marketplace to find your next property
                </p>
                <Link href="/dashboard/buyer/browse">
                  <Button variant="outline" size="sm" className="mt-4">
                    <Search className="mr-2 h-4 w-4" />
                    Browse Properties
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Available Properties */}
      <PropertyListing />
      
      {/* Recent Transactions */}
      <div className="mt-6">
        <TransactionHistory />
      </div>
    </DashboardLayout>
  );
}
