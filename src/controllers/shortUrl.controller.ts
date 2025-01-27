import { Request, Response } from "express";
import ShortUrl from "../models/ShortUrl";
import { v4 as uuidv4 } from "uuid";
import redisClient from "../utils/redisClient";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createShortUrl = async (req: Request, res: Response) => {
  try {
    const { longUrl, customAlias, topic } = req.body;

    const alias = customAlias || uuidv4().slice(0, 6);
    const shortUrl = `http://short.ly/${alias}`;
    const createdAt = new Date();

    const record = await prisma.shortUrl.create({
      data: {
        longUrl: longUrl,
        shortUrl: shortUrl,
        alias: alias,
        topic: topic,
        createdAt: createdAt,
      },
    });

    await redisClient.set(`shortUrl:${alias}`, longUrl, { EX: 3600 });

    res.status(201).json({ shortUrl, createdAt });
  } catch (error) {
    res.status(500).json({ error: "An internal server error occurred" });
  }
};

export const redirectShortUrl = async (req: Request, res: Response) => {
  const { alias } = req.params;

  const cachedUrl = await redisClient.get(`shortUrl:${alias}`);
  if (cachedUrl) {
    return res.redirect(cachedUrl);
  }

  const urlRecord: any = await ShortUrl.findOne({ where: { alias } });
  if (!urlRecord) return res.status(404).send("Not Found");

  redisClient.SETEX(`shortUrl:${alias}`, 3600, urlRecord.longUrl);
  res.redirect(urlRecord.longUrl);
};
