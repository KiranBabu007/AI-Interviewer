CREATE TABLE "MockInterview" (
	"id" serial PRIMARY KEY NOT NULL,
	"jsonMockResp" text NOT NULL,
	"jobPosition" varchar,
	"jobType" varchar NOT NULL,
	"jobExperience" varchar,
	"createdBy" varchar NOT NULL,
	"createdAt" varchar,
	"mockId" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userAnalysis" (
	"id" serial PRIMARY KEY NOT NULL,
	"mockId" varchar NOT NULL,
	"question" text,
	"feedback" text,
	"feedbackType" text,
	"rating" integer,
	"userEmail" varchar,
	"createdAt" varchar
);
--> statement-breakpoint
CREATE TABLE "userAnswer" (
	"id" serial PRIMARY KEY NOT NULL,
	"mockId" varchar NOT NULL,
	"question" text NOT NULL,
	"correctAns" text,
	"userAns" text,
	"feedback" text,
	"rating" integer,
	"userEmail" varchar,
	"createdAt" varchar
);
