import { LocationSearchResult } from './types';

/**
 * Pre-calibrated high-relevance urban centers for instant zero-latency demonstration.
 */
export const PRESET_URBAN_LOCATIONS: LocationSearchResult[] = [
  {
    id: 'delhi-anand-vihar',
    name: 'Delhi NCR',
    label: 'Anand Vihar, Delhi NCR, India (Severe Winter Smog Hotspot)',
    latitude: 28.6508,
    longitude: 77.3153,
    country: 'India',
    state: 'Delhi',
  },
  {
    id: 'bengaluru-btm',
    name: 'Bengaluru',
    label: 'BTM Layout, Bengaluru, Karnataka, India (Moderate Baseline)',
    latitude: 12.9166,
    longitude: 77.6101,
    country: 'India',
    state: 'Karnataka',
  },
  {
    id: 'mumbai-bandra',
    name: 'Mumbai',
    label: 'Bandra Kurla Complex, Mumbai, Maharashtra, India',
    latitude: 19.0657,
    longitude: 72.8687,
    country: 'India',
    state: 'Maharashtra',
  },
  {
    id: 'kolkata-victoria',
    name: 'Kolkata',
    label: 'Maidan / Victoria, Kolkata, West Bengal, India',
    latitude: 22.5448,
    longitude: 88.3426,
    country: 'India',
    state: 'West Bengal',
  },
  {
    id: 'lahore-gulberg',
    name: 'Lahore',
    label: 'Gulberg, Lahore, Punjab, Pakistan (Severe Winter Smog Corridor)',
    latitude: 31.5204,
    longitude: 74.3587,
    country: 'Pakistan',
  },
  {
    id: 'london-central',
    name: 'London',
    label: 'Westminster, London, United Kingdom',
    latitude: 51.5074,
    longitude: -0.1278,
    country: 'United Kingdom',
  },
];

/**
 * Searches locations using OpenStreetMap Nominatim API with fallback to presets.
 */
export async function searchLocations(query: string): Promise<LocationSearchResult[]> {
  const sanitized = query.trim().toLowerCase();
  if (!sanitized || sanitized.length < 2) {
    return PRESET_URBAN_LOCATIONS.slice(0, 4);
  }

  // Check matching presets first
  const matchingPresets = PRESET_URBAN_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(sanitized) ||
      loc.label.toLowerCase().includes(sanitized) ||
      loc.country.toLowerCase().includes(sanitized)
  );

  if (matchingPresets.length >= 2) {
    return matchingPresets;
  }

  // Query Nominatim API with 3-second timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      sanitized
    )}&limit=5&addressdetails=1`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'VayuSenseX-Environmental-Decision-Platform/1.0 (academic/challenge submission)',
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return matchingPresets.length > 0 ? matchingPresets : PRESET_URBAN_LOCATIONS.slice(0, 3);
    }

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const results: LocationSearchResult[] = data.map((item: any, idx: number) => ({
        id: `osm-${item.osm_id || idx}`,
        name: item.name || item.display_name.split(',')[0],
        label: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        country: item.address?.country || '',
        state: item.address?.state,
      }));

      return [...matchingPresets, ...results].slice(0, 6);
    }
  } catch {
    // Network or timeout fallback
  }

  return matchingPresets.length > 0 ? matchingPresets : PRESET_URBAN_LOCATIONS.slice(0, 3);
}
