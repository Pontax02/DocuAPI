import cors from "cors";

import { env } from "./env.js"; 


export const corsOptions = cors({
    origin: env.ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
    
});
