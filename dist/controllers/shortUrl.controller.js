"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirectShortUrl = exports.createShortUrl = void 0;
const geoip_lite_1 = __importDefault(require("geoip-lite"));
const uuid_1 = require("uuid");
const redisClient_1 = __importDefault(require("../utils/redisClient"));
const client_1 = require("@prisma/client");
const ua_parser_js_1 = require("ua-parser-js");
const prisma = new client_1.PrismaClient();
const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    }
    catch (_) {
        return false;
    }
};
const isValidAlias = (alias) => /^[a-zA-Z0-9_-]{3,15}$/.test(alias);
const createShortUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { longUrl, customAlias, topic } = req.body;
        if (!longUrl || typeof longUrl !== "string" || !isValidUrl(longUrl)) {
            return res
                .status(400)
                .json({ error: "Invalid long URL. Please provide a valid URL." });
        }
        let alias = customAlias || (0, uuid_1.v4)().slice(0, 6);
        if (customAlias) {
            if (typeof customAlias !== "string" || !isValidAlias(customAlias)) {
                return res.status(400).json({
                    error: "Invalid custom alias. It should be 3-15 characters long, alphanumeric with optional hyphens or underscores.",
                });
            }
            const existingAlias = yield prisma.shortUrl.findUnique({
                where: { alias: customAlias },
            });
            if (existingAlias) {
                return res.status(409).json({
                    error: "Custom alias already in use. Please choose a different one.",
                });
            }
        }
        if (topic && (typeof topic !== "string" || topic.length > 30)) {
            return res.status(400).json({
                error: "Invalid topic. It should be a string with a maximum length of 30 characters.",
            });
        }
        const shortUrl = `https://alterof.fice/${alias}`;
        const createdAt = new Date();
        const record = yield prisma.shortUrl.create({
            data: { longUrl, shortUrl, alias, topic, createdAt },
        });
        yield redisClient_1.default.set(`shortUrl:${alias}`, longUrl, { EX: 3600 });
        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        const userAgent = req.headers["user-agent"];
        const location = ip ? geoip_lite_1.default.lookup(ip) : null;
        const parser = new ua_parser_js_1.UAParser(userAgent);
        const deviceInfo = parser.getDevice();
        const device = deviceInfo
            ? `${deviceInfo.vendor || ""} ${deviceInfo.model || ""}`
            : "Unknown Device";
        yield prisma.analytics.create({
            data: {
                device: device,
                alias,
                timestamp: new Date(),
                ip: ip,
                userAgent,
                location: location ? JSON.stringify(location) : null,
            },
        });
        return res.status(201).json({
            message: "Short URL successfully created!",
            shortUrl,
            alias,
            createdAt,
        });
    }
    catch (error) {
        console.error("Error creating short URL:", error);
        return res.status(500).json({ error: "An internal server error occurred" });
    }
});
exports.createShortUrl = createShortUrl;
const redirectShortUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { alias } = req.params;
        const record = yield prisma.shortUrl.findUnique({
            where: { alias },
        });
        if (!record) {
            return res.status(404).json({ error: "Short URL not found" });
        }
        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        const userAgent = req.headers["user-agent"];
        const location = ip ? geoip_lite_1.default.lookup(ip) : null;
        const parser = new ua_parser_js_1.UAParser(userAgent);
        const deviceInfo = parser.getDevice();
        const device = deviceInfo
            ? `${deviceInfo.vendor || ""} ${deviceInfo.model || ""}`
            : "Unknown Device";
        yield prisma.analytics.create({
            data: {
                device: device,
                alias,
                timestamp: new Date(),
                ip: ip,
                userAgent,
                location: location ? JSON.stringify(location) : null,
            },
        });
        return res.redirect(301, record.longUrl);
    }
    catch (error) {
        console.error("Error redirecting:", error);
        return res.status(500).json({ error: "An internal server error occurred" });
    }
});
exports.redirectShortUrl = redirectShortUrl;
