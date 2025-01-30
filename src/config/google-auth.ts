import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Initialize OAuth2Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (token: string) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // Specify the client ID
    });

    const payload = ticket.getPayload();
    return payload; // { sub, name, email, picture }
  } catch (error) {
    throw new Error("Google token verification failed");
  }
};

export const createJWT = (user: any) => {
  const token = jwt.sign(
    { userId: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );
  return token;
};
