import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.js",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
