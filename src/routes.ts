import express from "express";
import { registerUser, loginUser } from "./controllers/auth.controller";
import {
  createShortUrl,
  redirectShortUrl,
} from "./controllers/shortUrl.controller";
import {
  getUrlAnalytics,
  getTopicAnalytics,
  getOverallAnalytics,
} from "./controllers/analytics.controller";

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "API is up and running",
    timestamp: new Date().toISOString(),
  });
});

router.post("/api/register", registerUser);
router.post("/api/login", loginUser);
router.post("/api/shorten", createShortUrl); // done
router.get("/api/shorten/:alias", redirectShortUrl); // done
router.get("/api/analytics/:alias", getUrlAnalytics);
router.get("/api/analytics/topic/:topic", getTopicAnalytics);
router.get("/api/analytics/overall", getOverallAnalytics);

export default router;
