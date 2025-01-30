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
import { googleLogin } from "./controllers/auth.controller";

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

/**
 * @openapi
 * '/api/auth/google-login':
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login with Google account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The Google OAuth token received from the frontend after user login
 *                 example: "ya29.a0AfH6SMB_qyGy..."
 *     responses:
 *       200:
 *         description: Successfully logged in, returns JWT token and user details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: The JWT token for the authenticated user
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     avatarUrl:
 *                       type: string
 *                       example: "https://example.com/avatar.jpg"
 *       400:
 *         description: Bad request (invalid or missing token)
 *       500:
 *         description: Internal server error (authentication failure)
 */
router.post("/api/auth/google-login", googleLogin);

/**
 * @openapi
 * '/api/shorten':
 *   post:
 *     tags:
 *       - URL
 *     summary: Create a shortened URL
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               longUrl:
 *                 type: string
 *                 description: The long URL to be shortened
 *                 example: "https://example.com"
 *               customAlias:
 *                 type: string
 *                 description: An optional custom alias for the shortened URL (3-15 alphanumeric characters)
 *                 example: "mycustomalias"
 *               topic:
 *                 type: string
 *                 description: An optional topic tag associated with the shortened URL (max 30 characters)
 *                 example: "tech"
 *     responses:
 *       201:
 *         description: Short URL successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Short URL successfully created!"
 *                 shortUrl:
 *                   type: string
 *                   example: "https://alterof.fice/abc123"
 *                 alias:
 *                   type: string
 *                   example: "abc123"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-01-30T12:00:00Z"
 *       400:
 *         description: Invalid long URL or custom alias
 *       409:
 *         description: Custom alias already in use
 *       500:
 *         description: Internal server error
 */
router.post("/api/shorten", urlLimiter, createShortUrl);

/**
 * @openapi
 * '/api/shorten/{alias}':
 *   get:
 *     tags:
 *       - URL
 *     summary: Redirect to the original URL using a shortened alias
 *     parameters:
 *       - in: path
 *         name: alias
 *         required: true
 *         description: The alias of the shortened URL
 *         schema:
 *           type: string
 *     responses:
 *       301:
 *         description: Redirect to the original long URL
 *       404:
 *         description: Short URL not found
 *       500:
 *         description: Internal server error
 */
router.get("/api/shorten/:alias", redirectShortUrl);

/**
 * @openapi
 * '/api/analytics/{alias}':
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get analytics for a specific shortened URL based on alias
 *     parameters:
 *       - in: path
 *         name: alias
 *         required: true
 *         description: The alias of the shortened URL
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns analytics for the specific shortened URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shortUrl:
 *                   type: string
 *                   description: The shortened URL
 *                 totalClicks:
 *                   type: integer
 *                   description: Total number of clicks on the shortened URL
 *                 uniqueUsers:
 *                   type: integer
 *                   description: Number of unique users who clicked on the URL
 *                 clicksByDate:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         description: The date of the click
 *                       count:
 *                         type: integer
 *                         description: The number of clicks on that date
 *                 osType:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       osName:
 *                         type: string
 *                         description: Name of the operating system
 *                       uniqueClicks:
 *                         type: integer
 *                         description: Total number of unique clicks from that OS
 *                       uniqueUsers:
 *                         type: integer
 *                         description: Number of unique users from that OS
 *                 deviceType:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       deviceName:
 *                         type: string
 *                         description: Name of the device (e.g., mobile, desktop)
 *                       uniqueClicks:
 *                         type: integer
 *                         description: Total number of unique clicks from that device
 *                       uniqueUsers:
 *                         type: integer
 *                         description: Number of unique users from that device
 *       404:
 *         description: Alias not found
 *       500:
 *         description: Internal server error
 */
router.get("/api/analytics/:alias", getUrlAnalytics);

/**
 * @openapi
 * '/api/analytics/topic/{topic}':
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get analytics for URLs within a specific topic
 *     parameters:
 *       - in: path
 *         name: topic
 *         required: true
 *         description: The topic for which analytics is required
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns analytics for the specified topic
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 topic:
 *                   type: string
 *                   description: The topic name
 *                 totalUrls:
 *                   type: integer
 *                   description: Total number of URLs in this topic
 *                 totalClicks:
 *                   type: integer
 *                   description: Total number of clicks for URLs in this topic
 *                 uniqueUsers:
 *                   type: integer
 *                   description: Number of unique users across URLs in this topic
 *                 clicksByDate:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         description: The date of the click
 *                       count:
 *                         type: integer
 *                         description: The number of clicks on that date
 *                 urls:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       shortUrl:
 *                         type: string
 *                         description: The shortened URL
 *                       totalClicks:
 *                         type: integer
 *                         description: Total number of clicks on the URL
 *                       uniqueUsers:
 *                         type: integer
 *                         description: Number of unique users who clicked on the URL
 *       404:
 *         description: No URLs found for this topic
 *       500:
 *         description: Internal server error
 */
router.get("/api/analytics/topic/:topic", getTopicAnalytics);

/**
 * @openapi
 * '/api/analytics/overall':
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get overall analytics for all shortened URLs
 *     responses:
 *       200:
 *         description: Returns overall analytics data for all URLs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUrls:
 *                   type: integer
 *                   description: Total number of shortened URLs
 *                 totalClicks:
 *                   type: integer
 *                   description: Total number of clicks across all URLs
 *                 uniqueUsers:
 *                   type: integer
 *                   description: Number of unique users who clicked on any URL
 *                 clicksByDate:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         description: The date of the click
 *                       count:
 *                         type: integer
 *                         description: The number of clicks on that date
 *       404:
 *         description: No URLs found
 *       500:
 *         description: Internal server error
 */
router.get("/api/analytics/overall", getOverallAnalytics);

export default router;
