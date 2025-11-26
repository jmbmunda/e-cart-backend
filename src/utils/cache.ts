import redis from "../config/redis";

const get = async <T>(key: string): Promise<T | null> => {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};

const set = async (key: string, value: any, ttlSeconds?: number) => {
  const stringValue = JSON.stringify(value);
  if (ttlSeconds) {
    await redis.set(key, stringValue, {
      expiration: { type: "EX", value: ttlSeconds },
    });
  } else {
    await redis.set(key, stringValue);
  }
};

const del = async (key: string) => {
  await redis.del(key);
};

const expire = async (key: string, ttlSeconds: number) => {
  await redis.expire(key, ttlSeconds);
};

const getOrFetch = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: { shouldSetCache: boolean; ttl?: number }
): Promise<T> => {
  const data = await redis.get(key);
  if (data) return JSON.parse(data);

  const freshData = await fetcher();
  if (options?.shouldSetCache) {
    await redis.set(key, JSON.stringify(freshData), {
      expiration: options.ttl ? { type: "EX", value: options.ttl } : undefined,
    });
  }
  return freshData;
};

export default { ...redis, get, set, del, expire, getOrFetch };
