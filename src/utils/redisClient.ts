import { createClient } from "redis";

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not set");
}

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.connect();

export default redisClient;
