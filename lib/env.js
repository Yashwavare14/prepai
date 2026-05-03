import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL:    z.string().min(1, "DATABASE_URL is required"),
  GEMINI_API_KEY:  z.string().min(1, "GEMINI_API_KEY is required"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Missing environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration. Check your .env.local file.");
}

export const env = parsed.data;
