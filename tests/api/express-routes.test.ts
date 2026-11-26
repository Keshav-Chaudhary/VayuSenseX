import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import type { Server } from 'http';
import type { AddressInfo } from 'net';
import { app, aiResponseCache } from '../../server';
import { clearRateLimits } from '../../server/middleware';
import { SAMPLE_DELHI_SMOG } from '../../src/domain/sample-data';
import { generateDailyHouseholdPlan } from '../../src/domain/planner';
import { DEFAULT_HOUSEHOLD_PROFILE } from '../../src/domain/household';
import { buildFactRegistry } from '../../src/services/ai/fact-registry';

describe('Express 5 Security Gateway — End-to-End HTTP Route Tests', () => {
  let server: Server;
  let baseUrl: string;
  const plan = generateDailyHouseholdPlan(DEFAULT_HOUSEHOLD_PROFILE, [], 285);
  const registry = buildFactRegistry(SAMPLE_DELHI_SMOG, plan, 85, 22);

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr = server.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    vi.restoreAllMocks();
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  beforeEach(() => {
    clearRateLimits();
    aiResponseCache.clear();
    delete process.env.GEMINI_API_KEY;
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('GET /api/health returns 200 with full security headers and no X-Powered-By header', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.status).toBe(200);
    expect(res.headers.get('x-powered-by')).toBeNull();
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('x-frame-options')).toBe('DENY');
    expect(res.headers.get('permissions-policy')).toContain('camera=()');
    expect(res.headers.get('cross-origin-opener-policy')).toBe('same-origin');
    expect(res.headers.get('content-security-policy')).not.toContain("script-src 'self' 'unsafe-inline'");

    const json = await res.json();
    expect(json.status).toBe('healthy');
    expect(json.gemini.status).toBe('MISSING_KEY');
  });

  it('GET /api/unknown returns 404 JSON without leaking stack traces', async () => {
    const res = await fetch(`${baseUrl}/api/unknown-route`);
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe('Not Found');
  });

  it('rejects malformed JSON bodies cleanly with HTTP 400 and rejects out-of-range Zod coordinates', async () => {
    const malformed = await fetch(`${baseUrl}/api/assist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"question": invalid-json',
    });
    expect(malformed.status).toBe(400);
    const errJson = await malformed.json();
    expect(errJson.error).toBe('Malformed JSON');

    const badCoords = await fetch(`${baseUrl}/api/briefing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        snapshot: { location: { city: 'Test', latitude: 999, longitude: 77 }, pollutants: {} },
        plan: {},
        registry: { facts: {} },
      }),
    });
    expect(badCoords.status).toBe(400);
    const zodJson = await badCoords.json();
    expect(zodJson.error).toBe('Invalid Request Payload');
  });

  it('POST /api/briefing and /api/assist validate payloads and serve MISS then SHA-256 LRU HIT', async () => {
    const briefingBody = JSON.stringify({ snapshot: SAMPLE_DELHI_SMOG, plan, registry, standard: 'CPCB' });

    const b1 = await fetch(`${baseUrl}/api/briefing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: briefingBody,
    });
    expect(b1.status).toBe(200);
    expect(b1.headers.get('x-cache-status')).toBe('MISS');

    const b2 = await fetch(`${baseUrl}/api/briefing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: briefingBody,
    });
    expect(b2.status).toBe(200);
    expect(b2.headers.get('x-cache-status')).toBe('HIT');

    const assistBody = JSON.stringify({
      question: 'Should we open windows right now?',
      snapshot: SAMPLE_DELHI_SMOG,
      plan,
      registry,
    });
    const a1 = await fetch(`${baseUrl}/api/assist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: assistBody,
    });
    expect(a1.status).toBe(200);
    expect(a1.headers.get('x-cache-status')).toBe('MISS');

    const a2 = await fetch(`${baseUrl}/api/assist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: assistBody,
    });
    expect(a2.status).toBe(200);
    expect(a2.headers.get('x-cache-status')).toBe('HIT');
  });

  it('blocks disallowed CORS origins cleanly via sanitized error handler', async () => {
    const res = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: 'https://unauthorized.example.com' },
    });
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('Internal Server Error');
  });
});
