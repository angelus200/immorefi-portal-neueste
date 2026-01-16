// Preconfigured storage helpers for Manus WebDev templates
// Uses the Biz-provided storage proxy (Authorization: Bearer <token>)
// Falls back to local filesystem storage if ENV variables are missing

import { ENV } from './_core/env';
import fs from 'fs';
import path from 'path';

type StorageConfig = { baseUrl: string; apiKey: string };
type StorageMode = 'remote' | 'local';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function getStorageMode(): StorageMode {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;

  if (!baseUrl || !apiKey) {
    console.warn('[Storage] BUILT_IN_FORGE_API_URL or BUILT_IN_FORGE_API_KEY not set - using local filesystem storage');
    return 'local';
  }

  return 'remote';
}

function getStorageConfig(): StorageConfig {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

function buildUploadUrl(baseUrl: string, relKey: string): URL {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}

async function buildDownloadUrl(
  baseUrl: string,
  relKey: string,
  apiKey: string
): Promise<string> {
  const downloadApiUrl = new URL(
    "v1/storage/downloadUrl",
    ensureTrailingSlash(baseUrl)
  );
  downloadApiUrl.searchParams.set("path", normalizeKey(relKey));
  const response = await fetch(downloadApiUrl, {
    method: "GET",
    headers: buildAuthHeaders(apiKey),
  });
  return (await response.json()).url;
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function toFormData(
  data: Buffer | Uint8Array | string,
  contentType: string,
  fileName: string
): FormData {
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: contentType })
      : new Blob([data as any], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}

function buildAuthHeaders(apiKey: string): HeadersInit {
  return { Authorization: `Bearer ${apiKey}` };
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const mode = getStorageMode();
  const key = normalizeKey(relKey);

  // Local filesystem storage
  if (mode === 'local') {
    const filePath = path.join(UPLOAD_DIR, key);
    const dirPath = path.dirname(filePath);

    // Ensure directory exists
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Convert data to Buffer if needed
    const buffer = typeof data === 'string'
      ? Buffer.from(data, 'utf-8')
      : Buffer.from(data);

    // Write file
    fs.writeFileSync(filePath, buffer);

    // Return local URL (will be served via /uploads route)
    const url = `/uploads/${key}`;
    return { key, url };
  }

  // Remote storage (original implementation)
  const { baseUrl, apiKey } = getStorageConfig();
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string; }> {
  const mode = getStorageMode();
  const key = normalizeKey(relKey);

  // Local filesystem storage
  if (mode === 'local') {
    const url = `/uploads/${key}`;
    return { key, url };
  }

  // Remote storage (original implementation)
  const { baseUrl, apiKey } = getStorageConfig();
  return {
    key,
    url: await buildDownloadUrl(baseUrl, key, apiKey),
  };
}
