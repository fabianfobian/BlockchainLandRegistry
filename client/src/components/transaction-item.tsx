import { useState } from "react";
import { Transaction, LandStatus } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRightCircle, Building, DollarSign } from "lucide-react";

interface TransactionItemProps {
  transaction: Transaction;
  landTitle?: string;
  onVerify?: (transactionId: number, approved: boolean) => void;
}

export default function TransactionItem({ 
  transaction, 
  landTitle = "Land Property",
  onVerify 
}: TransactionItemProps) {
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleVerify = async (approved: boolean) => {
    if (!user || !transaction) return;
    
    setIsProcessing(true);
    
    try {
      const status = approved ? "completed" : "rejected";
      const payload = {
        status,
        reason: approved ? null : rejectReason,
        txHash: approved ? `0x${Math.random().toString(16).substring(2, 15)}` : null // This would be a real hash from blockchain in production
      };
      
      await apiRequest(
        "PATCH",
        `/api/transactions/${transaction.id}`,
        payload
      );
      
      toast({
        title: approved ? "Transfer approved" : "Transfer rejected",
        description: approved 
          ? "The land ownership has been successfully transferred." 
          : "The land transfer has been rejected.",
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/pending'] });
      
      if (onVerify) {
        onVerify(transaction.id, approved);
      }
      
      if (!approved) {
        setIsRejectDialogOpen(false);
      }
    } catch (error) {
      toast({
        title: "Verification failed",
        description: error instanceof Error ? error.message : "Could not process verification",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start">
          <div className="mr-4 flex-shrink-0">
            <div className="h-16 w-16 rounded-md bg-gray-200 flex items-center justify-center overflow-hidden">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-gray-500">
                <path d="M11.584 2.376a.75.75 0 01.832 0l9 6a.75.75 0 11-.832 1.248L12 3.901 3.416 9.624a.75.75 0 01-.832-1.248l9-6z" />
                <path fillRule="evenodd" d="M20.25 10.332v9.918H21a.75.75 0 010 1.5H3a.75.75 0 010-1.5h.75v-9.918a.75.75 0 01.634-.74A49.109 49.109 0 0112 9c2.59 0 5.134.202 7.616.592a.75.75 0 01.634.74zm-7.5 2.418a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75zm3-.75a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0v-6.75a.75.75 0 01.75-.75zM9 12.75a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between mb-2">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{landTitle} (ID: {transaction.landId})</p>
              <div className="ml-2 flex-shrink-0 flex">
                <Badge variant="info">Transfer Pending</Badge>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md mb-2">
              <div className="flex items-center text-sm">
                <div className="flex-1 flex items-center">
                  <User className="text-gray-400 w-4 h-4 mr-1" />
                  <span className="text-gray-700 dark:text-gray-300">From: ID {transaction.fromUserId}</span>
                </div>
                <ArrowRightCircle className="text-gray-400 w-4 h-4 mx-2" />
                <div className="flex-1 flex items-center">
                  <User className="text-gray-400 w-4 h-4 mr-1" />
                  <span className="text-gray-700 dark:text-gray-300">To: ID {transaction.toUserId}</span>
                </div>
                <div className="flex-1 flex items-center justify-end">
                  <DollarSign className="text-gray-400 w-4 h-4 mr-1" />
                  <span className="text-gray-700 dark:text-gray-300">Price: {transaction.price} ETH</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-primary-700 bg-primary-100 border-primary-200 hover:bg-primary-200"
                onClick={() => window.open(`/land/${transaction.landId}`, '_blank')}
              >
                <Building className="w-4 h-4 mr-1" />
                View Property
              </Button>
              <Button
                size="sm"
                variant="default"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleVerify(true)}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Approve Transfer"}
              </Button>
              <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={isProcessing}
                  >
                    Reject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reject Transfer Request</DialogTitle>
                    <DialogDescription>
                      Please provide a reason for rejecting this transfer request. 
                      This will be recorded on the blockchain and sent to both parties.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="reject-reason">Rejection Reason</Label>
                    <Textarea
                      id="reject-reason"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Missing documentation, suspicious activity, etc."
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsRejectDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => handleVerify(false)}
                      disabled={!rejectReason.trim() || isProcessing}
                    >
                      {isProcessing ? "Processing..." : "Confirm Rejection"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function User(props: any) {
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
