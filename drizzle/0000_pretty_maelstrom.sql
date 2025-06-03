CREATE TABLE "users_table" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"age" integer NOT NULL,
	"email" text NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "users_table_email_unique" UNIQUE("email")
);
