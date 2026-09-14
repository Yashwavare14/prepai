import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL:        z.string().min(1, "DATABASE_URL is required"),
  GEMINI_API_KEY:      z.string().optional(),
  PDF_PARSER_API_URL:  z.string().optional().transform((v) => (v && v.trim() ? v.trim() : "http://localhost:3001")),
  PDF_PARSER_PROVIDER: z.string().optional().transform((v) => (v && v.trim() ? v.trim() : "gemini")),
  PDF_PARSER_MODEL:    z.string().optional().transform((v) => (v && v.trim() ? v.trim() : "gemini-2.5-flash")),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Missing environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration. Check your .env.local file.");
}

export const env = parsed.data;
