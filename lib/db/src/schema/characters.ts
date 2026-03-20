import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { partiesTable } from "./parties";

export const charactersTable = pgTable("characters", {
  id: serial("id").primaryKey(),
  partyId: integer("party_id").references(() => partiesTable.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  playerName: text("player_name").notNull(),
  characterClass: text("character_class").notNull(),
  race: text("race").notNull(),
  level: integer("level").notNull().default(1),
  summary: text("summary"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCharacterSchema = createInsertSchema(charactersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Character = typeof charactersTable.$inferSelect;
