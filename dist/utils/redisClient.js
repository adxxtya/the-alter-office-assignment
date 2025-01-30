"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL is not set");
}
const redisClient = (0, redis_1.createClient)({
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
exports.default = redisClient;
