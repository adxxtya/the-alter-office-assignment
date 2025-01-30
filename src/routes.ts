import express from "express";
import {
  createShortUrl,
  redirectShortUrl,
} from "./controllers/shortUrl.controller";
import {
  getUrlAnalytics,
  getTopicAnalytics,
  getOverallAnalytics,
} from "./controllers/analytics.controller";
import rateLimit from "express-rate-limit";

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "API is up and running",
    timestamp: new Date().toISOString(),
  });
});

const urlLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Rate limit exceeded. Try again in a minute." },
});
router.post("/api/shorten", urlLimiter, createShortUrl);
router.get("/api/shorten/:alias", redirectShortUrl);
router.get("/api/analytics/overall", getOverallAnalytics);
router.get("/api/analytics/:alias", getUrlAnalytics);
router.get("/api/analytics/topic/:topic", getTopicAnalytics);

export default router;
