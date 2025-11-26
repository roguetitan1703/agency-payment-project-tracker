// Simple token blacklist service with two backends: in-memory (default) and redis (optional, feature-flagged via TOKEN_BLACKLIST_STORE=redis).

type BlacklistImpl = {
  add: (token: string, ttlSeconds?: number) => Promise<void>;
  has: (token: string) => Promise<boolean>;
  close?: () => Promise<void>;
};

let impl: BlacklistImpl | undefined;

if (process.env.TOKEN_BLACKLIST_STORE === "redis") {
  // Try to initialize the redis-backed implementation (keeps dependency optional)
  try {
    // Lazy import of helper that wraps ioredis
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const createRedisImpl = require("./blacklistRedis").createRedisImpl;
    impl = createRedisImpl(process.env.REDIS_URL);
  } catch (err) {
    // Fallback to memory impl but warn
    // eslint-disable-next-line no-console
    console.warn(
      "TOKEN_BLACKLIST_STORE=redis configured but ioredis or redis init failed. Falling back to in-memory blacklist.",
      String((err as any)?.message || err)
    );
  }
}

if (!impl) {
  const memory = new Set<string>();
  impl = {
    add: async (token: string) => {
      memory.add(token);
    },
    has: async (token: string) => {
      return memory.has(token);
    },
    close: async () => {
      memory.clear();
    },
  };
}

export const add = (token: string, ttlSeconds?: number) =>
  impl!.add(token, ttlSeconds);
export const has = (token: string) => impl!.has(token);
export const close = () => impl!.close && impl!.close();
export default { add, has, close };
