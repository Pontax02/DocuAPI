import rateLimit from "express-rate-limit";
import { env } from "./env.js";

export const rateLimitOptions = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,   // 15 min
    max: env.RATE_LIMIT_MAX,  // 100 requests
    standardHeaders: true,     
    legacyHeaders: false,     
});