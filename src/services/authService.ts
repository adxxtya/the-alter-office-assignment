import { OAuth2Client } from "google-auth-library";
import config from "../config/config";
import User from "../models/Users";

const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);

export const authenticateGoogleUser = async (idToken: string) => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: config.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) throw new Error("Invalid token");

  const { email, name, sub: googleId } = payload;

  let user = await User.findOne({ where: { googleId } });
  if (!user) {
    user = await User.create({ email, name, googleId });
  }

  return user;
};
