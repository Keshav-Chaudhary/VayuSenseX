import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Navbar, ActiveNavView } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { LandingPage } from '../features/landing/LandingPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';

const IndoorWorkbench = lazy(() => import('../features/indoor/IndoorWorkbench').then(m => ({ default: m.IndoorWorkbench })));
const ExposureWorkbench = lazy(() => import('../features/exposure/ExposureWorkbench').then(m => ({ default: m.ExposureWorkbench })));
const MobilityWorkbench = lazy(() => import('../features/mobility/MobilityWorkbench').then(m => ({ default: m.MobilityWorkbench })));
const SimulatorWorkbench = lazy(() => import('../features/simulator/SimulatorWorkbench').then(m => ({ default: m.SimulatorWorkbench })));
const MethodologyPage = lazy(() => import('../features/methodology/MethodologyPage').then(m => ({ default: m.MethodologyPage })));
const HouseholdWorkbench = lazy(() => import('../features/household/HouseholdWorkbench').then(m => ({ default: m.HouseholdWorkbench })));
const PlannerWorkbench = lazy(() => import('../features/planner/PlannerWorkbench').then(m => ({ default: m.PlannerWorkbench })));
const AIAssistantWorkbench = lazy(() => import('../features/assistant/AIAssistantWorkbench').then(m => ({ default: m.AIAssistantWorkbench })));
const ImpactWorkbench = lazy(() => import('../features/impact/ImpactWorkbench').then(m => ({ default: m.ImpactWorkbench })));
const CommunityHub = lazy(() => import('../features/community/CommunityHub').then(m => ({ default: m.CommunityHub })));
import { HouseholdStore } from '../domain/household/household-store';
import { HouseholdProfile } from '../domain/household/types';
import { SAMPLE_DELHI_SMOG, SAMPLE_BENGALURU_MODERATE } from '../domain/sample-data';
import { AQIStandard, EnvironmentalSnapshot } from '../domain/types';
import { fetchLiveEnvironmentalData } from '../services/environment/open-meteo';
import { searchLocations } from '../services/environment/geocoding';
import { HourlyForecastPoint, DataProvenance } from '../services/environment/types';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ActiveNavView>('landing');
  const [standard, setStandard] = useState<AQIStandard>('CPCB');
  const [cityKey, setCityKey] = useState<'delhi' | 'bengaluru'>('delhi');
  const [householdProfile, setHouseholdProfile] = useState<HouseholdProfile>(() => HouseholdStore.getProfile());

  // Telemetry state
  const [snapshot, setSnapshot] = useState<EnvironmentalSnapshot>(SAMPLE_DELHI_SMOG);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecastPoint[]>([]);
  const [cleanestWindow, setCleanestWindow] = useState<{ timestamp: string; pm25: number; hourLabel: string } | undefined>(undefined);
  const [provenance, setProvenance] = useState<DataProvenance>('ILLUSTRATIVE');
  const [isCached, setIsCached] = useState<boolean>(false);
  const [isStale, setIsStale] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [telemetryError, setTelemetryError] = useState<string | null>(null);

  // Load telemetry for given coordinates
  const loadTelemetry = useCallback(async (lat: number, lon: number, cityName: string, areaName: string) => {
    setIsLoading(true);
    setTelemetryError(null);
    try {
      const liveData = await fetchLiveEnvironmentalData(lat, lon, cityName, areaName);
      setSnapshot({
        location: liveData.location,
        timestamp: liveData.observedAt,
        isSampleData: false,
        source: liveData.sourceAttribution,
        sourceAttribution: 'Copernicus CAMS & Open-Meteo European Ensemble',
        pollutants: liveData.pollutants,
        weather: liveData.weather,
        cpcbAqi: liveData.cpcbAqi,
        usEpaAqi: liveData.usEpaAqi,
        stagnationRisk: liveData.stagnation.stagnationScore >= 75 ? 'CRITICAL' :
                        liveData.stagnation.stagnationScore >= 50 ? 'HIGH' :
                        liveData.stagnation.stagnationScore >= 30 ? 'MODERATE' : 'LOW',
      });
      setHourlyForecast(liveData.hourlyForecast);
      setCleanestWindow(liveData.cleanestForecastWindow);
      setProvenance(liveData.provenance);
      setIsCached(liveData.isCached);
      setIsStale(liveData.isStale);
    } catch {
      // Explicit offline degraded mode — never silently pretend fallback is live
      const fallback = cityName.toLowerCase().includes('bengaluru') ? SAMPLE_BENGALURU_MODERATE : SAMPLE_DELHI_SMOG;
      setSnapshot(fallback);
      setProvenance('ILLUSTRATIVE');
      setIsCached(false);
      setIsStale(true);
      setTelemetryError('Live Open-Meteo telemetry is currently unreachable. Displaying clearly labeled illustrative fallback data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Preset toggle handler
  const handleSelectCity = (key: 'delhi' | 'bengaluru') => {
    setCityKey(key);
    if (key === 'delhi') {
      loadTelemetry(28.6508, 77.3153, 'Delhi NCR', 'Anand Vihar Monitoring Sector');
    } else {
      loadTelemetry(12.9166, 77.6101, 'Bengaluru', 'BTM Layout Environmental Observatory');
    }
  };

  // Location search handler
  const handleSearchLocation = async (query: string) => {
    setIsLoading(true);
    try {
      const results = await searchLocations(query);
      if (results.length > 0) {
        const top = results[0]!;
        await loadTelemetry(top.latitude, top.longitude, top.name, top.label);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial telemetry load on mount
  useEffect(() => {
    loadTelemetry(28.6508, 77.3153, 'Delhi NCR', 'Anand Vihar Monitoring Sector');
  }, [loadTelemetry]);

  const activeOutdoorPm25 = snapshot.pollutants.pm25 ?? 150;

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)] text-[var(--fg)] font-sans">
      {/* Skip to Content for Accessibility (WCAG 2.2 AA) */}
      <a 
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-[var(--accent)] text-white font-bold rounded-xl shadow-[var(--shadow-md)]"
      >
        Skip to main content
      </a>

      {/* Main Navigation Header */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        standard={standard}
        onStandardChange={setStandard}
        isSampleData={snapshot.isSampleData}
        selectedCity={snapshot.location.city}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 focus:outline-none">
        {currentView === 'landing' && (
          <LandingPage
            onEnterDashboard={() => setCurrentView('dashboard')}
            snapshot={snapshot}
            standard={standard}
            onStandardChange={setStandard}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardPage
            snapshot={snapshot}
            standard={standard}
            onStandardChange={setStandard}
            onSelectCity={handleSelectCity}
            activeCityKey={cityKey}
            onSearchLocation={handleSearchLocation}
            onRefresh={() => loadTelemetry(snapshot.location.latitude, snapshot.location.longitude, snapshot.location.city, snapshot.location.area)}
            isLoading={isLoading}
            provenance={provenance}
            isCached={isCached}
            isStale={isStale}
            hourlyForecast={hourlyForecast}
            cleanestForecastWindow={cleanestWindow}
            telemetryError={telemetryError}
          />
        )}

        <Suspense
          fallback={
            <div className="max-w-7xl mx-auto px-4 py-12 text-center text-sm text-[var(--fg-muted)] font-mono">
              Loading environmental workbench...
            </div>
          }
        >
          {currentView === 'household' && (
            <HouseholdWorkbench onProfileChange={setHouseholdProfile} />
          )}

          {currentView === 'planner' && (
            <PlannerWorkbench
              profile={householdProfile}
              hourlyForecast={hourlyForecast}
              currentOutdoorPm25={activeOutdoorPm25}
            />
          )}

          {currentView === 'assistant' && (
            <AIAssistantWorkbench
              profile={householdProfile}
              snapshot={snapshot}
              hourlyForecast={hourlyForecast}
            />
          )}

          {currentView === 'indoor' && (
            <IndoorWorkbench currentOutdoorPm25={activeOutdoorPm25} />
          )}

          {currentView === 'exposure' && (
            <ExposureWorkbench currentOutdoorPm25={activeOutdoorPm25} />
          )}

          {currentView === 'mobility' && (
            <MobilityWorkbench
              currentOutdoorPm25={activeOutdoorPm25}
              currentCity={snapshot.location.city}
            />
          )}

          {currentView === 'impact' && (
            <ImpactWorkbench />
          )}

          {currentView === 'community' && (
            <CommunityHub currentCity={snapshot.location.city} />
          )}

          {currentView === 'simulator' && (
            <SimulatorWorkbench currentOutdoorPm25={activeOutdoorPm25} />
          )}

          {currentView === 'methodology' && (
            <MethodologyPage />
          )}
        </Suspense>
      </main>

      {/* Persistent Footer */}
      <Footer />
    </div>
  );
};
