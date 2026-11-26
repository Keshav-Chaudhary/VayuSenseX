import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { Sha256LruCache } from './server/cache';
import { 
  createRateLimiter, 
  securityHeadersMiddleware, 
  safeErrorHandler 
} from './server/middleware';
import { 
  executeServerGroundedBriefing, 
  executeServerGroundedAnswer,
  checkGeminiHealth,
} from './server/aiService';

function loadLocalEnv(): void {
  if (process.env.NODE_ENV === 'test') return;
  for (const fileName of ['.env.local', '.env']) {
    const filePath = path.join(process.cwd(), fileName);
    if (!fs.existsSync(filePath)) continue;
    const lines = fs.readFileSync(filePath, 'utf-8').split(/\r?\n/);
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eqIdx = line.indexOf('=');
      if (eqIdx <= 0) continue;
      const key = line.slice(0, eqIdx).trim();
      let val = line.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

loadLocalEnv();
import { 
  BriefingRequestSchema, 
  AssistRequestSchema 
} from './server/schemas';
import { GroundedAIResponse } from './src/services/ai/types';

export const app = express();
const PORT = process.env.PORT || 3001;

// Trust reverse proxies (Render, Vercel, Nginx, Cloudflare) for accurate client IP resolution
app.set('trust proxy', 1);

// 1. Perimeter Security Middleware
app.use(securityHeadersMiddleware);

// 2. Strict CORS allowlist
const corsOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || corsOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 3. 15 KB Request body limit to prevent denial of service (DoS)
app.use(express.json({ limit: '15kb' }));

// 4. Rate Limiting: 30 requests per minute
const apiLimiter = createRateLimiter(30, 60 * 1000);
app.use('/api/', apiLimiter);

// 5. In-Memory SHA-256 LRU Cache
export const aiResponseCache = new Sha256LruCache<GroundedAIResponse>(100, 15 * 60 * 1000);

// --- REST Endpoints ---

/**
 * Health check & telemetry status
 */
app.get('/api/health', async (req, res) => {
  const probe = req.query.probe === 'true';
  const gemini = await checkGeminiHealth(probe);
  res.status(200).json({
    status: 'healthy',
    version: '0.6.0',
    service: 'VayuSenseX Gateway',
    gemini,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Server-side grounded daily briefing
 */
app.post('/api/briefing', async (req, res, next) => {
  try {
    const parseResult = BriefingRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Invalid Request Payload',
        details: parseResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`),
      });
      return;
    }

    const { snapshot, plan, registry, standard } = parseResult.data;

    // SHA-256 Cache Check (Full 64-char hex digest)
    const cacheKey = aiResponseCache.hashKey({
      city: snapshot.location?.city,
      pm25: snapshot.pollutants?.pm25,
      cleanest: plan.cleanestAvailablePeriod,
      peak: plan.peakPollutionPeriod,
      standard: standard || 'CPCB',
    });

    const cached = aiResponseCache.get(cacheKey);
    if (cached) {
      res.setHeader('X-Cache-Status', 'HIT');
      res.status(200).json(cached);
      return;
    }

    const response = await executeServerGroundedBriefing(snapshot as any, plan as any, registry as any, standard || 'CPCB');
    aiResponseCache.set(cacheKey, response);

    res.setHeader('X-Cache-Status', 'MISS');
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

/**
 * Server-side grounded Q&A assistant
 */
app.post('/api/assist', async (req, res, next) => {
  try {
    const parseResult = AssistRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Invalid Request Payload',
        details: parseResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`),
      });
      return;
    }

    const { question, snapshot, plan, registry, history } = parseResult.data;
    const isMultiTurn = Array.isArray(history) && history.length > 0;

    if (!isMultiTurn) {
      const cacheKey = aiResponseCache.hashKey({
        q: question.trim().toLowerCase(),
        pm25: snapshot.pollutants?.pm25,
        city: snapshot.location?.city,
      });

      const cached = aiResponseCache.get(cacheKey);
      if (cached) {
        res.setHeader('X-Cache-Status', 'HIT');
        res.status(200).json(cached);
        return;
      }

      const response = await executeServerGroundedAnswer(question, snapshot as any, plan as any, registry as any, []);
      aiResponseCache.set(cacheKey, response);

      res.setHeader('X-Cache-Status', 'MISS');
      res.status(200).json(response);
      return;
    }

    const response = await executeServerGroundedAnswer(question, snapshot as any, plan as any, registry as any, history);
    res.setHeader('X-Cache-Status', 'BYPASS');
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

// 6. Serve production static bundle if built (unified App Hosting / Render / Docker mode)
const distDir = path.join(process.cwd(), 'dist');
const distIndex = path.join(distDir, 'index.html');
if (process.env.NODE_ENV !== 'test' && fs.existsSync(distIndex)) {
  app.use(express.static(distDir, { maxAge: '1y', index: false }));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/')) {
      res.sendFile(distIndex);
      return;
    }
    next();
  });
}

// 7. Global error sanitizer (CWE-209 mitigation)
app.use(safeErrorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[VayuSenseX Gateway] Server running on port ${PORT}`);
  });
}
