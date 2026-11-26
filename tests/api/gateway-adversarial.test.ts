import { describe, it, expect, beforeEach, vi } from 'vitest';
import express from 'express';
import { createRateLimiter, securityHeadersMiddleware, safeErrorHandler, clearRateLimits } from '../../server/middleware';
import { Sha256LruCache } from '../../server/cache';
import { BriefingRequestSchema, AssistRequestSchema } from '../../server/schemas';

describe('Server Security Gateway Adversarial & Defensive Invariant Tests', () => {
  beforeEach(() => {
    clearRateLimits();
  });

  it('rejects malformed briefing payloads with explicit Zod validation issues', () => {
    const invalidPayload = {
      snapshot: { location: { city: '' } }, // city must have min 1 char
      plan: {},
      // missing registry
    };

    const result = BriefingRequestSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });

  it('rejects malformed assistant payloads exceeding maximum character limits', () => {
    const oversizedQuestion = 'A'.repeat(501); // Exceeds 500 char cap
    const result = AssistRequestSchema.safeParse({
      question: oversizedQuestion,
      snapshot: { location: { city: 'Delhi', latitude: 28.6, longitude: 77.2 } },
      plan: {},
      registry: { facts: {} },
    });

    expect(result.success).toBe(false);
  });

  it('sanitizes internal errors and mitigates CWE-209 information disclosure', () => {
    let capturedStatus = 0;
    let capturedBody: any = null;

    const mockRes: any = {
      headersSent: false,
      status: (code: number) => {
        capturedStatus = code;
        return {
          json: (data: any) => { capturedBody = data; },
        };
      },
    };

    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const sensitiveError = new Error('Database password failed at postgresql://admin:secretPass@10.0.0.1');
    safeErrorHandler(sensitiveError, {} as any, mockRes, () => {});
    errSpy.mockRestore();

    expect(capturedStatus).toBe(500);
    expect(capturedBody.error).toBe('Internal Server Error');
    expect(capturedBody.message).toContain('unexpected environmental gateway error');
    // Ensure no stack trace or sensitive connection string leaked to client
    expect(JSON.stringify(capturedBody)).not.toContain('secretPass');
    expect(JSON.stringify(capturedBody)).not.toContain('postgresql');
  });

  it('enforces conditional HSTS only in production HTTPS environments', () => {
    const originalEnv = process.env.NODE_ENV;

    // Test 1: Development over HTTP -> HSTS must NOT be set
    process.env.NODE_ENV = 'development';
    let devHeaders: Record<string, string> = {};
    const mockDevRes: any = {
      setHeader: (k: string, v: string) => { devHeaders[k] = v; },
    };
    securityHeadersMiddleware({ secure: false, headers: {} } as any, mockDevRes, () => {});
    expect(devHeaders['Strict-Transport-Security']).toBeUndefined();

    // Test 2: Production over HTTPS -> HSTS MUST be set
    process.env.NODE_ENV = 'production';
    let prodHeaders: Record<string, string> = {};
    const mockProdRes: any = {
      setHeader: (k: string, v: string) => { prodHeaders[k] = v; },
    };
    securityHeadersMiddleware({ secure: true, headers: {} } as any, mockProdRes, () => {});
    expect(prodHeaders['Strict-Transport-Security']).toBe('max-age=31536000; includeSubDomains');

    process.env.NODE_ENV = originalEnv;
  });

  it('tracks reverse proxy client IP via X-Forwarded-For safely', () => {
    const limiter = createRateLimiter(2, 60000);

    const makeReq = (forwardedFor: string) => {
      let status = 200;
      let nextCalled = false;
      const res: any = {
        setHeader: () => {},
        status: (c: number) => { status = c; return { json: () => {} }; },
      };
      const req: any = {
        headers: { 'x-forwarded-for': forwardedFor },
        socket: { remoteAddress: '10.0.0.1' }, // Reverse proxy IP
      };
      limiter(req, res, () => { nextCalled = true; });
      return { status, nextCalled };
    };

    // Client A (203.0.113.195)
    expect(makeReq('203.0.113.195, 10.0.0.1').nextCalled).toBe(true);
    expect(makeReq('203.0.113.195, 10.0.0.1').nextCalled).toBe(true);
    expect(makeReq('203.0.113.195, 10.0.0.1').status).toBe(429); // Client A blocked

    // Client B (198.51.100.22) behind same reverse proxy must NOT be blocked
    expect(makeReq('198.51.100.22, 10.0.0.1').nextCalled).toBe(true);
  });

  it('Sha256LruCache generates full 64-char hex digest and refuses to cache undefined/null', () => {
    const cache = new Sha256LruCache<string>(10);
    const key = cache.hashKey({ test: 'payload' });
    expect(key.length).toBe(64); // Full 256-bit collision-free digest

    cache.set('key-null', null as any);
    cache.set('key-undefined', undefined as any);
    expect(cache.get('key-null')).toBeNull();
    expect(cache.get('key-undefined')).toBeNull();
    expect(cache.size()).toBe(0);
  });
});
