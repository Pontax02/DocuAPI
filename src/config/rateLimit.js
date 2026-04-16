import rateLimit from "express-rate-limit";
import { env } from "./env.js";

export const rateLimitOptions = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
});
