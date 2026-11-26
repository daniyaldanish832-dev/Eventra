CREATE TABLE "users" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"password" text NOT NULL,
	"role" text DEFAULT 'Attendee' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
