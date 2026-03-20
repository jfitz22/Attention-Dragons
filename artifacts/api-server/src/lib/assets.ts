import path from "path";
import { randomUUID } from "crypto";
import { mkdir, readFile, rm, stat, unlink, writeFile } from "fs/promises";

const APP_DATA_DIR = path.resolve(
  process.env["PARTY_TRACKER_APPDATA_DIR"] || process.cwd(),
  "appdata",
);
const ASSET_DIR = path.join(APP_DATA_DIR, "assets");
const METADATA_PATH = path.join(APP_DATA_DIR, "asset-library.json");
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Map<string, string>([
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);

export interface AssetRecord {
  id: string;
  filename: string;
  mimeType: string;
  kind: "shared";
  storagePath: string;
  publicUrl: string;
  createdAt: string;
}

function sanitizeBaseName(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 48) || "asset";
}

async function ensureStorage() {
  await mkdir(ASSET_DIR, { recursive: true });
  await mkdir(APP_DATA_DIR, { recursive: true });
}

async function readMetadata(): Promise<AssetRecord[]> {
  try {
    const raw = await readFile(METADATA_PATH, "utf-8");
    const parsed = JSON.parse(raw) as AssetRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeMetadata(records: AssetRecord[]) {
  await ensureStorage();
  await writeFile(METADATA_PATH, JSON.stringify(records, null, 2), "utf-8");
}

export async function listAssets(): Promise<AssetRecord[]> {
  const records = await readMetadata();
  return records.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function createAsset(input: {
  filename: string;
  mimeType: string;
  contents: Buffer;
}): Promise<AssetRecord> {
  if (!ALLOWED_IMAGE_TYPES.has(input.mimeType)) {
    throw new Error("Unsupported image type");
  }
  if (input.contents.byteLength === 0) {
    throw new Error("File is empty");
  }
  if (input.contents.byteLength > MAX_UPLOAD_BYTES) {
    throw new Error("File exceeds 2MB limit");
  }

  await ensureStorage();

  const id = randomUUID();
  const extension = ALLOWED_IMAGE_TYPES.get(input.mimeType)!;
  const safeName = sanitizeBaseName(input.filename);
  const storedFilename = `${id}-${safeName}${extension}`;
  const absolutePath = path.join(ASSET_DIR, storedFilename);

  await writeFile(absolutePath, input.contents);

  const record: AssetRecord = {
    id,
    filename: input.filename,
    mimeType: input.mimeType,
    kind: "shared",
    storagePath: absolutePath,
    publicUrl: `/api/assets/${id}/file`,
    createdAt: new Date().toISOString(),
  };

  const records = await readMetadata();
  records.push(record);
  await writeMetadata(records);

  return record;
}

export async function getAsset(assetId: string): Promise<AssetRecord | null> {
  const records = await readMetadata();
  return records.find((record) => record.id === assetId) ?? null;
}

export async function resolveAssetFile(assetId: string): Promise<AssetRecord | null> {
  const record = await getAsset(assetId);
  if (!record) return null;

  try {
    await stat(record.storagePath);
    return record;
  } catch {
    return null;
  }
}

export async function deleteAsset(assetId: string): Promise<boolean> {
  const records = await readMetadata();
  const record = records.find((entry) => entry.id === assetId);
  if (!record) return false;

  await unlink(record.storagePath).catch(async () => {
    await rm(record.storagePath, { force: true });
  });
  await writeMetadata(records.filter((entry) => entry.id !== assetId));
  return true;
}

export function getMaxUploadBytes() {
  return MAX_UPLOAD_BYTES;
}

export function isAllowedAssetMimeType(mimeType: string | undefined): mimeType is string {
  return typeof mimeType === "string" && ALLOWED_IMAGE_TYPES.has(mimeType);
}

