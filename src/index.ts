import express from "express";
import dotenv from "dotenv";
import router from "./routes";
import rateLimit from "express-rate-limit";
import { swaggerDocs } from "./swagger";
dotenv.config();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests from this IP, please try again later." },
  headers: true,
});

export const app = express();

app
  .use(express.json())
  .use(router)
  .use(limiter)
  .listen(process.env.PORT || 3000, () => {
    console.log(`Listening at http://localhost:${process.env.PORT || 3000}`);
    swaggerDocs(app, process.env.PORT || 3000);
  });
