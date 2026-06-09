import 'dotenv/config';
import { createApp } from '../src/app.js';

// Vercel serverless functions require the Express app to be exported,
// WITHOUT calling app.listen()
const app = createApp();

module.exports = app;
