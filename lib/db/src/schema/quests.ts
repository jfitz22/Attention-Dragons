import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { partiesTable } from "./parties";

export const questStatusEnum = ["active", "completed", "failed"] as const;
export type QuestStatus = typeof questStatusEnum[number];

export const questsTable = pgTable("quests", {
  id: serial("id").primaryKey(),
  partyId: integer("party_id").references(() => partiesTable.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  status: text("status").notNull().default("active").$type<QuestStatus>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertQuestSchema = createInsertSchema(questsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertQuest = z.infer<typeof insertQuestSchema>;
export type Quest = typeof questsTable.$inferSelect;
