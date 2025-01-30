import express from "express";
import dotenv from "dotenv";
import router from "./routes";
import rateLimit from "express-rate-limit";

dotenv.config();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests from this IP, please try again later." },
  headers: true,
});

export const app = express();

app.use(express.json());
app.use(router);
app.use(limiter);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
