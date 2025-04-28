import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ArrowRightLeft, Check, X, DollarSign, Calendar } from "lucide-react";

export default function TransactionHistory() {
  const { toast } = useToast();
  
  const {
    data: transactions,
    isLoading,
    error
  } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions/my'],
    onError: (error) => {
      toast({
        title: "Error loading transactions",
        description: error instanceof Error ? error.message : "Failed to load transaction history",
        variant: "destructive",
      });
    },
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-md">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-3/5" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-red-500 dark:text-red-400">Failed to load transaction history.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (transactions?.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <ArrowRightLeft className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No transactions yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Your transaction history will appear here once you buy or sell land.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions?.map((transaction) => (
            <div 
              key={transaction.id} 
              className="flex flex-col p-4 border rounded-md bg-white dark:bg-gray-800 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2">
                    <ArrowRightLeft className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium">
                    Land ID: {transaction.landId}
                  </span>
                </div>
                <TransactionStatusBadge status={transaction.status} />
              </div>
              
              <div className="flex items-center justify-between text-sm mt-2 text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>{transaction.price} ETH</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex items-center mt-3 text-sm">
                <div className="rounded-full bg-gray-100 dark:bg-gray-700 p-1">
                  <UserIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <span className="mx-1 text-gray-600 dark:text-gray-400">ID: {transaction.fromUserId}</span>
                <ArrowRight className="h-4 w-4 mx-1 text-gray-400 dark:text-gray-600" />
                <div className="rounded-full bg-gray-100 dark:bg-gray-700 p-1">
                  <UserIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <span className="mx-1 text-gray-600 dark:text-gray-400">ID: {transaction.toUserId}</span>
              </div>
              
              {transaction.txHash && (
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Tx Hash: </span>
                  <code className="mono">{transaction.txHash}</code>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TransactionStatusBadge({ status }: { status: string }) {
  if (status === "pending") {
    return (
      <Badge variant="warning" className="capitalize">Pending</Badge>
    );
  } else if (status === "completed") {
    return (
      <Badge variant="success" className="capitalize">Completed</Badge>
    );
  } else if (status === "rejected") {
    return (
      <Badge variant="error" className="capitalize">Rejected</Badge>
    );
  }
  
  return (
    <Badge className="capitalize">{status}</Badge>
  );
}

function UserIcon(props: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={props.className}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
}
