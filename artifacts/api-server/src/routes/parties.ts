import { Router } from "express";
import { db } from "@workspace/db";
import { partiesTable } from "@workspace/db/schema";

const router = Router();

router.get("/", async (_req, res) => {
  const parties = await db.select().from(partiesTable).orderBy(partiesTable.createdAt);
  res.json(parties);
});

router.post("/", async (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== "string") {
    res.status(400).json({ error: "name is required" });
    return;
  }
  const [party] = await db.insert(partiesTable).values({ name }).returning();
  res.status(201).json(party);
});

export default router;
