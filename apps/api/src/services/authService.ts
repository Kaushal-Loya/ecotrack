import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { ConflictError, AuthenticationError } from '../errors/AppError.js';
import type { JwtPayload, TokenPair } from '../types/index.js';

const BCRYPT_ROUNDS = 12;

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Environment variable ${key} is not set`);
  return value;
}

function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, getEnv('JWT_SECRET'), {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '15m') as jwt.SignOptions['expiresIn'],
  });
}

function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, getEnv('JWT_REFRESH_SECRET'), {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn'],
  });
}

export async function register(
  email: string,
  password: string,
  name?: string
): Promise<{ user: { id: string; email: string; name: string | null }; tokens: TokenPair }> {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ConflictError('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: { email, passwordHash, name: name ?? null },
    select: { id: true, email: true, name: true },
  });

  const jwtPayload: JwtPayload = { sub: user.id, email: user.email };
  const tokens: TokenPair = {
    accessToken: signAccessToken(jwtPayload),
    refreshToken: signRefreshToken(jwtPayload),
  };

  return { user, tokens };
}

export async function login(
  email: string,
  password: string
): Promise<{ user: { id: string; email: string; name: string | null }; tokens: TokenPair }> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Use same error and timing to prevent user enumeration
    await bcrypt.hash('dummy', BCRYPT_ROUNDS);
    throw new AuthenticationError('Invalid email or password');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AuthenticationError('Invalid email or password');
  }

  const jwtPayload: JwtPayload = { sub: user.id, email: user.email };
  const tokens: TokenPair = {
    accessToken: signAccessToken(jwtPayload),
    refreshToken: signRefreshToken(jwtPayload),
  };

  return { user: { id: user.id, email: user.email, name: user.name }, tokens };
}

export async function refresh(refreshToken: string): Promise<TokenPair> {
  let payload: JwtPayload;
  try {
    payload = jwt.verify(refreshToken, getEnv('JWT_REFRESH_SECRET')) as JwtPayload;
  } catch {
    throw new AuthenticationError('Invalid or expired refresh token');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    throw new AuthenticationError('User not found');
  }

  const jwtPayload: JwtPayload = { sub: user.id, email: user.email };
  return {
    accessToken: signAccessToken(jwtPayload),
    refreshToken: signRefreshToken(jwtPayload),
  };
}
