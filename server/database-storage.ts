import { 
  users, User, InsertUser, 
  lands, Land, InsertLand, 
  transactions, Transaction, InsertTransaction,
  verificationLogs, VerificationLog, InsertVerificationLog,
  LandStatus, UserRole
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { IStorage } from "./storage";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  public sessionStore: any; // Using any type for sessionStore

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values([insertUser]).returning();
    return user;
  }

  async updateUserWallet(id: number, walletAddress: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ walletAddress })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Land methods
  async createLand(insertLand: InsertLand): Promise<Land> {
    const [land] = await db.insert(lands).values([insertLand]).returning();
    return land;
  }

  async getLand(id: number): Promise<Land | undefined> {
    const [land] = await db.select().from(lands).where(eq(lands.id, id));
    return land;
  }

  async getLandsByOwner(ownerId: number): Promise<Land[]> {
    return await db.select().from(lands).where(eq(lands.ownerId, ownerId));
  }

  async getLandsByStatus(status: LandStatus): Promise<Land[]> {
    return await db.select().from(lands).where(eq(lands.status, status));
  }

  async updateLandStatus(id: number, status: LandStatus): Promise<Land | undefined> {
    const [land] = await db
      .update(lands)
      .set({ status })
      .where(eq(lands.id, id))
      .returning();
    return land;
  }

  async updateLandOwner(id: number, newOwnerId: number): Promise<Land | undefined> {
    const [land] = await db
      .update(lands)
      .set({ 
        ownerId: newOwnerId, 
        isForSale: false,
        status: LandStatus.VERIFIED 
      })
      .where(eq(lands.id, id))
      .returning();
    return land;
  }

  async getVerifiedLandsForSale(): Promise<Land[]> {
    return await db
      .select()
      .from(lands)
      .where(
        and(
          eq(lands.status, LandStatus.VERIFIED),
          eq(lands.isForSale, true)
        )
      );
  }

  async updateLandForSale(id: number, isForSale: boolean, price?: number): Promise<Land | undefined> {
    const updateValues: Partial<Land> = { isForSale };
    if (price !== undefined) {
      updateValues.price = price;
    }

    const [land] = await db
      .update(lands)
      .set(updateValues)
      .where(eq(lands.id, id))
      .returning();
    return land;
  }

  // Transaction methods
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values([insertTransaction])
      .returning();
    return transaction;
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));
    return transaction;
  }

  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(
        or(
          eq(transactions.fromUserId, userId),
          eq(transactions.toUserId, userId)
        )
      )
      .orderBy(desc(transactions.createdAt));
  }

  async getPendingTransactions(): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.status, "pending"))
      .orderBy(desc(transactions.createdAt));
  }

  async updateTransactionStatus(
    id: number,
    status: string,
    txHash?: string
  ): Promise<Transaction | undefined> {
    const updateValues: Partial<Transaction> = { status };
    if (txHash) {
      updateValues.txHash = txHash;
    }

    const [transaction] = await db
      .update(transactions)
      .set(updateValues)
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  }

  // Verification log methods
  async createVerificationLog(insertLog: InsertVerificationLog): Promise<VerificationLog> {
    const [log] = await db
      .insert(verificationLogs)
      .values([insertLog])
      .returning();
    return log;
  }

  async getVerificationLogsByLand(landId: number): Promise<VerificationLog[]> {
    return await db
      .select()
      .from(verificationLogs)
      .where(eq(verificationLogs.landId, landId))
      .orderBy(desc(verificationLogs.createdAt));
  }

  async getVerificationLogsByVerifier(verifierId: number): Promise<VerificationLog[]> {
    return await db
      .select()
      .from(verificationLogs)
      .where(eq(verificationLogs.verifierId, verifierId))
      .orderBy(desc(verificationLogs.createdAt));
  }

  // System methods
  async getStats(): Promise<any> {
    const [userCount] = await db.select({ count: users.id }).from(users);
    const [landCount] = await db.select({ count: lands.id }).from(lands);
    const [pendingVerifications] = await db
      .select({ count: lands.id })
      .from(lands)
      .where(eq(lands.status, LandStatus.PENDING));
    const [transactionCount] = await db
      .select({ count: transactions.id })
      .from(transactions);
    
    return {
      users: userCount?.count || 0,
      lands: landCount?.count || 0,
      pendingVerifications: pendingVerifications?.count || 0,
      transactions: transactionCount?.count || 0
    };
  }
}