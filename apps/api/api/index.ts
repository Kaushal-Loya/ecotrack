import { createApp } from '../src/app.js';

// Vercel serverless: export the Express app WITHOUT calling app.listen()
// dotenv is NOT used here — env vars are injected by Vercel at runtime.
const app = createApp();

module.exports = app;
