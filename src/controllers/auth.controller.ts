import { Request, Response } from "express";
import { verifyGoogleToken, createJWT } from "../config/google-auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const googleLogin = async (req: Request, res: Response) => {
  const { token } = req.body;

  try {
    const googleUser = await verifyGoogleToken(token);

    // Check if user already exists in the database

    if (!googleUser) {
      throw new Error("No google user found.");
    }

    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      // Create a new user if not found
      user = await prisma.user.create({
        data: {
          email: googleUser.email!,
          name: googleUser.name!,
          googleId: googleUser.sub, // Use Google user ID as unique identifier
          avatarUrl: googleUser.picture,
        },
      });
    }

    // Generate JWT
    const jwtToken = createJWT(user);

    return res.json({ token: jwtToken, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Google authentication failed" });
  }
};
