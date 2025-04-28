import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";
import { hashPassword } from "../server/auth";

// Required for Neon serverless
neonConfig.webSocketConstructor = ws;

async function fixAdminPasswords() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log("Fixing admin and verifier passwords...");
    
    // Hash the admin password
    const adminPassword = await hashPassword("admin123");
    await pool.query(
      "UPDATE users SET password = $1 WHERE username = 'admin'",
      [adminPassword]
    );
    console.log("Admin password updated");
    
    // Hash the verifier password
    const verifierPassword = await hashPassword("verifier123");
    await pool.query(
      "UPDATE users SET password = $1 WHERE username = 'verifier'",
      [verifierPassword]
    );
    console.log("Verifier password updated");
    
    console.log("Password updates completed successfully");
  } catch (error) {
    console.error("Password updates failed:", error);
  } finally {
    await pool.end();
  }
}

fixAdminPasswords().catch(console.error);