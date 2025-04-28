import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";

const WALLET_TYPES = [
  {
    name: "MetaMask",
    icon: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
  },
  {
    name: "WalletConnect",
    icon: "https://avatars.githubusercontent.com/u/37784886"
  },
  {
    name: "Coinbase Wallet",
    icon: "https://avatars.githubusercontent.com/u/18060234"
  }
];

export default function WalletConnect() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const connectMetaMask = async () => {
    setIsConnecting(true);
    
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        toast({
          title: "MetaMask not found",
          description: "Please install MetaMask extension to connect your wallet.",
          variant: "destructive"
        });
        return;
      }
      
      // Request accounts
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }
      
      const address = accounts[0];
      
      // Save the wallet address to the backend
      await saveWalletAddress(address);
      
      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Could not connect to wallet",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  const saveWalletAddress = async (walletAddress: string) => {
    try {
      const res = await apiRequest("POST", "/api/user/wallet", { walletAddress });
      const updatedUser = await res.json();
      
      // Update user in cache
      queryClient.setQueryData(["/api/user"], updatedUser);
    } catch (error) {
      console.error("Error saving wallet address:", error);
      throw new Error("Failed to save wallet address");
    }
  };
  
  // If already connected, show address
  if (user?.walletAddress) {
    return (
      <div className="flex items-center px-3 py-1 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 rounded-full text-sm border border-green-200 dark:border-green-900">
        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
        <span className="mono truncate-address">{user.walletAddress}</span>
      </div>
    );
  }
  
  // If not connected, show connect button and dialog
  return (
    <>
      <Button 
        variant="outline" 
        className="bg-accent text-white hover:bg-accent/90"
        onClick={() => setIsDialogOpen(true)}
      >
        Connect Wallet
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
            <DialogDescription>
              Connect your Ethereum wallet to register land, verify ownership, or perform transactions on the blockchain.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col space-y-3 mt-4">
            {WALLET_TYPES.map((wallet) => (
              <Button
                key={wallet.name}
                variant="outline"
                className="flex justify-between py-6 px-4"
                disabled={isConnecting || wallet.name !== "MetaMask"}
                onClick={wallet.name === "MetaMask" ? connectMetaMask : undefined}
              >
                <div className="flex items-center">
                  <img src={wallet.icon} alt={wallet.name} className="h-8 w-8 mr-3" />
                  <span>{wallet.name}</span>
                </div>
                {isConnecting && wallet.name === "MetaMask" ? (
                  <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-400">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
              </Button>
            ))}
          </div>
          
          {WALLET_TYPES.some(w => w.name !== "MetaMask") && (
            <div className="text-sm text-muted-foreground mt-2 text-center">
              Note: Only MetaMask is currently supported. Other wallet types coming soon.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// Add window.ethereum type definition for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string, params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      selectedAddress: string | null;
    };
  }
}
