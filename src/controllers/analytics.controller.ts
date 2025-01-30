import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { UAParser } from "ua-parser-js";
import redisClient from "../utils/redisClient";

const prisma = new PrismaClient();

interface AnalyticsData {
  uniqueClicks: number;
  uniqueUsers: Set<string>;
}

const getDeviceInfo = (userAgent: string) => {
  const parser = new UAParser(userAgent);
  const deviceInfo = parser.getDevice();
  return deviceInfo
    ? `${deviceInfo.vendor || ""} ${deviceInfo.model || ""}`
    : "Unknown Device";
};

const getOsInfo = (userAgent: string) => {
  const parser = new UAParser(userAgent);
  const os = parser.getOS();
  return os.name || "Unknown OS";
};

const fetchAnalyticsFromCache = async (key: string) => {
  const cachedData = await redisClient.get(key);
  if (cachedData) {
    return JSON.parse(cachedData);
  }
  return null;
};

const saveAnalyticsToCache = async (key: string, data: any) => {
  await redisClient.set(key, JSON.stringify(data), { EX: 3600 });
};

export const getUrlAnalytics = async (req: Request, res: Response) => {
  try {
    const { alias } = req.params;

    const cacheKey = `analytics:url:${alias}`;
    const cachedAnalytics = await fetchAnalyticsFromCache(cacheKey);
    if (cachedAnalytics) {
      return res.json(cachedAnalytics);
    }

    const record = await prisma.shortUrl.findUnique({
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
      .reduce((acc: Record<string, number>, entry) => {
        const date = entry.timestamp.toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

    const osType: Record<string, AnalyticsData> = record.analytics.reduce(
      (acc, entry) => {
        const osName = getOsInfo(entry.userAgent!);
        if (!acc[osName])
          acc[osName] = { uniqueClicks: 0, uniqueUsers: new Set() };
        acc[osName].uniqueClicks += 1;
        acc[osName].uniqueUsers.add(entry.ip);
        return acc;
      },
      {}
    );

    const deviceType: Record<string, AnalyticsData> = record.analytics.reduce(
      (acc, entry) => {
        const deviceName = getDeviceInfo(entry.userAgent!);
        if (!acc[deviceName])
          acc[deviceName] = { uniqueClicks: 0, uniqueUsers: new Set() };
        acc[deviceName].uniqueClicks += 1;
        acc[deviceName].uniqueUsers.add(entry.ip);
        return acc;
      },
      {} as Record<string, AnalyticsData>
    );

    const analyticsData = {
      shortUrl: record.shortUrl,
      totalClicks,
      uniqueUsers,
      clicksByDate: Object.entries(clicksByDate).map(([date, count]) => ({
        date,
        count,
      })),
      osType: Object.entries(osType).map(
        ([osName, { uniqueClicks, uniqueUsers }]) => ({
          osName,
          uniqueClicks,
          uniqueUsers: uniqueUsers.size,
        })
      ),
      deviceType: Object.entries(deviceType).map(
        ([deviceName, { uniqueClicks, uniqueUsers }]) => ({
          deviceName,
          uniqueClicks,
          uniqueUsers: uniqueUsers.size,
        })
      ),
    };

    await saveAnalyticsToCache(cacheKey, analyticsData);

    return res.json(analyticsData);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return res.status(500).json({ error: "An internal server error occurred" });
  }
};

export const getTopicAnalytics = async (req: Request, res: Response) => {
  try {
    const { topic } = req.params;

    const cacheKey = `analytics:topic:${topic}`;
    const cachedAnalytics = await fetchAnalyticsFromCache(cacheKey);
    if (cachedAnalytics) {
      return res.json(cachedAnalytics);
    }

    const urls = await prisma.shortUrl.findMany({
      where: { topic },
      include: { analytics: true },
    });

    if (!urls.length) {
      return res.status(404).json({ error: "No URLs found for this topic." });
    }

    const totalClicks = urls.reduce(
      (sum, url) => sum + url.analytics.length,
      0
    );
    const uniqueUsers = new Set(
      urls.flatMap((url) => url.analytics.map((entry) => entry.ip))
    ).size;

    const clicksByDate = urls
      .flatMap((url) => url.analytics)
      .reduce((acc: Record<string, number>, entry) => {
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

    await saveAnalyticsToCache(cacheKey, analyticsData);

    return res.json(analyticsData);
  } catch (error) {
    console.error("Error fetching topic analytics:", error);
    return res.status(500).json({ error: "An internal server error occurred" });
  }
};

export const getOverallAnalytics = async (req: Request, res: Response) => {
  try {
    const cacheKey = `analytics:overall`;
    const cachedAnalytics = await fetchAnalyticsFromCache(cacheKey);
    if (cachedAnalytics) {
      return res.json(cachedAnalytics);
    }

    const urls = await prisma.shortUrl.findMany({
      include: { analytics: true },
    });

    if (!urls.length) {
      return res.status(404).json({ error: "No URLs found." });
    }

    const totalClicks = urls.reduce(
      (sum, url) => sum + url.analytics.length,
      0
    );
    const uniqueUsers = new Set(
      urls.flatMap((url) => url.analytics.map((entry) => entry.ip))
    ).size;

    const clicksByDate = urls
      .flatMap((url) => url.analytics)
      .reduce((acc: Record<string, number>, entry) => {
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

    await saveAnalyticsToCache(cacheKey, analyticsData);

    return res.json(analyticsData);
  } catch (error) {
    console.error("Error fetching overall analytics:", error);
    return res.status(500).json({ error: "An internal server error occurred" });
  }
};
