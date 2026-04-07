import express from "express";
import helmet from "helmet";
import { corsOptions } from "./config/cors.js";
import { rateLimitOptions } from "./config/rateLimit.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import validateRoutes from "./routes/validate.routes.js";
import healthRouter from "./routes/health.routes.js";
import adminRouter from "./routes/admin.routes.js";



export const app = express();

app.set('json spaces', 2);



app.use(helmet());
app.use(corsOptions);
app.use(rateLimitOptions);
app.use(express.json({ limit: `10mb` }));

app.use('/api', validateRoutes);
app.use('/api', healthRouter);
app.use('/api/admin', adminRouter);

app.use(notFoundHandler);

app.use(errorHandler);


