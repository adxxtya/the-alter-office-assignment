jest.setTimeout(20000);
import request from "supertest";
import { app } from "../../src/index"; // Adjust based on your app setup
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.shortUrl.deleteMany(); // Clean up test data
  await prisma.$disconnect();
});

describe("Short URL API Tests", () => {
  let createdAlias: string;

  test("Should create a short URL successfully", async () => {
    const response = await request(app)
      .post("/api/shorten")
      .send({ longUrl: "https://example.com" })
      .expect(201);

    expect(response.body).toHaveProperty("shortUrl");
    createdAlias = response.body.alias; // Store alias for redirection test
  });

  test("Should return an error for invalid URL", async () => {
    const response = await request(app)
      .post("/api/shorten")
      .send({ longUrl: "invalid-url" })
      .expect(400);

    expect(response.body.error).toBe(
      "Invalid long URL. Please provide a valid URL."
    );
  });

  test("Should return an error for duplicate custom alias", async () => {
    await request(app)
      .post("/api/shorten")
      .send({ longUrl: "https://test.com", customAlias: "myalias" })
      .expect(201);

    const response = await request(app)
      .post("/api/shorten")
      .send({ longUrl: "https://test2.com", customAlias: "myalias" })
      .expect(409);

    expect(response.body.error).toBe(
      "Custom alias already in use. Please choose a different one."
    );
  });

  test("Should redirect successfully", async () => {
    const response = await request(app)
      .get(`/api/shorten/${createdAlias}`)
      .expect(301);
    expect(response.header.location).toBe("https://example.com");
  });

  test("Should return 404 for non-existent alias", async () => {
    const response = await request(app)
      .get(`/api/shorten/${createdAlias}s`)
      .expect(404);
    expect(response.body.error).toBe("Short URL not found");
  });
});
