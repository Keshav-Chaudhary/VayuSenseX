import { CADRSizingResult, RoomDimensions } from './types';

/**
 * Calculates room volume in cubic meters from dimensions in meters.
 */
export function calculateRoomVolume(dimensions: RoomDimensions): number {
  const { lengthM, widthM, heightM } = dimensions;
  if (lengthM <= 0 || widthM <= 0 || heightM <= 0 || isNaN(lengthM) || isNaN(widthM) || isNaN(heightM)) {
    return 0;
  }
  return Number((lengthM * widthM * heightM).toFixed(2));
}

/**
 * Sizing calculation for air purifiers based on target Air Changes per Hour (ACH).
 * 
 * Target ACH Standards (AHAM & EPA):
 * - Baseline comfort / low smog: 3.0 ACH
 * - Severe winter smog / vulnerable individuals: 5.0 ACH
 */
export function evaluateCADRSizing(
  roomVolumeM3: number,
  providedCADRM3H: number,
  targetACH: number = 5.0
): CADRSizingResult {
  const validVolume = Math.max(1, roomVolumeM3);
  const requiredCADR = Number((validVolume * targetACH).toFixed(1));
  const achAchieved = Number(((providedCADRM3H / validVolume)).toFixed(2));
  const ratio = Number((providedCADRM3H / requiredCADR).toFixed(2));

  let assessment: CADRSizingResult['assessment'] = 'ACCEPTABLE';
  if (ratio < 0.7) {
    assessment = 'INSUFFICIENT';
  } else if (ratio < 1.0) {
    assessment = 'ACCEPTABLE';
  } else if (ratio <= 1.5) {
    assessment = 'OPTIMAL';
  } else {
    assessment = 'OVERSIZED';
  }

  return {
    roomVolumeM3: validVolume,
    targetACH,
    requiredCADRM3H: requiredCADR,
    providedCADRM3H,
    achAchieved,
    sufficiencyRatio: ratio,
    assessment,
  };
}
