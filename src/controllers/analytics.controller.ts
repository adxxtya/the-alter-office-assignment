import { Request, Response } from "express";
import ShortUrl from "../models/ShortUrl";
import { Analytics } from "../models/Analytics";

export const getUrlAnalytics = async (req: Request, res: Response) => {
  const { alias } = req.params;
  const analytics = await Analytics.findOne({ where: { alias } });

  if (!analytics) return res.status(404).send("Analytics not found");

  res.status(200).json(analytics);
};

export const getTopicAnalytics = async (req: Request, res: Response) => {
  const { topic } = req.params;
  const urls = await ShortUrl.findAll({ where: { topic } });

  const analyticsData = await Promise.all(
    urls.map(async (url: any) => {
      const analytics: any = await Analytics.findOne({
        where: { alias: url.alias },
      });
      return {
        shortUrl: url.shortUrl,
        totalClicks: analytics?.totalClicks || 0,
        uniqueUsers: analytics?.uniqueUsers || 0,
      };
    })
  );

  res.status(200).json(analyticsData);
};

export const getOverallAnalytics = async (req: any, res: Response) => {
  const userId = req.user.id;
  const urls = await ShortUrl.findAll({ where: { userId } });

  const totalClicks = 0;
  const uniqueUsers = 0;
  const clicksByDate: any = [];
  const osType: any = [];
  const deviceType: any = [];

  res.status(200).json({
    totalClicks,
    uniqueUsers,
    clicksByDate,
    osType,
    deviceType,
  });
};
