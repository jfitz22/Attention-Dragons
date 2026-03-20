import express, { Router } from "express";
import path from "path";
import {
  createAsset,
  deleteAsset,
  getMaxUploadBytes,
  isAllowedAssetMimeType,
  listAssets,
  resolveAssetFile,
} from "../lib/assets";
import { isAuthorizedDm } from "../lib/dm-auth";

const router = Router();

router.get("/", async (_req, res) => {
  const assets = await listAssets();
  res.json(assets);
});

router.post(
  "/",
  express.raw({ type: () => true, limit: getMaxUploadBytes() }),
  async (req, res) => {
    const dmKey = req.header("x-dm-key") ?? undefined;
    if (!isAuthorizedDm(dmKey)) {
      res.status(403).json({ error: "DM authorization required" });
      return;
    }

    const filename = req.query["filename"];
    const contentType = req.header("content-type") ?? undefined;

    if (typeof filename !== "string" || filename.trim() === "") {
      res.status(400).json({ error: "filename is required" });
      return;
    }
    if (!isAllowedAssetMimeType(contentType)) {
      res.status(400).json({ error: "Only png, webp, and gif uploads are supported" });
      return;
    }
    if (!Buffer.isBuffer(req.body)) {
      res.status(400).json({ error: "Expected binary image body" });
      return;
    }

    try {
      const asset = await createAsset({
        filename: path.basename(filename),
        mimeType: contentType,
        contents: req.body,
      });
      res.status(201).json(asset);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "Failed to upload asset",
      });
    }
  },
);

router.get("/:assetId/file", async (req, res) => {
  const asset = await resolveAssetFile(req.params.assetId);
  if (!asset) {
    res.status(404).json({ error: "Asset not found" });
    return;
  }

  res.type(asset.mimeType);
  res.sendFile(asset.storagePath);
});

router.delete("/:assetId", async (req, res) => {
  const dmKey = req.header("x-dm-key") ?? undefined;
  if (!isAuthorizedDm(dmKey)) {
    res.status(403).json({ error: "DM authorization required" });
    return;
  }

  const deleted = await deleteAsset(req.params.assetId);
  if (!deleted) {
    res.status(404).json({ error: "Asset not found" });
    return;
  }

  res.status(204).send();
});

export default router;
