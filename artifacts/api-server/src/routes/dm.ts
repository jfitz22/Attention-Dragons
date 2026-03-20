import { Router } from "express";
import { db } from "@workspace/db";
import { charactersTable, itemsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/overview", async (_req, res) => {
  const characters = await db.select().from(charactersTable).orderBy(charactersTable.name);
  const result = await Promise.all(
    characters.map(async (char) => {
      const items = await db
        .select()
        .from(itemsTable)
        .where(eq(itemsTable.characterId, char.id))
        .orderBy(itemsTable.category, itemsTable.name);
      return { ...char, items: items.filter((i) => !i.isTrashed) };
    })
  );
  res.json(result);
});

export default router;
