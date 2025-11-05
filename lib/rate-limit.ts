import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!
    })
  : undefined;

export const uploadRateLimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(5, '1 m') })
  : undefined;

export const aiRateLimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(10, '1 m') })
  : undefined;

export const contactRateLimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(3, '10 m') })
  : undefined;
