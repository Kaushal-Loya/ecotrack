/**
 * Shared PrismaClient singleton.
 *
 * A single PrismaClient instance is reused across the entire process.
 * Creating multiple instances wastes connection pool slots and is an
 * antipattern — particularly in serverless environments where each
 * invocation reuses the same module cache.
 *
 * Import this instead of calling `new PrismaClient()` directly.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
