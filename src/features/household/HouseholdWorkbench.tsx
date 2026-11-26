import React, { useState } from 'react';
import { 
  Users, Home, Calendar, RotateCcw, 
  Download, Upload, Check, Sparkles, AlertCircle 
} from 'lucide-react';
import { HouseholdStore } from '../../domain/household/household-store';
import { downloadJsonFile } from '../../lib/downloadJson';
import { HomeSettingsTab } from './HomeSettingsTab';
import { MembersTab } from './MembersTab';
import { RoutineScheduleTab } from './RoutineScheduleTab';
import { 
  HouseholdProfile, 
  FamilyMember, 
  HouseholdActivity, 
} from '../../domain/household/types';

interface HouseholdWorkbenchProps {
  onProfileChange?: (profile: HouseholdProfile) => void;
}

export const HouseholdWorkbench: React.FC<HouseholdWorkbenchProps> = ({ onProfileChange }) => {
  const [profile, setProfile] = useState<HouseholdProfile>(() => HouseholdStore.getProfile());
  const [activeTab, setActiveTab] = useState<'members' | 'home' | 'routine'>('members');
  const [saveNotification, setSaveNotification] = useState<string | null>(null);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);

  const notify = (msg: string) => {
    setErrorAlert(null);
    setSaveNotification(msg);
    setTimeout(() => setSaveNotification(null), 3000);
  };

  const updateProfileAndSave = (updated: HouseholdProfile) => {
    setProfile(updated);
    HouseholdStore.saveProfile(updated);
    onProfileChange?.(updated);
    notify('Profile updated and saved to local storage');
  };

  const handleReset = () => {
    HouseholdStore.resetToDefault();
    const fresh = HouseholdStore.getProfile();
    setProfile(fresh);
    onProfileChange?.(fresh);
    notify('Reset to default Sharma Family benchmark profile');
  };

  const handleExport = () => {
    downloadJsonFile(`vayusensex_household_${profile.id}.json`, HouseholdStore.exportProfileJSON());
    notify('Household profile exported');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.addEventListener('load', (event) => {
        try {
          const json = event.target?.result as string;
          const imported = HouseholdStore.importProfileJSON(json);
          setProfile(imported);
          onProfileChange?.(imported);
          notify('Profile successfully imported and verified');
        } catch {
          setErrorAlert('Failed to parse household JSON file. Please ensure valid schema.');
        }
      });
      fileReader.readAsText(e.target.files[0], 'UTF-8');
    }
  };

  const handleAddMember = (member: FamilyMember) => {
    updateProfileAndSave({
      ...profile,
      members: [...profile.members, member],
      updatedAt: new Date().toISOString(),
    });
  };

  const handleRemoveMember = (id: string) => {
    if (profile.members.length <= 1) {
      setErrorAlert('A household must have at least one member.');
      return;
    }
    updateProfileAndSave({
      ...profile,
      members: profile.members.filter(m => m.id !== id),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddActivity = (activity: HouseholdActivity) => {
    updateProfileAndSave({
      ...profile,
      routine: [...profile.routine, activity],
      updatedAt: new Date().toISOString(),
    });
  };

  const handleRemoveActivity = (id: string) => {
    updateProfileAndSave({
      ...profile,
      routine: profile.routine.filter(a => a.id !== id),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 relative overflow-hidden bg-gradient-to-r from-midnight-900 via-midnight-950 to-midnight-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized Household Environmental Twin</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {profile.name}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Configured for {profile.city} ({profile.area}) • {profile.members.length} Family Members • Local-First Storage
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExport}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-midnight-800 hover:bg-midnight-700 border border-white/10 text-xs font-medium text-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export JSON</span>
            </button>
            <label className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-midnight-800 hover:bg-midnight-700 border border-white/10 text-xs font-medium text-slate-200 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-teal-400" />
              <span>Import JSON</span>
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            <button
              onClick={handleReset}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-midnight-800 hover:bg-amber-950/60 border border-amber-500/20 text-xs font-medium text-amber-300 transition-colors"
              title="Reset to benchmark Sharma Family profile"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Benchmark</span>
            </button>
          </div>
        </div>

        {saveNotification && (
          <div role="status" aria-live="polite" className="mt-4 p-2.5 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs flex items-center space-x-2 animate-fade-in">
            <Check className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{saveNotification}</span>
          </div>
        )}
        {errorAlert && (
          <div role="alert" className="mt-4 p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2">
            <span className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorAlert}</span>
            </span>
            <button onClick={() => setErrorAlert(null)} className="text-[11px] font-semibold hover:text-white underline">
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'members'
              ? 'bg-cyan-500 text-midnight-950 font-bold shadow-glow-cyan'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Family Members ({profile.members.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('home')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'home'
              ? 'bg-cyan-500 text-midnight-950 font-bold shadow-glow-cyan'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home & Filtration</span>
        </button>

        <button
          onClick={() => setActiveTab('routine')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'routine'
              ? 'bg-cyan-500 text-midnight-950 font-bold shadow-glow-cyan'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Daily Routine ({profile.routine.length})</span>
        </button>
      </div>

      {/* Tab 1: Family Members */}
      {activeTab === 'members' && (
        <MembersTab
          members={profile.members}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
        />
      )}

      {/* Tab 2: Home & Filtration Configuration */}
      {activeTab === 'home' && (
        <HomeSettingsTab profile={profile} onUpdateProfile={updateProfileAndSave} />
      )}

      {/* Tab 3: Daily Routine Schedule */}
      {activeTab === 'routine' && (
        <RoutineScheduleTab
          routine={profile.routine}
          onAddActivity={handleAddActivity}
          onRemoveActivity={handleRemoveActivity}
        />
      )}

      {/* Local-first Privacy Banner */}
      <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs flex items-start space-x-3 text-slate-300">
        <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-white">Local-First Environmental Privacy Guarantee:</strong> Your household schedule, family member sensitivity tiers, and dwelling dimensions are persisted exclusively inside your browser's private local storage. No health or personal telemetry is transmitted to remote databases.
        </p>
      </div>
    </div>
  );
};
