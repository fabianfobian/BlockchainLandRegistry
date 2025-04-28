import { pgTable, text, serial, integer, boolean, timestamp, varchar, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles
export enum UserRole {
  LANDOWNER = "landowner",
  BUYER = "buyer",
  VERIFIER = "verifier",
  ADMIN = "admin"
}

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role").$type<UserRole>().notNull().default(UserRole.LANDOWNER),
  walletAddress: text("wallet_address"),
  createdAt: timestamp("created_at").defaultNow()
});

// Land status
export enum LandStatus {
  PENDING = "pending",
  VERIFIED = "verified",
  REJECTED = "rejected",
  TRANSFER_PENDING = "transfer_pending"
}

// Property Type
export enum PropertyType {
  RESIDENTIAL = "residential",
  COMMERCIAL = "commercial",
  AGRICULTURAL = "agricultural",
  INDUSTRIAL = "industrial"
}

// Land properties
export const lands = pgTable("lands", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  area: integer("area").notNull(), // in sq.ft.
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code"),
  propertyType: text("property_type").$type<PropertyType>().notNull(),
  yearBuilt: integer("year_built"),
  status: text("status").$type<LandStatus>().notNull().default(LandStatus.PENDING),
  ownerId: integer("owner_id").notNull(), // References users table
  location: json("location"), // For storing lat/long coordinates
  tokenId: text("token_id"), // NFT token ID once minted
  documents: json("documents"), // Array of document IDs stored on IPFS
  price: integer("price"), // Price if listed for sale, in wei
  isForSale: boolean("is_for_sale").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  landId: integer("land_id").notNull(), // References lands table
  fromUserId: integer("from_user_id").notNull(), // References users table
  toUserId: integer("to_user_id").notNull(), // References users table
  price: integer("price").notNull(), // in wei
  status: text("status").notNull(), // pending, completed, rejected
  txHash: text("tx_hash"), // Transaction hash on the blockchain
  escrowId: text("escrow_id"), // ID in the escrow contract
  verifierId: integer("verifier_id"), // User ID of the verifier who approved
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow()
});

// Verification logs
export const verificationLogs = pgTable("verification_logs", {
  id: serial("id").primaryKey(),
  landId: integer("land_id").notNull(), // References lands table
  verifierId: integer("verifier_id").notNull(), // References users table
  action: text("action").notNull(), // approved, rejected
  reason: text("reason"),
  txHash: text("tx_hash"), // Transaction hash if applicable
  createdAt: timestamp("created_at").defaultNow()
});

// Schema for user insertion
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

// Schema for land insertion
export const insertLandSchema = createInsertSchema(lands).omit({
  id: true,
  tokenId: true,
  status: true, 
  createdAt: true,
  updatedAt: true
});

// Schema for transaction insertion
export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  txHash: true,
  verifierId: true,
  verifiedAt: true,
  createdAt: true
});

// Schema for verification log insertion
export const insertVerificationLogSchema = createInsertSchema(verificationLogs).omit({
  id: true,
  createdAt: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Land = typeof lands.$inferSelect;
export type InsertLand = z.infer<typeof insertLandSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type VerificationLog = typeof verificationLogs.$inferSelect;
export type InsertVerificationLog = z.infer<typeof insertVerificationLogSchema>;
