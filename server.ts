import express from 'express';
import cors from 'cors';
import { Sha256LruCache } from './server/cache';
import { 
  createRateLimiter, 
  securityHeadersMiddleware, 
  safeErrorHandler 
} from './server/middleware';
import { 
  executeServerGroundedBriefing, 
  executeServerGroundedAnswer 
} from './server/aiService';
import { GroundedAIResponse } from './src/services/ai/types';

export const app = express();
const PORT = process.env.PORT || 3001;

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
const aiResponseCache = new Sha256LruCache<GroundedAIResponse>(100, 15 * 60 * 1000);

// --- REST Endpoints ---

/**
 * Health check & telemetry status
 */
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    version: '0.4.0',
    service: 'VayuSenseX Gateway',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Server-side grounded daily briefing
 */
app.post('/api/briefing', async (req, res, next) => {
  try {
    const { snapshot, plan, registry, standard } = req.body;
    if (!snapshot || !plan || !registry) {
      res.status(400).json({ error: 'Missing required payload: snapshot, plan, or registry' });
      return;
    }

    // SHA-256 Cache Check
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

    const response = await executeServerGroundedBriefing(snapshot, plan, registry, standard || 'CPCB');
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
    const { question, snapshot, plan, registry } = req.body;
    if (!question || !snapshot || !plan || !registry) {
      res.status(400).json({ error: 'Missing required payload: question, snapshot, plan, or registry' });
      return;
    }

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

    const response = await executeServerGroundedAnswer(question, snapshot, plan, registry);
    aiResponseCache.set(cacheKey, response);

    res.setHeader('X-Cache-Status', 'MISS');
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

// 6. Global error sanitizer (CWE-209 mitigation)
app.use(safeErrorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[VayuSenseX Gateway] Server running on port ${PORT}`);
  });
}
