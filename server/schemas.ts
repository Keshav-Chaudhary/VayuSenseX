import { z } from 'zod';

export const FactEntrySchema = z.union([
  z.object({
    id: z.string().max(120).optional(),
    value: z.number().finite(),
    unit: z.string().max(40).optional(),
    description: z.string().max(300).optional(),
    provenance: z.string().max(200).optional(),
    category: z.string().max(60).optional(),
  }).passthrough(),
  z.string().max(500),
  z.number().finite(),
]);

export const EnvironmentalSnapshotSchema = z.object({
  location: z.object({
    city: z.string().min(1).max(100),
    area: z.string().max(150).optional(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  timestamp: z.string().max(64).optional(),
  pollutants: z.object({
    pm25: z.number().nonnegative().max(10000).optional(),
    pm10: z.number().nonnegative().max(10000).optional(),
    no2: z.number().nonnegative().max(10000).optional(),
    so2: z.number().nonnegative().max(10000).optional(),
    co: z.number().nonnegative().max(100000).optional(),
    o3: z.number().nonnegative().max(10000).optional(),
  }).passthrough(),
  weather: z.object({
    temperature: z.number().min(-80).max(70).optional(),
    relativeHumidity: z.number().min(0).max(100).optional(),
    windSpeed: z.number().nonnegative().max(300).optional(),
  }).passthrough().optional(),
}).passthrough();

export const DailyHouseholdPlanSchema = z.object({
  cleanestAvailablePeriod: z.string().max(100).optional(),
  peakPollutionPeriod: z.string().max(100).optional(),
  netDoseReductionPercent: z.number().finite().optional(),
}).passthrough();

export const FactRegistrySchema = z.object({
  facts: z.record(z.string().max(120), FactEntrySchema),
}).passthrough();

export const BriefingRequestSchema = z.object({
  snapshot: EnvironmentalSnapshotSchema,
  plan: DailyHouseholdPlanSchema,
  registry: FactRegistrySchema,
  standard: z.enum(['CPCB', 'USEPA']).optional(),
}).strict();

export const ConversationTurnSchema = z.object({
  role: z.enum(['user', 'model']),
  text: z.string().min(1).max(1500),
}).strict();

export const AssistRequestSchema = z.object({
  question: z.string().min(1).max(500),
  snapshot: EnvironmentalSnapshotSchema,
  plan: DailyHouseholdPlanSchema,
  registry: FactRegistrySchema,
  history: z.array(ConversationTurnSchema).max(12).optional(),
}).strict();
