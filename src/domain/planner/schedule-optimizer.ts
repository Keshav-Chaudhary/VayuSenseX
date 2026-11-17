import { HouseholdProfile } from '../household/types';
import { HourlyForecastPoint } from '../../services/environment/types';
import { DailyHouseholdPlan, OptimizedScheduleItem, ActionRecommendation } from './planner-types';
import { evaluateHourlyTimeWindows } from './time-windows';
import { getBreathingRate } from '../exposure/breathing-rates';
import { solveIndoorMassBalance } from '../indoor/mass-balance';

/**
 * Deterministically optimizes a household's daily schedule against forecast air quality.
 */
export function generateDailyHouseholdPlan(
  profile: HouseholdProfile,
  forecast: HourlyForecastPoint[],
  currentOutdoorPm25: number = 180
): DailyHouseholdPlan {
  const { cleanestWindow, worstPeakWindow } = evaluateHourlyTimeWindows(forecast);

  // Determine estimated indoor baseline PM2.5 with existing home purifier config
  const indoorMb = solveIndoorMassBalance({
    roomVolumeM3: profile.home.primaryRoomVolumeM3,
    outdoorPm25UgM3: currentOutdoorPm25,
    penetrationFactor: 0.70,
    airExchangeRateACH: profile.home.hasPurifier ? 0.3 : 0.8,
    depositionRateACH: 0.20,
    purifierCADRM3H: profile.home.hasPurifier ? profile.home.purifierCADRM3H : 0,
    filterEfficiency: 0.99,
    indoorGenerationRateUgH: profile.home.usesIncenseOrCoils ? 25000 : 0,
  });

  const estimatedIndoorPm25 = indoorMb.steadyStateConcentrationUgM3;

  const scheduleItems: OptimizedScheduleItem[] = [];
  const recommendations: ActionRecommendation[] = [];

  let totalDoseBefore = 0;
  let totalDoseAfter = 0;

  profile.routine.forEach((act) => {
    // 1. Calculate original dose
    const durationHours = act.durationMinutes / 60;
    const breathingRate = getBreathingRate('ADULT', act.exertionLevel);

    // Get forecast outdoor PM2.5 at original hour (or fallback)
    const forecastPointAtTime = forecast[act.startHour] || forecast[0];
    const outdoorPm25AtOriginalTime = forecastPointAtTime?.pm25 ?? currentOutdoorPm25;

    let ambientConcentrationBefore = outdoorPm25AtOriginalTime;
    if (act.environment === 'INDOOR') {
      ambientConcentrationBefore = estimatedIndoorPm25;
    } else if (act.environment === 'TRANSIT') {
      ambientConcentrationBefore = outdoorPm25AtOriginalTime * 1.1; // roadside exposure
    }

    const doseBefore = Math.round(ambientConcentrationBefore * breathingRate * durationHours);
    totalDoseBefore += doseBefore;

    // 2. Optimization Logic based on flexibility and environmental conditions
    let isModified = false;
    let suggestedHour = act.startHour;
    let suggestedMinute = act.startMinute;
    let modifiedReason: string | undefined;
    let ambientConcentrationAfter = ambientConcentrationBefore;

    // Rule A: Outdoor exercise during peak morning smog / inversion
    if (
      act.activityType === 'EXERCISE_OUTDOOR' &&
      outdoorPm25AtOriginalTime > 120 &&
      act.flexibility !== 'FIXED'
    ) {
      if (act.flexibility === 'CAN_SUBSTITUTE_INDOORS') {
        isModified = true;
        modifiedReason = 'Shifted from outdoor smog to indoor workout in purified room.';
        ambientConcentrationAfter = estimatedIndoorPm25;

        recommendations.push({
          id: `rec-${act.id}-substitute`,
          category: 'OUTDOOR_TIMING',
          title: `Move ${act.label} Indoors`,
          actionText: `Avoid outdoor jogging at ${act.startHour}:${act.startMinute.toString().padStart(2, '0')}. Perform indoor routine in your purified room instead.`,
          originalActivityId: act.id,
          originalTimeLabel: `${act.startHour}:${act.startMinute.toString().padStart(2, '0')}`,
          suggestedTimeLabel: 'Indoors (Anytime)',
          rationale: `Outdoor PM2.5 is forecast at ${outdoorPm25AtOriginalTime} µg/m³ during morning boundary-layer inversion. Indoor air is scrubbed to ~${estimatedIndoorPm25} µg/m³.`,
          estimatedDoseReductionUg: Math.round((ambientConcentrationBefore - ambientConcentrationAfter) * breathingRate * durationHours),
          priority: 'HIGH',
          status: 'SUGGESTED',
          supportingFactIds: ['fact-outdoor-pm25-current', 'fact-indoor-pm25-steady'],
        });
      } else if (act.flexibility === 'FLEXIBLE_TIME' && cleanestWindow) {
        isModified = true;
        suggestedHour = cleanestWindow.hourIndex;
        suggestedMinute = 0;
        modifiedReason = `Rescheduled to cleanest forecast window (${cleanestWindow.hourLabel}).`;
        ambientConcentrationAfter = cleanestWindow.pm25;

        recommendations.push({
          id: `rec-${act.id}-shift`,
          category: 'OUTDOOR_TIMING',
          title: `Reschedule ${act.label}`,
          actionText: `Shift outdoor activity from ${act.startHour}:00 to ${cleanestWindow.hourLabel}.`,
          originalActivityId: act.id,
          originalTimeLabel: `${act.startHour}:00`,
          suggestedTimeLabel: cleanestWindow.hourLabel,
          rationale: `Boundary layer height and solar heating enhance dispersion around ${cleanestWindow.hourLabel}, reducing exposure by ~${Math.round(((outdoorPm25AtOriginalTime - cleanestWindow.pm25) / outdoorPm25AtOriginalTime) * 100)}%.`,
          estimatedDoseReductionUg: Math.round((ambientConcentrationBefore - ambientConcentrationAfter) * breathingRate * durationHours),
          priority: 'HIGH',
          status: 'SUGGESTED',
          supportingFactIds: ['fact-cleanest-window-pm25', 'fact-outdoor-pm25-current'],
        });
      }
    }

    // Rule B: Outdoor errands during peak hours
    if (act.activityType === 'OUTDOOR_ERRAND' && act.flexibility === 'FLEXIBLE_TIME' && cleanestWindow && outdoorPm25AtOriginalTime > 150) {
      isModified = true;
      suggestedHour = Math.min(23, cleanestWindow.hourIndex + 1);
      modifiedReason = 'Rescheduled errand away from evening inversion accumulation.';
      ambientConcentrationAfter = cleanestWindow.pm25 * 1.15;
    }

    const doseAfter = Math.round(ambientConcentrationAfter * breathingRate * durationHours);
    totalDoseAfter += doseAfter;
    const itemDoseReduction = Math.max(0, doseBefore - doseAfter);
    const itemReductionPct = doseBefore > 0 ? Math.round((itemDoseReduction / doseBefore) * 100) : 0;

    scheduleItems.push({
      activityId: act.id,
      label: act.label,
      activityType: act.activityType,
      environment: isModified && modifiedReason?.includes('Indoors') ? 'INDOOR' : act.environment,
      originalStartHour: act.startHour,
      originalStartMinute: act.startMinute,
      suggestedStartHour: suggestedHour,
      suggestedStartMinute: suggestedMinute,
      durationMinutes: act.durationMinutes,
      isModified,
      modificationReason: modifiedReason,
      estimatedDoseBeforeUg: doseBefore,
      estimatedDoseAfterUg: doseAfter,
      doseReductionPercent: itemReductionPct,
      status: 'SUGGESTED',
    });
  });

  // Rule C: Indoor Combustion Mitigation Recommendation
  if (profile.home.usesIncenseOrCoils) {
    recommendations.push({
      id: 'rec-indoor-incense',
      category: 'SOURCE_MITIGATION',
      title: 'Cease Agarbatti / Incense Combustion',
      actionText: 'Switch from combustion incense sticks to flameless essential oil diffusers or dry potpourri.',
      rationale: 'Burning incense introduces ~22,000 µg/h of fine particulates indoors, undermining HEPA purifier capacity.',
      estimatedDoseReductionUg: Math.round(18000 * 0.45 * 2), // ~16,200 µg avoided over evening
      priority: 'HIGH',
      status: 'SUGGESTED',
      supportingFactIds: ['fact-indoor-incense-rate'],
    });
  }

  // Rule D: Purifier Operation Sizing Recommendation
  if (!profile.home.hasPurifier) {
    recommendations.push({
      id: 'rec-purifier-acquisition',
      category: 'INDOOR_PURIFICATION',
      title: 'Deploy HEPA or DIY Box-Fan Filtration',
      actionText: 'Install an air cleaner sized to at least 5 ACH (~250 m³/h CADR) in the primary bedroom.',
      rationale: 'During severe winter smog, indoor PM2.5 without active filtration remains 60-80% of hazardous outdoor concentrations.',
      estimatedDoseReductionUg: Math.round(totalDoseBefore * 0.40),
      priority: 'HIGH',
      status: 'SUGGESTED',
      supportingFactIds: ['fact-cadr-bedroom-required'],
    });
  }

  const netDoseReductionPercent = totalDoseBefore > 0
    ? Math.round(((totalDoseBefore - totalDoseAfter) / totalDoseBefore) * 100)
    : 0;

  const cleanestPeriodLabel = cleanestWindow ? `${cleanestWindow.hourLabel} (~${cleanestWindow.pm25} µg/m³)` : 'Midday (12:00 PM - 2:00 PM)';
  const worstPeriodLabel = worstPeakWindow ? `${worstPeakWindow.hourLabel} (~${worstPeakWindow.pm25} µg/m³)` : 'Early Morning (6:00 AM - 8:30 AM)';

  const overallStrategy = netDoseReductionPercent > 20
    ? `Proactive Schedule Optimization: By shifting flexible outdoor activities to the cleanest forecast window (${cleanestPeriodLabel}) and moving intense workouts indoors, your household avoids an estimated ${netDoseReductionPercent}% of daily particulate intake.`
    : `Maintenance Routine: Current activities largely avoid peak inversion periods (${worstPeriodLabel}). Continue maintaining sealed indoor microenvironments.`;

  return {
    planId: `plan-${Date.now()}`,
    planDate: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }),
    cityName: profile.city,
    overallStrategy,
    peakPollutionPeriod: worstPeriodLabel,
    cleanestAvailablePeriod: cleanestPeriodLabel,
    totalDoseBeforeUg: totalDoseBefore,
    totalDoseAfterUg: totalDoseAfter,
    netDoseReductionPercent,
    scheduleItems,
    recommendations,
    generatedAt: new Date().toISOString(),
  };
}
