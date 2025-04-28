import { 
  users, User, InsertUser, 
  lands, Land, InsertLand, 
  transactions, Transaction, InsertTransaction,
  verificationLogs, VerificationLog, InsertVerificationLog,
  LandStatus, UserRole
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserWallet(id: number, walletAddress: string): Promise<User | undefined>;
  
  // Land methods
  createLand(land: InsertLand): Promise<Land>;
  getLand(id: number): Promise<Land | undefined>;
  getLandsByOwner(ownerId: number): Promise<Land[]>;
  getLandsByStatus(status: LandStatus): Promise<Land[]>;
  updateLandStatus(id: number, status: LandStatus): Promise<Land | undefined>;
  updateLandOwner(id: number, newOwnerId: number): Promise<Land | undefined>;
  getVerifiedLandsForSale(): Promise<Land[]>;
  updateLandForSale(id: number, isForSale: boolean, price?: number): Promise<Land | undefined>;
  
  // Transaction methods
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByUser(userId: number): Promise<Transaction[]>;
  getPendingTransactions(): Promise<Transaction[]>;
  updateTransactionStatus(id: number, status: string, txHash?: string): Promise<Transaction | undefined>;
  
  // Verification log methods
  createVerificationLog(log: InsertVerificationLog): Promise<VerificationLog>;
  getVerificationLogsByLand(landId: number): Promise<VerificationLog[]>;
  getVerificationLogsByVerifier(verifierId: number): Promise<VerificationLog[]>;
  
  // System methods
  getStats(): Promise<any>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private usersStore: Map<number, User>;
  private landsStore: Map<number, Land>;
  private transactionsStore: Map<number, Transaction>;
  private verificationLogsStore: Map<number, VerificationLog>;
  private currentUserId: number;
  private currentLandId: number;
  private currentTransactionId: number;
  private currentVerificationLogId: number;
  
  public sessionStore: session.SessionStore;

  constructor() {
    this.usersStore = new Map();
    this.landsStore = new Map();
    this.transactionsStore = new Map();
    this.verificationLogsStore = new Map();
    this.currentUserId = 1;
    this.currentLandId = 1;
    this.currentTransactionId = 1;
    this.currentVerificationLogId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Create initial admin user
    this.createUser({
      username: "admin",
      password: "admin123", // This will be hashed by auth.ts
      email: "admin@landregistry.com",
      fullName: "System Administrator",
      role: UserRole.ADMIN
    });
    
    // Create initial verifier user
    this.createUser({
      username: "verifier",
      password: "verifier123", // This will be hashed by auth.ts
      email: "verifier@gov.org",
      fullName: "Government Verifier",
      role: UserRole.VERIFIER
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersStore.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersStore.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersStore.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.usersStore.set(id, user);
    return user;
  }
  
  async updateUserWallet(id: number, walletAddress: string): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, walletAddress };
    this.usersStore.set(id, updatedUser);
    return updatedUser;
  }

  // Land methods
  async createLand(insertLand: InsertLand): Promise<Land> {
    const id = this.currentLandId++;
    const land: Land = { 
      ...insertLand,
      id,
      status: LandStatus.PENDING,
      tokenId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.landsStore.set(id, land);
    return land;
  }

  async getLand(id: number): Promise<Land | undefined> {
    return this.landsStore.get(id);
  }

  async getLandsByOwner(ownerId: number): Promise<Land[]> {
    return Array.from(this.landsStore.values()).filter(
      (land) => land.ownerId === ownerId
    );
  }

  async getLandsByStatus(status: LandStatus): Promise<Land[]> {
    return Array.from(this.landsStore.values()).filter(
      (land) => land.status === status
    );
  }

  async updateLandStatus(id: number, status: LandStatus): Promise<Land | undefined> {
    const land = await this.getLand(id);
    if (!land) return undefined;
    
    const updatedLand = { 
      ...land, 
      status, 
      updatedAt: new Date() 
    };
    this.landsStore.set(id, updatedLand);
    return updatedLand;
  }

  async updateLandOwner(id: number, newOwnerId: number): Promise<Land | undefined> {
    const land = await this.getLand(id);
    if (!land) return undefined;
    
    const updatedLand = { 
      ...land, 
      ownerId: newOwnerId,
      isForSale: false,
      status: LandStatus.VERIFIED,
      updatedAt: new Date() 
    };
    this.landsStore.set(id, updatedLand);
    return updatedLand;
  }

  async getVerifiedLandsForSale(): Promise<Land[]> {
    return Array.from(this.landsStore.values()).filter(
      (land) => land.status === LandStatus.VERIFIED && land.isForSale
    );
  }

  async updateLandForSale(id: number, isForSale: boolean, price?: number): Promise<Land | undefined> {
    const land = await this.getLand(id);
    if (!land) return undefined;
    
    const updatedLand = { 
      ...land, 
      isForSale,
      price: price || land.price,
      updatedAt: new Date() 
    };
    this.landsStore.set(id, updatedLand);
    return updatedLand;
  }

  // Transaction methods
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      txHash: null,
      verifierId: null,
      verifiedAt: null,
      createdAt: new Date()
    };
    this.transactionsStore.set(id, transaction);
    return transaction;
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactionsStore.get(id);
  }

  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactionsStore.values()).filter(
      (transaction) => 
        transaction.fromUserId === userId || 
        transaction.toUserId === userId
    );
  }

  async getPendingTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactionsStore.values()).filter(
      (transaction) => transaction.status === "pending"
    );
  }

  async updateTransactionStatus(
    id: number, 
    status: string, 
    txHash?: string
  ): Promise<Transaction | undefined> {
    const transaction = await this.getTransaction(id);
    if (!transaction) return undefined;
    
    const updatedTransaction: Transaction = {
      ...transaction,
      status,
      ...(txHash ? { txHash } : {})
    };
    this.transactionsStore.set(id, updatedTransaction);
    return updatedTransaction;
  }

  // Verification log methods
  async createVerificationLog(insertLog: InsertVerificationLog): Promise<VerificationLog> {
    const id = this.currentVerificationLogId++;
    const log: VerificationLog = {
      ...insertLog,
      id,
      createdAt: new Date()
    };
    this.verificationLogsStore.set(id, log);
    return log;
  }

  async getVerificationLogsByLand(landId: number): Promise<VerificationLog[]> {
    return Array.from(this.verificationLogsStore.values()).filter(
      (log) => log.landId === landId
    );
  }

  async getVerificationLogsByVerifier(verifierId: number): Promise<VerificationLog[]> {
    return Array.from(this.verificationLogsStore.values()).filter(
      (log) => log.verifierId === verifierId
    );
  }

  // System stats
  async getStats(): Promise<any> {
    const userCount = this.usersStore.size;
    const verifierCount = Array.from(this.usersStore.values()).filter(
      user => user.role === UserRole.VERIFIER
    ).length;
    
    const landCount = this.landsStore.size;
    const pendingRegistrations = Array.from(this.landsStore.values()).filter(
      land => land.status === LandStatus.PENDING
    ).length;
    
    const pendingTransfers = Array.from(this.landsStore.values()).filter(
      land => land.status === LandStatus.TRANSFER_PENDING
    ).length;
    
    const verifiedLands = Array.from(this.landsStore.values()).filter(
      land => land.status === LandStatus.VERIFIED
    ).length;
    
    const transactionCount = this.transactionsStore.size;
    
    return {
      userCount,
      verifierCount,
      landCount,
      pendingRegistrations,
      pendingTransfers,
      verifiedLands,
      transactionCount
    };
  }
}

export const storage = new MemStorage();
