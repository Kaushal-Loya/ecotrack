import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';

// Test Zod validation schemas for auth endpoints
const registerSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/),
  name: z.string().trim().max(100).optional(),
});

describe('Auth validation schemas', () => {
  describe('registerSchema', () => {
    it('accepts valid registration data', () => {
      const result = registerSchema.safeParse({
        email: 'user@example.com',
        password: 'SecurePass1',
        name: 'Test User',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = registerSchema.safeParse({
        email: 'not-an-email',
        password: 'SecurePass1',
      });
      expect(result.success).toBe(false);
    });

    it('rejects password without uppercase', () => {
      const result = registerSchema.safeParse({
        email: 'user@example.com',
        password: 'weakpassword1',
      });
      expect(result.success).toBe(false);
    });

    it('rejects password without number', () => {
      const result = registerSchema.safeParse({
        email: 'user@example.com',
        password: 'WeakPassword',
      });
      expect(result.success).toBe(false);
    });

    it('rejects short password', () => {
      const result = registerSchema.safeParse({
        email: 'user@example.com',
        password: 'Sh0rt',
      });
      expect(result.success).toBe(false);
    });

    it('lowercases email', () => {
      const result = registerSchema.safeParse({
        email: 'USER@EXAMPLE.COM',
        password: 'ValidPass1',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
      }
    });

    it('accepts registration without optional name', () => {
      const result = registerSchema.safeParse({
        email: 'user@example.com',
        password: 'ValidPass1',
      });
      expect(result.success).toBe(true);
    });
  });
});
