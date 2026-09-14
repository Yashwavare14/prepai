ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "metadata" jsonb;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_questions_year" ON "questions" USING btree ("year");