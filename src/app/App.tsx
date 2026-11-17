import React, { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { LandingPage } from '../features/landing/LandingPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { MethodologyPage } from '../features/methodology/MethodologyPage';
import { SAMPLE_DELHI_SMOG, SAMPLE_BENGALURU_MODERATE } from '../domain/sample-data';
import { AQIStandard } from '../domain/types';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'methodology'>('landing');
  const [standard, setStandard] = useState<AQIStandard>('CPCB');
  const [cityKey, setCityKey] = useState<'delhi' | 'bengaluru'>('delhi');

  const activeSnapshot = cityKey === 'delhi' ? SAMPLE_DELHI_SMOG : SAMPLE_BENGALURU_MODERATE;

  return (
    <div className="flex flex-col min-h-screen bg-midnight-950 text-slate-100">
      {/* Skip to Content for Accessibility (WCAG 2.2 AA) */}
      <a 
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-cyan-500 text-midnight-950 font-bold rounded-lg shadow-lg"
      >
        Skip to main content
      </a>

      {/* Main Navigation Header */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        standard={standard}
        onStandardChange={setStandard}
        isSampleData={activeSnapshot.isSampleData}
        selectedCity={activeSnapshot.location.city}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 focus:outline-none">
        {currentView === 'landing' && (
          <LandingPage
            onEnterDashboard={() => setCurrentView('dashboard')}
            snapshot={activeSnapshot}
            standard={standard}
            onStandardChange={setStandard}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardPage
            snapshot={activeSnapshot}
            standard={standard}
            onStandardChange={setStandard}
            onSelectCity={setCityKey}
            activeCityKey={cityKey}
          />
        )}

        {currentView === 'methodology' && (
          <MethodologyPage />
        )}
      </main>

      {/* Persistent Footer */}
      <Footer />
    </div>
  );
};
