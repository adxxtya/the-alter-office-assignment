import { Request, Response } from "express";
import geoip from "geoip-lite";
import { v4 as uuidv4 } from "uuid";
import redisClient from "../utils/redisClient";
import { PrismaClient } from "@prisma/client";
import { UAParser } from "ua-parser-js";

const prisma = new PrismaClient();

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};

const isValidAlias = (alias: string): boolean =>
  /^[a-zA-Z0-9_-]{3,15}$/.test(alias);

export const createShortUrl = async (req: Request, res: Response) => {
  try {
    const { longUrl, customAlias, topic } = req.body;

    if (!longUrl || typeof longUrl !== "string" || !isValidUrl(longUrl)) {
      return res
        .status(400)
        .json({ error: "Invalid long URL. Please provide a valid URL." });
    }

    let alias = customAlias || uuidv4().slice(0, 6);

    if (customAlias) {
      if (typeof customAlias !== "string" || !isValidAlias(customAlias)) {
        return res.status(400).json({
          error:
            "Invalid custom alias. It should be 3-15 characters long, alphanumeric with optional hyphens or underscores.",
        });
      }

      const existingAlias = await prisma.shortUrl.findUnique({
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
        error:
          "Invalid topic. It should be a string with a maximum length of 30 characters.",
      });
    }

    const shortUrl = `https://alterof.fice/${alias}`;
    const createdAt = new Date();

    const record = await prisma.shortUrl.create({
      data: { longUrl, shortUrl, alias, topic, createdAt },
    });

    await redisClient.set(`shortUrl:${alias}`, longUrl, { EX: 3600 });

    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];
    const location = ip ? geoip.lookup(ip as string) : null;

    const parser = new UAParser(userAgent);
    const deviceInfo = parser.getDevice();

    const device = deviceInfo
      ? `${deviceInfo.vendor || ""} ${deviceInfo.model || ""}`
      : "Unknown Device";

    await prisma.analytics.create({
      data: {
        device: device,
        alias,
        timestamp: new Date(),
        ip: ip as string,
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
  } catch (error) {
    console.error("Error creating short URL:", error);
    return res.status(500).json({ error: "An internal server error occurred" });
  }
};

export const redirectShortUrl = async (req: Request, res: Response) => {
  try {
    const { alias } = req.params;

    const record = await prisma.shortUrl.findUnique({
      where: { alias },
    });

    if (!record) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];
    const location = ip ? geoip.lookup(ip as string) : null;

    const parser = new UAParser(userAgent);
    const deviceInfo = parser.getDevice();

    const device = deviceInfo
      ? `${deviceInfo.vendor || ""} ${deviceInfo.model || ""}`
      : "Unknown Device";

    await prisma.analytics.create({
      data: {
        device: device,
        alias,
        timestamp: new Date(),
        ip: ip as string,
        userAgent,
        location: location ? JSON.stringify(location) : null,
      },
    });

    return res.redirect(301, record.longUrl);
  } catch (error) {
    console.error("Error redirecting:", error);
    return res.status(500).json({ error: "An internal server error occurred" });
  }
};
