"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const shortUrl_controller_1 = require("./controllers/shortUrl.controller");
const analytics_controller_1 = require("./controllers/analytics.controller");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = express_1.default.Router();
router.get("/health", (req, res) => {
    res.json({
        status: "OK",
        message: "API is up and running",
        timestamp: new Date().toISOString(),
    });
});
const urlLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: "Rate limit exceeded. Try again in a minute." },
});
router.post("/api/shorten", urlLimiter, shortUrl_controller_1.createShortUrl);
router.get("/api/shorten/:alias", shortUrl_controller_1.redirectShortUrl);
router.get("/api/analytics/overall", analytics_controller_1.getOverallAnalytics);
router.get("/api/analytics/:alias", analytics_controller_1.getUrlAnalytics);
router.get("/api/analytics/topic/:topic", analytics_controller_1.getTopicAnalytics);
exports.default = router;
