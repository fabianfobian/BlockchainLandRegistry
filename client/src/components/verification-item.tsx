import { useState } from "react";
import { Land, LandStatus } from "@shared/schema";
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
import { MapPin, User, Ruler, Calendar, FileText } from "lucide-react";

interface VerificationItemProps {
  land: Land;
  onVerify?: (landId: number, approved: boolean) => void;
}

export default function VerificationItem({ land, onVerify }: VerificationItemProps) {
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleVerify = async (approved: boolean) => {
    if (!user || !land) return;
    
    setIsProcessing(true);
    
    try {
      const status = approved ? LandStatus.VERIFIED : LandStatus.REJECTED;
      const payload = {
        status,
        reason: approved ? null : rejectReason,
        txHash: approved ? `0x${Math.random().toString(16).substring(2, 15)}` : null // This would be a real hash from blockchain in production
      };
      
      await apiRequest(
        "PATCH",
        `/api/lands/${land.id}/status`,
        payload
      );
      
      toast({
        title: approved ? "Land registration approved" : "Land registration rejected",
        description: approved 
          ? "The land has been successfully verified and an NFT has been minted." 
          : "The land registration has been rejected.",
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: [`/api/lands/status/${LandStatus.PENDING}`] });
      
      if (onVerify) {
        onVerify(land.id, approved);
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
                <path d="M19.006 3.705a.75.75 0 00-.512-1.41L6 6.838V3a.75.75 0 00-.75-.75h-1.5A.75.75 0 003 3v4.93l-1.006.365a.75.75 0 00.512 1.41l16.5-6z" />
                <path fillRule="evenodd" d="M3.019 11.115L18 5.667V9.09l4.006 1.456a.75.75 0 11-.512 1.41l-.494-.18v8.475h.75a.75.75 0 010 1.5H2.25a.75.75 0 010-1.5H3v-9.129l.019-.006zM18 20.25v-9.565l1.5.545v9.02H18zm-9-6a.75.75 0 00-.75.75v4.5c0 .414.336.75.75.75h3a.75.75 0 00.75-.75V15a.75.75 0 00-.75-.75H9z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{land.title}</p>
              <div className="ml-2 flex-shrink-0 flex">
                <Badge variant="warning">Pending Approval</Badge>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <User className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" />
                  Owner ID: {land.ownerId}
                </p>
                <p className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <MapPin className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" />
                  {land.address}, {land.city}, {land.state}
                </p>
                <p className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <Ruler className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" />
                  {land.area.toLocaleString()} sq.ft.
                </p>
                <p className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <Calendar className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" />
                  Submitted: {new Date(land.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center sm:justify-end gap-2 mt-3 sm:mt-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-primary-700 bg-primary-100 border-primary-200 hover:bg-primary-200"
                  onClick={() => window.open(`/land/${land.id}`, '_blank')}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Review Documents
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleVerify(true)}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Approve"}
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
                      <DialogTitle>Reject Land Registration</DialogTitle>
                      <DialogDescription>
                        Please provide a reason for rejecting this land registration. 
                        This will be recorded on the blockchain and sent to the land owner.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Label htmlFor="reject-reason">Rejection Reason</Label>
                      <Textarea
                        id="reject-reason"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Missing documentation, incorrect information, etc."
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
        </div>
      </CardContent>
    </Card>
  );
}
