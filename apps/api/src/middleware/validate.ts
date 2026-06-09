import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type Target = 'body' | 'query' | 'params';

/**
 * Middleware factory that validates request data with a Zod schema.
 * Unknown fields are stripped (Zod .strip() default) — no extra data passes through.
 */
export function validate(schema: ZodSchema, target: Target = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      return next(result.error); // passed to errorHandler which handles ZodError
    }
    // Replace with parsed (and stripped) data
    (req as unknown as Record<string, unknown>)[target] = result.data;
    next();
  };
}
