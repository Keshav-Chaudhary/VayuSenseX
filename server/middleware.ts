import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Resets in-memory rate limits (primarily for testing and cache reset).
 */
export function clearRateLimits(): void {
  rateLimitMap.clear();
}

/**
 * IP-based in-memory rate limiter (default: 30 requests per minute).
 * Safely extracts client IP taking reverse proxies into account.
 */
export function createRateLimiter(maxRequests = 30, windowMs = 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Determine client IP safely: req.ip (when trust proxy is set) or remoteAddress
    const rawForwarded = req.headers['x-forwarded-for'];
    const forwardedIp = Array.isArray(rawForwarded) 
      ? rawForwarded[0]?.trim() 
      : typeof rawForwarded === 'string' 
      ? rawForwarded.split(',')[0]?.trim() 
      : undefined;

    const ip = req.ip || forwardedIp || req.socket.remoteAddress || 'unknown-client';
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
  // Content Security Policy (strict defaults aligned with Firebase Hosting)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.open-meteo.com https://air-quality-api.open-meteo.com https://geocoding-api.open-meteo.com https://nominatim.openstreetmap.org https://generativelanguage.googleapis.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'"
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

  // Strict Transport Security (HSTS) - enabled strictly in production HTTPS environments
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  if (process.env.NODE_ENV === 'production' && isHttps) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
}

/**
 * Safe global error sanitizer middleware (CWE-209 mitigation).
 * Maps malformed JSON syntax errors cleanly to HTTP 400 and hides stack traces on 500.
 */
export function safeErrorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('[VayuSenseX Gateway Error]:', err.message);

  if (res.headersSent) {
    return;
  }

  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      error: 'Malformed JSON',
      message: 'Request body must contain valid JSON.',
    });
    return;
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected environmental gateway error occurred.',
  });
}
