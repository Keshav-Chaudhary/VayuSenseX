import { z } from 'zod';

export const EnvironmentalSnapshotSchema = z.object({
  location: z.object({
    city: z.string().min(1).max(100),
    area: z.string().max(150).optional(),
    latitude: z.number(),
    longitude: z.number(),
  }),
  timestamp: z.string().optional(),
  pollutants: z.object({
    pm25: z.number().nonnegative().optional(),
    pm10: z.number().nonnegative().optional(),
    no2: z.number().nonnegative().optional(),
    so2: z.number().nonnegative().optional(),
    co: z.number().nonnegative().optional(),
    o3: z.number().nonnegative().optional(),
  }).passthrough(),
  weather: z.object({
    temperature: z.number().optional(),
    relativeHumidity: z.number().optional(),
    windSpeed: z.number().nonnegative().optional(),
  }).passthrough().optional(),
}).passthrough();

export const DailyHouseholdPlanSchema = z.object({
  cleanestAvailablePeriod: z.string().max(100).optional(),
  peakPollutionPeriod: z.string().max(100).optional(),
  netDoseReductionPercent: z.number().optional(),
}).passthrough();

export const FactRegistrySchema = z.object({
  facts: z.record(z.string(), z.any()),
}).passthrough();

export const BriefingRequestSchema = z.object({
  snapshot: EnvironmentalSnapshotSchema,
  plan: DailyHouseholdPlanSchema,
  registry: FactRegistrySchema,
  standard: z.enum(['CPCB', 'USEPA']).optional(),
});

export const ConversationTurnSchema = z.object({
  role: z.enum(['user', 'model']),
  text: z.string().min(1).max(1500),
});

export const AssistRequestSchema = z.object({
  question: z.string().min(1).max(500),
  snapshot: EnvironmentalSnapshotSchema,
  plan: DailyHouseholdPlanSchema,
  registry: FactRegistrySchema,
  history: z.array(ConversationTurnSchema).max(12).optional(),
});
