import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is not set");
}

const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    connectTimeout: 10000,
  },
});

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.connect().catch((err) => {
  console.error("Error connecting to Redis:", err);
});
export default redisClient;
