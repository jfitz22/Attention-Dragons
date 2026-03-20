import { Router } from "express";
import { db } from "@workspace/db";
import { charactersTable, itemsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import {
  GetCharacterParams,
  CreateCharacterBody,
  UpdateCharacterParams,
  UpdateCharacterBody,
  TriggerRestParams,
  TriggerRestBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (_req, res) => {
  const characters = await db.select().from(charactersTable).orderBy(charactersTable.createdAt);
  res.json(characters);
});

router.post("/", async (req, res) => {
  const parsed = CreateCharacterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const [character] = await db
    .insert(charactersTable)
    .values({
      name: parsed.data.name,
      playerName: parsed.data.playerName,
      characterClass: parsed.data.characterClass,
      race: parsed.data.race,
      level: parsed.data.level,
      summary: parsed.data.summary ?? null,
      avatarUrl: parsed.data.avatarUrl ?? null,
      partyId: parsed.data.partyId ?? null,
    })
    .returning();
  res.status(201).json(character);
});

router.get("/:characterId", async (req, res) => {
  const parsed = GetCharacterParams.safeParse({ characterId: Number(req.params.characterId) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid characterId" });
    return;
  }
  const [character] = await db
    .select()
    .from(charactersTable)
    .where(eq(charactersTable.id, parsed.data.characterId));
  if (!character) {
    res.status(404).json({ error: "Character not found" });
    return;
  }
  res.json(character);
});

router.put("/:characterId", async (req, res) => {
  const paramsParsed = UpdateCharacterParams.safeParse({ characterId: Number(req.params.characterId) });
  const bodyParsed = UpdateCharacterBody.safeParse(req.body);
  if (!paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { characterId } = paramsParsed.data;
  const data = bodyParsed.data;
  const [character] = await db
    .update(charactersTable)
    .set({
      name: data.name,
      playerName: data.playerName,
      characterClass: data.characterClass,
      race: data.race,
      level: data.level,
      summary: data.summary ?? null,
      avatarUrl: data.avatarUrl ?? null,
      partyId: data.partyId ?? null,
      updatedAt: new Date(),
    })
    .where(eq(charactersTable.id, characterId))
    .returning();
  if (!character) {
    res.status(404).json({ error: "Character not found" });
    return;
  }
  res.json(character);
});

router.post("/:characterId/rest", async (req, res) => {
  const paramsParsed = TriggerRestParams.safeParse({ characterId: Number(req.params.characterId) });
  const bodyParsed = TriggerRestBody.safeParse(req.body);
  if (!paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { characterId } = paramsParsed.data;
  const { restType } = bodyParsed.data;

  const items = await db
    .select()
    .from(itemsTable)
    .where(and(eq(itemsTable.characterId, characterId), eq(itemsTable.isConsumed, false), eq(itemsTable.isTrashed, false)));

  const updatedItems = [];
  for (const item of items) {
    if (item.maxCharges == null || item.currentCharges == null) {
      updatedItems.push(item);
      continue;
    }
    let shouldRecharge = false;
    if (item.rechargeOn === "short_rest" || item.rechargeOn === "long_rest") {
      shouldRecharge = restType === "long_rest" || item.rechargeOn === restType;
    }
    if (shouldRecharge && item.currentCharges < item.maxCharges) {
      const [updated] = await db
        .update(itemsTable)
        .set({ currentCharges: item.maxCharges, updatedAt: new Date() })
        .where(eq(itemsTable.id, item.id))
        .returning();
      updatedItems.push(updated);
    } else {
      updatedItems.push(item);
    }
  }

  res.json(updatedItems);
});

export default router;
