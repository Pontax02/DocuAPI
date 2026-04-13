// server.js — HTTP server entry point
// Imports the configured Express app and starts listening on the port
// defined in the environment configuration.

import { app } from './app.js';
import { env } from './config/env.js';

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
});
