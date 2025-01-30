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
exports.getOverallAnalytics = exports.getTopicAnalytics = exports.getUrlAnalytics = void 0;
const client_1 = require("@prisma/client");
const ua_parser_js_1 = require("ua-parser-js");
const redisClient_1 = __importDefault(require("../utils/redisClient"));
const prisma = new client_1.PrismaClient();
const getDeviceInfo = (userAgent) => {
    const parser = new ua_parser_js_1.UAParser(userAgent);
    const deviceInfo = parser.getDevice();
    return deviceInfo
        ? `${deviceInfo.vendor || ""} ${deviceInfo.model || ""}`
        : "Unknown Device";
};
const getOsInfo = (userAgent) => {
    const parser = new ua_parser_js_1.UAParser(userAgent);
    const os = parser.getOS();
    return os.name || "Unknown OS";
};
const fetchAnalyticsFromCache = (key) => __awaiter(void 0, void 0, void 0, function* () {
    const cachedData = yield redisClient_1.default.get(key);
    if (cachedData) {
        return JSON.parse(cachedData);
    }
    return null;
});
const saveAnalyticsToCache = (key, data) => __awaiter(void 0, void 0, void 0, function* () {
    yield redisClient_1.default.set(key, JSON.stringify(data), { EX: 3600 });
});
const getUrlAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { alias } = req.params;
        const cacheKey = `analytics:url:${alias}`;
        const cachedAnalytics = yield fetchAnalyticsFromCache(cacheKey);
        if (cachedAnalytics) {
            return res.json(cachedAnalytics);
        }
        const record = yield prisma.shortUrl.findUnique({
            where: { alias },
            include: { analytics: true },
        });
        if (!record) {
            return res.status(404).json({ error: "Short URL not found" });
        }
        const totalClicks = record.analytics.length;
        const uniqueUsers = new Set(record.analytics.map((entry) => entry.ip)).size;
        const clicksByDate = record.analytics
            .filter((entry) => {
            const date = new Date(entry.timestamp);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return date >= sevenDaysAgo;
        })
            .reduce((acc, entry) => {
            const date = entry.timestamp.toISOString().split("T")[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});
        const osType = record.analytics.reduce((acc, entry) => {
            const osName = getOsInfo(entry.userAgent);
            if (!acc[osName])
                acc[osName] = { uniqueClicks: 0, uniqueUsers: new Set() };
            acc[osName].uniqueClicks += 1;
            acc[osName].uniqueUsers.add(entry.ip);
            return acc;
        }, {});
        const deviceType = record.analytics.reduce((acc, entry) => {
            const deviceName = getDeviceInfo(entry.userAgent);
            if (!acc[deviceName])
                acc[deviceName] = { uniqueClicks: 0, uniqueUsers: new Set() };
            acc[deviceName].uniqueClicks += 1;
            acc[deviceName].uniqueUsers.add(entry.ip);
            return acc;
        }, {});
        const analyticsData = {
            shortUrl: record.shortUrl,
            totalClicks,
            uniqueUsers,
            clicksByDate: Object.entries(clicksByDate).map(([date, count]) => ({
                date,
                count,
            })),
            osType: Object.entries(osType).map(([osName, { uniqueClicks, uniqueUsers }]) => ({
                osName,
                uniqueClicks,
                uniqueUsers: uniqueUsers.size,
            })),
            deviceType: Object.entries(deviceType).map(([deviceName, { uniqueClicks, uniqueUsers }]) => ({
                deviceName,
                uniqueClicks,
                uniqueUsers: uniqueUsers.size,
            })),
        };
        yield saveAnalyticsToCache(cacheKey, analyticsData);
        return res.json(analyticsData);
    }
    catch (error) {
        console.error("Error fetching analytics:", error);
        return res.status(500).json({ error: "An internal server error occurred" });
    }
});
exports.getUrlAnalytics = getUrlAnalytics;
const getTopicAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { topic } = req.params;
        const cacheKey = `analytics:topic:${topic}`;
        const cachedAnalytics = yield fetchAnalyticsFromCache(cacheKey);
        if (cachedAnalytics) {
            return res.json(cachedAnalytics);
        }
        const urls = yield prisma.shortUrl.findMany({
            where: { topic },
            include: { analytics: true },
        });
        if (!urls.length) {
            return res.status(404).json({ error: "No URLs found for this topic." });
        }
        const totalClicks = urls.reduce((sum, url) => sum + url.analytics.length, 0);
        const uniqueUsers = new Set(urls.flatMap((url) => url.analytics.map((entry) => entry.ip))).size;
        const clicksByDate = urls
            .flatMap((url) => url.analytics)
            .reduce((acc, entry) => {
            const date = entry.timestamp.toISOString().split("T")[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});
        const analyticsData = {
            topic,
            totalUrls: urls.length,
            totalClicks,
            uniqueUsers,
            clicksByDate: Object.entries(clicksByDate).map(([date, count]) => ({
                date,
                count,
            })),
            urls: urls.map((url) => ({
                shortUrl: url.shortUrl,
                totalClicks: url.analytics.length,
                uniqueUsers: new Set(url.analytics.map((entry) => entry.ip)).size,
            })),
        };
        yield saveAnalyticsToCache(cacheKey, analyticsData);
        return res.json(analyticsData);
    }
    catch (error) {
        console.error("Error fetching topic analytics:", error);
        return res.status(500).json({ error: "An internal server error occurred" });
    }
});
exports.getTopicAnalytics = getTopicAnalytics;
const getOverallAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cacheKey = `analytics:overall`;
        const cachedAnalytics = yield fetchAnalyticsFromCache(cacheKey);
        if (cachedAnalytics) {
            return res.json(cachedAnalytics);
        }
        const urls = yield prisma.shortUrl.findMany({
            include: { analytics: true },
        });
        if (!urls.length) {
            return res.status(404).json({ error: "No URLs found." });
        }
        const totalClicks = urls.reduce((sum, url) => sum + url.analytics.length, 0);
        const uniqueUsers = new Set(urls.flatMap((url) => url.analytics.map((entry) => entry.ip))).size;
        const clicksByDate = urls
            .flatMap((url) => url.analytics)
            .reduce((acc, entry) => {
            const date = entry.timestamp.toISOString().split("T")[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});
        const analyticsData = {
            totalUrls: urls.length,
            totalClicks,
            uniqueUsers,
            clicksByDate: Object.entries(clicksByDate).map(([date, count]) => ({
                date,
                count,
            })),
        };
        yield saveAnalyticsToCache(cacheKey, analyticsData);
        return res.json(analyticsData);
    }
    catch (error) {
        console.error("Error fetching overall analytics:", error);
        return res.status(500).json({ error: "An internal server error occurred" });
    }
});
exports.getOverallAnalytics = getOverallAnalytics;
