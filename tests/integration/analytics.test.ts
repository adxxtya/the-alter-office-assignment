import request from "supertest";
import { app } from "../../src/index"; // Adjust based on your app setup
import { PrismaClient } from "@prisma/client";
import redisClient from "../../src/utils/redisClient";

const prisma = new PrismaClient();

jest.mock("../../src/utils/redisClient", () => ({
  get: jest.fn(),
  set: jest.fn(),
}));

jest.mock("@prisma/client", () => {
  const mockPrisma = {
    shortUrl: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

describe("Analytics API Tests", () => {
  const testAlias = "testAlias";
  const testTopic = "health";
  const testAnalytics = [
    {
      ip: "192.168.1.1",
      userAgent: "Mozilla/5.0",
      timestamp: new Date(),
    },
    {
      ip: "192.168.1.2",
      userAgent: "Mozilla/5.0",
      timestamp: new Date(),
    },
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Should return URL analytics successfully", async () => {
    (redisClient.get as jest.Mock).mockResolvedValue(null);

    (prisma.shortUrl.findUnique as jest.Mock).mockResolvedValue({
      alias: testAlias,
      shortUrl: "https://short.ly/testAlias",
      analytics: testAnalytics,
    });

    const response = await request(app)
      .get(`/api/analytics/${testAlias}`)
      .expect(200);

    expect(response.body).toHaveProperty("totalClicks", 2);
    expect(response.body).toHaveProperty("uniqueUsers", 2);
    expect(redisClient.set).toHaveBeenCalled();
  });

  test("Should return 404 for non-existent URL analytics", async () => {
    (prisma.shortUrl.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .get(`/api/analytics/nonexistent`)
      .expect(404);

    expect(response.body.error).toBe("Short URL not found");
  });

  test("Should return topic analytics successfully", async () => {
    (redisClient.get as jest.Mock).mockResolvedValue(null);

    (prisma.shortUrl.findMany as jest.Mock).mockResolvedValue([
      {
        shortUrl: "https://short.ly/1",
        analytics: testAnalytics,
      },
      {
        shortUrl: "https://short.ly/2",
        analytics: testAnalytics,
      },
    ]);

    const response = await request(app)
      .get(`/api/analytics/topic/${testTopic}`)
      .expect(200);

    expect(response.body).toHaveProperty("totalClicks", 4);
    expect(response.body).toHaveProperty("uniqueUsers", 2);
    expect(response.body).toHaveProperty("totalUrls", 2);
    expect(redisClient.set).toHaveBeenCalled();
  });

  test("Should return 404 for non-existent topic analytics", async () => {
    (prisma.shortUrl.findMany as jest.Mock).mockResolvedValue([]);

    const response = await request(app)
      .get(`/api/analytics/topic/nonexistent`)
      .expect(404);

    expect(response.body.error).toBe("No URLs found for this topic.");
  });

  test("Should return overall analytics successfully", async () => {
    (redisClient.get as jest.Mock).mockResolvedValue(null);

    (prisma.shortUrl.findMany as jest.Mock).mockResolvedValue([
      {
        analytics: testAnalytics,
      },
      {
        analytics: testAnalytics,
      },
    ]);

    const response = await request(app)
      .get("/api/analytics/overall")
      .expect(200);

    expect(response.body).toHaveProperty("totalClicks", 4);
    expect(response.body).toHaveProperty("uniqueUsers", 2);
    expect(redisClient.set).toHaveBeenCalled();
  });

  test("Should return 404 for overall analytics if no URLs exist", async () => {
    (prisma.shortUrl.findMany as jest.Mock).mockResolvedValue([]);

    const response = await request(app)
      .get("/api/analytics/overall")
      .expect(404);

    expect(response.body.error).toBe("No URLs found.");
  });
});
