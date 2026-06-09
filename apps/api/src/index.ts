import 'dotenv/config';
import { createApp } from './app.js';

const PORT = parseInt(process.env.PORT ?? '4000', 10);
const app = createApp();

const server = app.listen(PORT, () => {
  console.log(`🌿 Carbon Footprint API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV ?? 'development'}`);
});

// Graceful shutdown
const gracefulShutdown = (signal: string): void => {
  console.log(`\n${signal} received — shutting down gracefully…`);
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
