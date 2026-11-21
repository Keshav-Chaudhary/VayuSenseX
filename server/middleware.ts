import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * IP-based in-memory rate limiter (default: 30 requests per minute).
 */
export function createRateLimiter(maxRequests = 30, windowMs = 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-client';
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now > record.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
      next();
      return;
    }

    if (record.count >= maxRequests) {
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please retry after 1 minute.',
      });
      return;
    }

    record.count++;
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - record.count);
    next();
  };
}

/**
 * Strict Security Headers Middleware (Helmet-equivalent standard).
 */
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Content Security Policy (strict defaults)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https:; connect-src 'self' https://api.open-meteo.com https://nominatim.openstreetmap.org https://generativelanguage.googleapis.com;"
  );
  // Defend against MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Defend against clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // Defend against cross-site scripting in legacy browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Strict Transport Security (HSTS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
}

/**
 * Safe global error sanitizer middleware (CWE-209 mitigation).
 * Logs exception stack trace server-side and returns generic error response to client.
 */
export function safeErrorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  // Server-side logging without exposing secrets
  console.error('[VayuSenseX Gateway Error]:', err.message);

  if (res.headersSent) {
    return;
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected environmental gateway error occurred.',
  });
}
