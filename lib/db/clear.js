import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

const { default: db } = await import("./index.js");
const { sql } = await import("drizzle-orm");

async function clear() {
  console.log("🧹 Clearing all questions and PDF sources from database...");

  // TRUNCATE empties the tables and RESTART IDENTITY resets auto-increment IDs back to 1
  await db.execute(sql`TRUNCATE TABLE questions, pdf_sources RESTART IDENTITY CASCADE;`);

  console.log("✅ Successfully cleared all questions and PDF sources. Database is fresh!");
  process.exit(0);
}

clear().catch((err) => {
  console.error("❌ Failed to clear database:", err);
  process.exit(1);
});
