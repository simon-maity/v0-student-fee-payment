import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function setupCommittee() {
  try {
    console.log("[v0] Creating committee_users table...");

    // Create committee_users table
    await sql`
      CREATE TABLE IF NOT EXISTS committee_users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INT REFERENCES admin_users(id) ON DELETE SET NULL
      )
    `;

    console.log("[v0] Creating indexes...");

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_committee_email ON committee_users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_committee_username ON committee_users(username)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_committee_status ON committee_users(status)`;

    console.log("[v0] ✅ Committee table created successfully!");
  } catch (error) {
    console.error("[v0] Error setting up committee table:", error);
    process.exit(1);
  }
}

setupCommittee();
