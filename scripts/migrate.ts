import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";
import * as schema from "../shared/schema";

// Required for Neon serverless
neonConfig.webSocketConstructor = ws;

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  // This will automatically create tables based on your schema
  console.log("Running migrations...");
  
  try {
    // Create tables for all schemas
    const createTablesQueries = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL,
        wallet_address TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      // Lands table
      `CREATE TABLE IF NOT EXISTS lands (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        area NUMERIC NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        postal_code TEXT,
        property_type TEXT NOT NULL,
        year_built INTEGER,
        owner_id INTEGER NOT NULL REFERENCES users(id),
        status TEXT NOT NULL,
        token_id TEXT,
        is_for_sale BOOLEAN NOT NULL DEFAULT FALSE,
        price NUMERIC,
        documents JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      // Transactions table
      `CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        land_id INTEGER NOT NULL REFERENCES lands(id),
        from_user_id INTEGER NOT NULL REFERENCES users(id),
        to_user_id INTEGER NOT NULL REFERENCES users(id),
        price NUMERIC NOT NULL,
        status TEXT NOT NULL,
        tx_hash TEXT,
        verifier_id INTEGER REFERENCES users(id),
        verified_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      // Verification logs table
      `CREATE TABLE IF NOT EXISTS verification_logs (
        id SERIAL PRIMARY KEY,
        land_id INTEGER NOT NULL REFERENCES lands(id),
        verifier_id INTEGER NOT NULL REFERENCES users(id),
        status TEXT NOT NULL,
        comments TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`
    ];
    
    // Run each query
    for (const query of createTablesQueries) {
      await pool.query(query);
    }
    
    console.log("Migration completed successfully");
    
    // Insert admin and verifier users if they don't exist
    const adminExists = await pool.query(
      "SELECT * FROM users WHERE username = 'admin' LIMIT 1"
    );
    
    if (adminExists.rows.length === 0) {
      await pool.query(
        "INSERT INTO users (username, email, password, full_name, role) VALUES ($1, $2, $3, $4, $5)",
        ["admin", "admin@landregistry.com", "$2b$10$vfbQXJgJcFXqZylpAYbl1.h3SFNnbYZu0AvnXOuCZu.T/wNfzAXkK", "System Administrator", "admin"]
      );
      console.log("Admin user created");
    }
    
    const verifierExists = await pool.query(
      "SELECT * FROM users WHERE username = 'verifier' LIMIT 1"
    );
    
    if (verifierExists.rows.length === 0) {
      await pool.query(
        "INSERT INTO users (username, email, password, full_name, role) VALUES ($1, $2, $3, $4, $5)",
        ["verifier", "verifier@gov.org", "$2b$10$w1J8Ktn.szABnFj0/kl6v.a/3GEPXzLlkxh/L4b9id4YYBp09wwLK", "Government Verifier", "verifier"]
      );
      console.log("Verifier user created");
    }
    
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await pool.end();
  }
}

runMigrations().catch(console.error);