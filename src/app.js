import express from "express";
import helmet from "helmet";
import { corsOptions } from "./config/cors.js";
import { rateLimitOptions } from "./config/rateLimit.js";


export const app = express();



app.use(helmet());

app.use(corsOptions);


app.use(rateLimitOptions);

app.use(express.json({ limit: `10mb` }));