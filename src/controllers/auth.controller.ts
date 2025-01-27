import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import User from "../models/Users";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const registerUser = async (req: Request, res: Response) => {
  const { tokenId } = req.body;
  const ticket = await client.verifyIdToken({
    idToken: tokenId,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const user = await User.findOrCreate({
    where: { email: payload?.email },
    defaults: { name: payload?.name, googleId: payload?.sub },
  });
  res.status(201).json({ user });
};

export const loginUser = async (req: Request, res: Response) => {
  const { tokenId } = req.body;
  const ticket = await client.verifyIdToken({
    idToken: tokenId,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const user = await User.findOne({ where: { googleId: payload?.sub } });
  res.status(200).json({ user });
};
