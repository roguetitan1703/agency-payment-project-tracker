// Redis-backed blacklist implementation. Lazily requires ioredis so the
// dependency is optional for environments that don't use Redis.
export const createRedisImpl = (redisUrl?: string) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const IORedis = require("ioredis");
    const redis = new IORedis(
      redisUrl || process.env.REDIS_URL || "redis://localhost:6379"
    );
    return {
      add: async (token: string, ttlSeconds = 60 * 60 * 24 * 7) => {
        await redis.set(`blacklist:${token}`, "1", "EX", ttlSeconds);
      },
      has: async (token: string) => {
        const v = await redis.get(`blacklist:${token}`);
        return !!v;
      },
      close: async () => {
        await redis.quit();
      },
    } as const;
  } catch (err) {
    // bubble up the error so caller can fallback to memory implementation
    throw err;
  }
};

export default createRedisImpl;
