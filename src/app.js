// app.js — Express application factory
// This file creates and configures the Express app instance.
// It is imported by server.js which actually starts the HTTP listener.

import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { corsOptions } from "./config/cors.js";
import { rateLimitOptions } from "./config/rateLimit.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import validateRoutes from "./routes/validate.routes.js";
import healthRouter from "./routes/health.routes.js";
import adminRouter from "./routes/admin.routes.js";
import { swaggerDocument } from "./config/swagger.js";

export const app = express();

// Pretty-print JSON responses with 2-space indentation
app.set('json spaces', 2);

// --- Global middleware stack (applied to every request) ---

// helmet() sets secure HTTP headers (XSS protection, clickjacking prevention, etc.)
app.use(helmet());

// CORS: restricts which origins can call the API
app.use(corsOptions);

// Rate limiter: caps how many requests a client can make in a time window
app.use(rateLimitOptions);

// Parse incoming JSON bodies; reject payloads larger than 10 MB
app.use(express.json({ limit: `10mb` }));

// --- Route mounting ---

// Document validation endpoint: POST /api/validate-document
app.use('/api', validateRoutes);

// Health check endpoint: GET /api/status
app.use('/api', healthRouter);

// Admin endpoints (protected by API key): GET /api/admin/logs
app.use('/api/admin', adminRouter);

// Interactive Swagger UI served at /docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// --- Error handling (must come AFTER all routes) ---

// Returns 404 for any route that didn't match above
app.use(notFoundHandler);

// Centralised error handler — catches errors forwarded via next(err)
app.use(errorHandler);
