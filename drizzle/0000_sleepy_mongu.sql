CREATE TABLE "pdf_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" varchar(255) NOT NULL,
	"exam" varchar(100),
	"topic" varchar(100),
	"status" varchar(20) DEFAULT 'processed',
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"options" jsonb NOT NULL,
	"correct_answer" char(1) NOT NULL,
	"explanation" text,
	"topic" varchar(100) NOT NULL,
	"exam" varchar(100),
	"difficulty" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'approved',
	"source" varchar(255),
	"embedding" vector(768),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "idx_questions_topic" ON "questions" USING btree ("topic");--> statement-breakpoint
CREATE INDEX "idx_questions_exam" ON "questions" USING btree ("exam");--> statement-breakpoint
CREATE INDEX "idx_questions_difficulty" ON "questions" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "idx_questions_status" ON "questions" USING btree ("status");