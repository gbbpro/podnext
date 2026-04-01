// Thin wrapper around Vercel KV.
// Falls back to a simple in-memory map when KV env vars are absent (local dev).

let kv: typeof import("@vercel/kv").kv | null = null;

async function getKV() {
  if (kv) return kv;
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const mod = await import("@vercel/kv");
      kv = mod.kv;
      return kv;
    }
  } catch {}
  return null;
}

const memCache = new Map<string, { value: unknown; exp: number }>();

export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = await getKV();
  if (client) return client.get<T>(key);
  const entry = memCache.get(key);
  if (!entry) return null;
  if (entry.exp !== 0 && Date.now() > entry.exp) {
    memCache.delete(key);
    return null;
  }
  return entry.value as T;
}

// ttlSeconds=0 means no expiry
export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds = 3600
): Promise<void> {
  const client = await getKV();
  if (client) {
    if (ttlSeconds > 0) {
      await client.set(key, value, { ex: ttlSeconds });
    } else {
      await client.set(key, value); // no expiry
    }
    return;
  }
  memCache.set(key, { value, exp: ttlSeconds === 0 ? 0 : Date.now() + ttlSeconds * 1000 });
}

export async function cacheDelete(key: string): Promise<void> {
  const client = await getKV();
  if (client) {
    await client.del(key);
    return;
  }
  memCache.delete(key);
}
