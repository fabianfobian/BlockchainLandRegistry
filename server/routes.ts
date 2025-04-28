import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth, hashPassword } from "./auth";
import { storage } from "./storage";
import { insertLandSchema, insertTransactionSchema, insertVerificationLogSchema, LandStatus, UserRole } from "@shared/schema";
import { z } from "zod";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check user role
const hasRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (!roles.includes(req.user.role as UserRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // DEVELOPMENT ONLY: Seed endpoint to create test accounts
  if (process.env.NODE_ENV === 'development') {
    app.post("/api/seed/users", async (req, res) => {
      try {
        const { adminPassword, verifierPassword } = req.body;
        if (!adminPassword || !verifierPassword) {
          return res.status(400).json({ message: "Passwords are required" });
        }
        
        const hashedAdminPassword = await hashPassword(adminPassword);
        const hashedVerifierPassword = await hashPassword(verifierPassword);
        
        // Create admin user if it doesn't exist
        let adminUser = await storage.getUserByUsername("admin");
        if (!adminUser) {
          adminUser = await storage.createUser({
            username: "admin",
            email: "admin@landregistry.com",
            password: hashedAdminPassword,
            fullName: "System Administrator",
            role: UserRole.ADMIN,
            walletAddress: null
          });
        }
        
        // Create verifier user if it doesn't exist
        let verifierUser = await storage.getUserByUsername("verifier");
        if (!verifierUser) {
          verifierUser = await storage.createUser({
            username: "verifier",
            email: "verifier@landregistry.com",
            password: hashedVerifierPassword,
            fullName: "Land Verifier",
            role: UserRole.VERIFIER,
            walletAddress: null
          });
        }
        
        res.status(201).json({ 
          message: "Test users created successfully",
          users: [
            { username: "admin", role: UserRole.ADMIN },
            { username: "verifier", role: UserRole.VERIFIER }
          ]
        });
      } catch (error) {
        console.error("Error creating test users:", error);
        res.status(500).json({ message: "Failed to create test users" });
      }
    });
  }

  // System routes
  app.get("/api/system/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Land routes
  // Create new land registration
  app.post("/api/lands", isAuthenticated, hasRole([UserRole.LANDOWNER]), async (req, res) => {
    try {
      const validatedData = insertLandSchema.parse({
        ...req.body,
        ownerId: req.user.id
      });
      
      const land = await storage.createLand(validatedData);
      res.status(201).json(land);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create land registration" });
    }
  });

  // Get all lands owned by the current user
  app.get("/api/lands/my", isAuthenticated, async (req, res) => {
    try {
      const lands = await storage.getLandsByOwner(req.user.id);
      res.json(lands);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lands" });
    }
  });

  // Get land by ID
  app.get("/api/lands/:id", isAuthenticated, async (req, res) => {
    try {
      const landId = parseInt(req.params.id);
      if (isNaN(landId)) {
        return res.status(400).json({ message: "Invalid land ID" });
      }

      const land = await storage.getLand(landId);
      if (!land) {
        return res.status(404).json({ message: "Land not found" });
      }

      res.json(land);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch land" });
    }
  });

  // Get lands by status (for verifiers)
  app.get("/api/lands/status/:status", isAuthenticated, hasRole([UserRole.VERIFIER, UserRole.ADMIN]), async (req, res) => {
    try {
      const status = req.params.status as LandStatus;
      const lands = await storage.getLandsByStatus(status);
      res.json(lands);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lands" });
    }
  });

  // Update land status (for verifiers)
  app.patch("/api/lands/:id/status", isAuthenticated, hasRole([UserRole.VERIFIER]), async (req, res) => {
    try {
      const landId = parseInt(req.params.id);
      if (isNaN(landId)) {
        return res.status(400).json({ message: "Invalid land ID" });
      }

      const { status, reason, txHash } = req.body;
      if (!status || !Object.values(LandStatus).includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const land = await storage.getLand(landId);
      if (!land) {
        return res.status(404).json({ message: "Land not found" });
      }

      const updatedLand = await storage.updateLandStatus(landId, status);
      
      // Create verification log
      await storage.createVerificationLog({
        landId,
        verifierId: req.user.id,
        action: status === LandStatus.VERIFIED ? "approved" : "rejected",
        reason,
        txHash
      });

      res.json(updatedLand);
    } catch (error) {
      res.status(500).json({ message: "Failed to update land status" });
    }
  });

  // Update land for sale status
  app.patch("/api/lands/:id/sale", isAuthenticated, hasRole([UserRole.LANDOWNER]), async (req, res) => {
    try {
      const landId = parseInt(req.params.id);
      if (isNaN(landId)) {
        return res.status(400).json({ message: "Invalid land ID" });
      }

      const { isForSale, price } = req.body;
      if (typeof isForSale !== 'boolean') {
        return res.status(400).json({ message: "isForSale must be a boolean" });
      }

      if (isForSale && (!price || isNaN(price) || price <= 0)) {
        return res.status(400).json({ message: "Valid price is required when listing for sale" });
      }

      const land = await storage.getLand(landId);
      if (!land) {
        return res.status(404).json({ message: "Land not found" });
      }

      // Only the owner can update this
      if (land.ownerId !== req.user.id) {
        return res.status(403).json({ message: "You do not own this land" });
      }

      // Can only list verified lands for sale
      if (isForSale && land.status !== LandStatus.VERIFIED) {
        return res.status(400).json({ message: "Can only list verified lands for sale" });
      }

      const updatedLand = await storage.updateLandForSale(landId, isForSale, price);
      res.json(updatedLand);
    } catch (error) {
      res.status(500).json({ message: "Failed to update land sale status" });
    }
  });

  // Get all verified lands for sale (marketplace)
  app.get("/api/lands/marketplace", async (req, res) => {
    try {
      const lands = await storage.getVerifiedLandsForSale();
      res.json(lands);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch marketplace lands" });
    }
  });

  // Transaction routes
  // Create new transaction (buy land)
  app.post("/api/transactions", isAuthenticated, hasRole([UserRole.BUYER]), async (req, res) => {
    try {
      const { landId, price } = req.body;
      
      if (!landId || !price) {
        return res.status(400).json({ message: "Land ID and price are required" });
      }

      const land = await storage.getLand(landId);
      if (!land) {
        return res.status(404).json({ message: "Land not found" });
      }

      // Check if land is for sale
      if (!land.isForSale) {
        return res.status(400).json({ message: "Land is not for sale" });
      }

      // Check if land is verified
      if (land.status !== LandStatus.VERIFIED) {
        return res.status(400).json({ message: "Only verified lands can be purchased" });
      }

      // Check if price matches
      if (land.price !== price) {
        return res.status(400).json({ message: "Price does not match the listing" });
      }

      // Create transaction
      const transaction = await storage.createTransaction({
        landId,
        fromUserId: land.ownerId,
        toUserId: req.user.id,
        price,
        status: "pending",
        escrowId: null
      });

      // Update land status to transfer pending
      await storage.updateLandStatus(landId, LandStatus.TRANSFER_PENDING);

      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // Get all transactions for current user
  app.get("/api/transactions/my", isAuthenticated, async (req, res) => {
    try {
      const transactions = await storage.getTransactionsByUser(req.user.id);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Get all pending transactions (for verifiers)
  app.get("/api/transactions/pending", isAuthenticated, hasRole([UserRole.VERIFIER, UserRole.ADMIN]), async (req, res) => {
    try {
      const transactions = await storage.getPendingTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending transactions" });
    }
  });

  // Approve/reject transaction (for verifiers)
  app.patch("/api/transactions/:id", isAuthenticated, hasRole([UserRole.VERIFIER]), async (req, res) => {
    try {
      const transactionId = parseInt(req.params.id);
      if (isNaN(transactionId)) {
        return res.status(400).json({ message: "Invalid transaction ID" });
      }

      const { status, txHash, reason } = req.body;
      if (!status || !['completed', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const transaction = await storage.getTransaction(transactionId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      if (transaction.status !== "pending") {
        return res.status(400).json({ message: "Transaction is not pending" });
      }

      const updatedTransaction = await storage.updateTransactionStatus(
        transactionId,
        status,
        txHash
      );

      // If approved, update land ownership
      if (status === 'completed') {
        await storage.updateLandOwner(transaction.landId, transaction.toUserId);
        
        // Create verification log
        await storage.createVerificationLog({
          landId: transaction.landId,
          verifierId: req.user.id,
          action: "approved-transfer",
          txHash
        });
      } else {
        // If rejected, update land status back to verified
        const land = await storage.getLand(transaction.landId);
        if (land) {
          await storage.updateLandStatus(land.id, LandStatus.VERIFIED);
          
          // Create verification log
          await storage.createVerificationLog({
            landId: transaction.landId,
            verifierId: req.user.id,
            action: "rejected-transfer",
            reason,
            txHash
          });
        }
      }

      res.json(updatedTransaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to update transaction" });
    }
  });

  // Verification log routes
  // Get verification logs for a land
  app.get("/api/verification-logs/land/:landId", isAuthenticated, async (req, res) => {
    try {
      const landId = parseInt(req.params.landId);
      if (isNaN(landId)) {
        return res.status(400).json({ message: "Invalid land ID" });
      }

      const logs = await storage.getVerificationLogsByLand(landId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch verification logs" });
    }
  });

  // Get verification logs by verifier
  app.get("/api/verification-logs/verifier", isAuthenticated, hasRole([UserRole.VERIFIER]), async (req, res) => {
    try {
      const logs = await storage.getVerificationLogsByVerifier(req.user.id);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch verification logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
