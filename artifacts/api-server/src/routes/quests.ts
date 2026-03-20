import { Router } from "express";
import { db } from "@workspace/db";
import { questsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import {
  CreateQuestBody,
  UpdateQuestBody,
} from "@workspace/api-zod";

const router = Router({ mergeParams: true });

router.get("/", async (req, res) => {
  const p = req.params as Record<string, string>;
  const partyId = Number(p.partyId);
  if (isNaN(partyId)) {
    res.status(400).json({ error: "Invalid partyId" });
    return;
  }

  const { status } = req.query as Record<string, string>;

  let quests = await db
    .select()
    .from(questsTable)
    .where(eq(questsTable.partyId, partyId))
    .orderBy(questsTable.createdAt);

  if (status) {
    quests = quests.filter((q) => q.status === status);
  }

  res.json(quests);
});

router.post("/", async (req, res) => {
  const p = req.params as Record<string, string>;
  const partyId = Number(p.partyId);
  if (isNaN(partyId)) {
    res.status(400).json({ error: "Invalid partyId" });
    return;
  }

  const parsed = CreateQuestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: parsed.error.format() });
    return;
  }

  const { title, description, status } = parsed.data;

  const [quest] = await db
    .insert(questsTable)
    .values({
      partyId,
      title,
      description: description ?? "",
      status: status ?? "active",
    })
    .returning();
  res.status(201).json(quest);
});

router.get("/:questId", async (req, res) => {
  const p = req.params as Record<string, string>;
  const partyId = Number(p.partyId);
  const questId = Number(p.questId);
  if (isNaN(partyId) || isNaN(questId)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [quest] = await db
    .select()
    .from(questsTable)
    .where(and(eq(questsTable.id, questId), eq(questsTable.partyId, partyId)));

  if (!quest) {
    res.status(404).json({ error: "Quest not found" });
    return;
  }
  res.json(quest);
});

router.put("/:questId", async (req, res) => {
  const p = req.params as Record<string, string>;
  const partyId = Number(p.partyId);
  const questId = Number(p.questId);
  if (isNaN(partyId) || isNaN(questId)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const parsed = UpdateQuestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: parsed.error.format() });
    return;
  }

  const { title, description, status } = parsed.data;

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (status !== undefined) updateData.status = status;

  const [quest] = await db
    .update(questsTable)
    .set(updateData)
    .where(and(eq(questsTable.id, questId), eq(questsTable.partyId, partyId)))
    .returning();

  if (!quest) {
    res.status(404).json({ error: "Quest not found" });
    return;
  }
  res.json(quest);
});

router.delete("/:questId", async (req, res) => {
  const p = req.params as Record<string, string>;
  const partyId = Number(p.partyId);
  const questId = Number(p.questId);
  if (isNaN(partyId) || isNaN(questId)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  await db
    .delete(questsTable)
    .where(and(eq(questsTable.id, questId), eq(questsTable.partyId, partyId)));
  res.status(204).send();
});

export default router;
