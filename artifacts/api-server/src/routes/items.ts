import { Router } from "express";
import { db } from "@workspace/db";
import { itemsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import type { ItemCategory, ItemLocation, RechargeOn, Rarity } from "@workspace/db/schema";
import {
  ListItemsParams,
  ListItemsQueryParams,
  CreateItemParams,
  CreateItemBody,
  GetItemParams,
  UpdateItemParams,
  UpdateItemBody,
  DeleteItemParams,
  UseItemParams,
  MoveItemParams,
  MoveItemBody,
} from "@workspace/api-zod";

const router = Router({ mergeParams: true });

router.get("/", async (req, res) => {
  const p = req.params as Record<string, string>;
  const paramsParsed = ListItemsParams.safeParse({ characterId: Number(p.characterId) });
  const queryParsed = ListItemsQueryParams.safeParse(req.query);
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid characterId" });
    return;
  }
  const { characterId } = paramsParsed.data;
  const query = queryParsed.success ? queryParsed.data : {};

  let items = await db
    .select()
    .from(itemsTable)
    .where(and(eq(itemsTable.characterId, characterId), eq(itemsTable.isTrashed, false)))
    .orderBy(itemsTable.createdAt);

  if (query.category) {
    items = items.filter((i) => i.category === query.category);
  }
  if (query.search) {
    const searchLower = query.search.toLowerCase();
    items = items.filter(
      (i) =>
        i.name.toLowerCase().includes(searchLower) ||
        i.description.toLowerCase().includes(searchLower)
    );
  }
  if (!query.showConsumed) {
    items = items.filter((i) => !i.isConsumed);
  }

  res.json(items);
});

router.post("/", async (req, res) => {
  const p = req.params as Record<string, string>;
  const paramsParsed = CreateItemParams.safeParse({ characterId: Number(p.characterId) });
  const bodyParsed = CreateItemBody.safeParse(req.body);
  if (!paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { characterId } = paramsParsed.data;
  const data = bodyParsed.data;

  const location = (data.location ?? (data.isEquipped ? "equipped" : "carried")) as ItemLocation;

  const [item] = await db
    .insert(itemsTable)
    .values({
      characterId,
      name: data.name,
      category: data.category as ItemCategory,
      description: data.description,
      notes: data.notes ?? null,
      imageUrl: data.imageUrl ?? null,
      quantity: data.quantity ?? 1,
      location,
      isEquipped: location === "equipped",
      maxCharges: data.maxCharges ?? null,
      currentCharges: data.currentCharges ?? data.maxCharges ?? null,
      rechargeOn: (data.rechargeOn ?? null) as RechargeOn | null,
      rarity: (data.rarity ?? null) as Rarity | null,
      isConsumable: data.isConsumable,
      isConsumed: false,
      isTrashed: false,
    })
    .returning();
  res.status(201).json(item);
});

router.get("/:itemId", async (req, res) => {
  const p = req.params as Record<string, string>;
  const parsed = GetItemParams.safeParse({
    characterId: Number(p.characterId),
    itemId: Number(p.itemId),
  });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const [item] = await db
    .select()
    .from(itemsTable)
    .where(and(eq(itemsTable.id, parsed.data.itemId), eq(itemsTable.characterId, parsed.data.characterId)));
  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  res.json(item);
});

router.put("/:itemId", async (req, res) => {
  const p = req.params as Record<string, string>;
  const paramsParsed = UpdateItemParams.safeParse({
    characterId: Number(p.characterId),
    itemId: Number(p.itemId),
  });
  const bodyParsed = UpdateItemBody.safeParse(req.body);
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const { itemId, characterId } = paramsParsed.data;
  const data = bodyParsed.success ? bodyParsed.data : {};

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.name !== undefined) updateData.name = data.name;
  if (data.category !== undefined) updateData.category = data.category as ItemCategory;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.notes !== undefined) updateData.notes = data.notes ?? null;
  if (data.quantity !== undefined) updateData.quantity = data.quantity;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl ?? null;
  if (data.location !== undefined) {
    updateData.location = data.location as ItemLocation;
    updateData.isEquipped = data.location === "equipped";
  } else if (data.isEquipped !== undefined) {
    updateData.isEquipped = data.isEquipped;
    updateData.location = (data.isEquipped ? "equipped" : "carried") as ItemLocation;
  }
  if (data.maxCharges !== undefined) updateData.maxCharges = data.maxCharges ?? null;
  if (data.currentCharges !== undefined) updateData.currentCharges = data.currentCharges ?? null;
  if (data.rechargeOn !== undefined) updateData.rechargeOn = (data.rechargeOn ?? null) as RechargeOn | null;
  if (data.rarity !== undefined) updateData.rarity = (data.rarity ?? null) as Rarity | null;
  if (data.isConsumable !== undefined) updateData.isConsumable = data.isConsumable;

  const [item] = await db
    .update(itemsTable)
    .set(updateData)
    .where(and(eq(itemsTable.id, itemId), eq(itemsTable.characterId, characterId)))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  res.json(item);
});

router.delete("/:itemId", async (req, res) => {
  const p = req.params as Record<string, string>;
  const parsed = DeleteItemParams.safeParse({
    characterId: Number(p.characterId),
    itemId: Number(p.itemId),
  });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  await db
    .update(itemsTable)
    .set({ isTrashed: true, updatedAt: new Date() })
    .where(and(eq(itemsTable.id, parsed.data.itemId), eq(itemsTable.characterId, parsed.data.characterId)));
  res.status(204).send();
});

router.post("/:itemId/use", async (req, res) => {
  const p = req.params as Record<string, string>;
  const parsed = UseItemParams.safeParse({
    characterId: Number(p.characterId),
    itemId: Number(p.itemId),
  });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const [existing] = await db
    .select()
    .from(itemsTable)
    .where(and(eq(itemsTable.id, parsed.data.itemId), eq(itemsTable.characterId, parsed.data.characterId)));

  if (!existing) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };

  if (existing.isConsumable) {
    updateData.isConsumed = true;
    updateData.isEquipped = false;
    updateData.location = "stored" as ItemLocation;
  } else if (existing.currentCharges != null && existing.currentCharges > 0) {
    updateData.currentCharges = existing.currentCharges - 1;
    if (existing.rechargeOn === "never" && updateData.currentCharges === 0) {
      updateData.isConsumed = true;
      updateData.isEquipped = false;
      updateData.location = "stored" as ItemLocation;
    }
  }

  const [item] = await db
    .update(itemsTable)
    .set(updateData)
    .where(eq(itemsTable.id, parsed.data.itemId))
    .returning();
  res.json(item);
});

router.post("/:itemId/location", async (req, res) => {
  const p = req.params as Record<string, string>;
  const paramsParsed = MoveItemParams.safeParse({
    characterId: Number(p.characterId),
    itemId: Number(p.itemId),
  });
  const bodyParsed = MoveItemBody.safeParse(req.body);
  if (!paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const { itemId, characterId } = paramsParsed.data;
  const location = bodyParsed.data.location as ItemLocation;

  const [item] = await db
    .update(itemsTable)
    .set({
      location,
      isEquipped: location === "equipped",
      updatedAt: new Date(),
    })
    .where(and(eq(itemsTable.id, itemId), eq(itemsTable.characterId, characterId)))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  res.json(item);
});

export default router;
