import { integer, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const MockInterview=pgTable('MockInterview',{
    id:serial('id').primaryKey(),
    jsonMockResp:text('jsonMockResp').notNull(),
    jobPosition:varchar('jobPosition'),
    jobType:varchar('jobType').notNull(),
    jobExperience:varchar('jobExperience'),
    createdBy:varchar('createdBy').notNull(),
    createdAt:varchar('createdAt'),
    mockId:varchar('mockId').notNull()
})

export const UserAnswer = pgTable('userAnswer',{
    id:serial('id').primaryKey(),
    mockIdRef:varchar('mockId').notNull(),
    question:text('question').notNull(),
    correctAns:text('correctAns'),
    userAns:text('userAns'),
    feedback:text('feedback'),
    rating:integer('rating'),
    userEmail:varchar('userEmail'),
    createdAt:varchar('createdAt')
})

export const UserAnalysis = pgTable('userAnalysis',{
    id:serial('id').primaryKey(),
    mockIdRef:varchar('mockId').notNull(),
    question:text('question'),
    feedback:text('feedback'),
    feedbacktype:text('feedbackType'),
    rating:integer('rating'),
    userEmail:varchar('userEmail'),
    createdAt:varchar('createdAt')
})