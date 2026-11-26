import React from 'react';
import { GlobalHeader } from './GlobalHeader';
import { WorkspaceNavigation } from './WorkspaceNavigation';
import { AQIStandard } from '../../domain/types';

export type ActiveNavView = 
  | 'landing'
  | 'dashboard'
  | 'household'
  | 'planner'
  | 'assistant'
  | 'indoor'
  | 'exposure'
  | 'mobility'
  | 'impact'
  | 'community'
  | 'simulator'
  | 'methodology';

interface NavbarProps {
  currentView: ActiveNavView;
  onNavigate: (view: ActiveNavView) => void;
  standard: AQIStandard;
  onStandardChange: (standard: AQIStandard) => void;
  isSampleData: boolean;
  selectedCity: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  standard,
  onStandardChange,
  isSampleData,
  selectedCity,
}) => {
  if (currentView === 'landing') {
    return (
      <GlobalHeader
        onEnterDashboard={() => onNavigate('dashboard')}
        standard={standard}
        onStandardChange={onStandardChange}
        onNavigateMethodology={() => onNavigate('methodology')}
      />
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full" role="banner">
      <WorkspaceNavigation
        currentView={currentView}
        onNavigate={onNavigate}
        standard={standard}
        onStandardChange={onStandardChange}
        isSampleData={isSampleData}
        selectedCity={selectedCity}
      />
    </header>
  );
};
