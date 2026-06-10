import 'dotenv/config';
import { createApp } from './app.js';

const PORT = parseInt(process.env.PORT ?? '4000', 10);
const app = createApp();

const server = app.listen(PORT, () => {
  process.stdout.write(`🌿 Carbon Footprint API running on http://localhost:${PORT}\n`);
  process.stdout.write(`   Environment: ${process.env.NODE_ENV ?? 'development'}\n`);
});

// Graceful shutdown
const gracefulShutdown = (signal: string): void => {
  process.stdout.write(`\n${signal} received — shutting down gracefully…\n`);
  server.close(() => {
    process.stdout.write('HTTP server closed\n');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
