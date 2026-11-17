import React, { useState } from 'react';
import { 
  Users, Home, Calendar, Plus, Trash2, RotateCcw, 
  Download, Upload, Check, Sparkles, AlertCircle 
} from 'lucide-react';
import { HouseholdStore } from '../../domain/household/household-store';
import { 
  HouseholdProfile, 
  FamilyMember, 
  HouseholdActivity, 
  AgeGroup,
  EnvironmentalSensitivity, 
  ActivityType,
  ActivityFlexibility,
  HomeType,
  CookingFuel
} from '../../domain/household/types';
import { ExertionLevel } from '../../domain/exposure/types';
import { TransportMode } from '../../domain/sustainability/types';

interface HouseholdWorkbenchProps {
  onProfileChange?: (profile: HouseholdProfile) => void;
}

export const HouseholdWorkbench: React.FC<HouseholdWorkbenchProps> = ({ onProfileChange }) => {
  const [profile, setProfile] = useState<HouseholdProfile>(() => HouseholdStore.getProfile());
  const [activeTab, setActiveTab] = useState<'members' | 'home' | 'routine'>('members');
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  // New member form
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAgeGroup, setNewMemberAgeGroup] = useState<AgeGroup>('ADULT');
  const [newMemberSensitivity, setNewMemberSensitivity] = useState<EnvironmentalSensitivity>('STANDARD');
  const [newMemberOutdoorMin, setNewMemberOutdoorMin] = useState<number>(60);
  const [newMemberCommute, setNewMemberCommute] = useState<TransportMode>('PETROL_CAR');
  const [newMemberNotes, setNewMemberNotes] = useState('');

  // New activity form
  const [newActLabel, setNewActLabel] = useState('');
  const [newActType, setNewActType] = useState<ActivityType>('EXERCISE_OUTDOOR');
  const [newActEnv, setNewActEnv] = useState<'INDOOR' | 'OUTDOOR' | 'TRANSIT'>('OUTDOOR');
  const [newActExertion, setNewActExertion] = useState<ExertionLevel>('MODERATE_EXERCISE');
  const [newActStartHour, setNewActStartHour] = useState<number>(7);
  const [newActDuration, setNewActDuration] = useState<number>(45);
  const [newActFlexibility, setNewActFlexibility] = useState<ActivityFlexibility>('CAN_SUBSTITUTE_INDOORS');
  const [newActPriority, setNewActPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');

  const notify = (msg: string) => {
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
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(HouseholdStore.exportProfileJSON());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `vayusensex_household_${profile.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    notify('Household profile exported');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const json = event.target?.result as string;
          const imported = HouseholdStore.importProfileJSON(json);
          setProfile(imported);
          onProfileChange?.(imported);
          notify('Profile successfully imported and verified');
        } catch {
          alert('Failed to parse household JSON file. Please ensure valid schema.');
        }
      };
    }
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const member: FamilyMember = {
      id: `mem-${Date.now()}`,
      name: newMemberName.trim(),
      ageGroup: newMemberAgeGroup,
      sensitivity: newMemberSensitivity,
      dailyOutdoorMinutes: newMemberOutdoorMin,
      commuteMode: newMemberCommute,
      notes: newMemberNotes.trim() || undefined,
    };

    const updated: HouseholdProfile = {
      ...profile,
      members: [...profile.members, member],
      updatedAt: new Date().toISOString(),
    };

    updateProfileAndSave(updated);
    setNewMemberName('');
    setNewMemberNotes('');
  };

  const handleRemoveMember = (id: string) => {
    if (profile.members.length <= 1) {
      alert('A household must have at least one member.');
      return;
    }
    const updated: HouseholdProfile = {
      ...profile,
      members: profile.members.filter(m => m.id !== id),
      updatedAt: new Date().toISOString(),
    };
    updateProfileAndSave(updated);
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActLabel.trim()) return;

    const activity: HouseholdActivity = {
      id: `act-${Date.now()}`,
      label: newActLabel.trim(),
      activityType: newActType,
      environment: newActEnv,
      exertionLevel: newActExertion,
      startHour: newActStartHour,
      startMinute: 0,
      durationMinutes: newActDuration,
      flexibility: newActFlexibility,
      priority: newActPriority,
    };

    const updated: HouseholdProfile = {
      ...profile,
      routine: [...profile.routine, activity],
      updatedAt: new Date().toISOString(),
    };

    updateProfileAndSave(updated);
    setNewActLabel('');
  };

  const handleRemoveActivity = (id: string) => {
    const updated: HouseholdProfile = {
      ...profile,
      routine: profile.routine.filter(a => a.id !== id),
      updatedAt: new Date().toISOString(),
    };
    updateProfileAndSave(updated);
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
          <div className="mt-4 p-2.5 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs flex items-center space-x-2 animate-fade-in">
            <Check className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{saveNotification}</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span>Configured Family Roster</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.members.map((member) => (
                <div
                  key={member.id}
                  className="glass-card p-5 rounded-xl border border-white/10 bg-midnight-900/60 relative group hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-base">{member.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-midnight-800 text-slate-300 border border-white/5 font-mono">
                          {member.ageGroup}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 capitalize mt-0.5">
                        Commute: {member.commuteMode.replace(/_/g, ' ')} • {member.dailyOutdoorMinutes}m outdoors
                      </p>
                    </div>

                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Vulnerability Sensitivity:</span>
                    <span className={`px-2 py-0.5 rounded-md font-semibold ${
                      member.sensitivity === 'HIGH'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : member.sensitivity === 'MODERATE'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {member.sensitivity}
                    </span>
                  </div>

                  {member.notes && (
                    <div className="mt-2.5 text-[11px] text-slate-400 italic">
                      "{member.notes}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add Member Form */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-midnight-900/40 h-fit space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Add Family Member</span>
            </h3>

            <form onSubmit={handleAddMember} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Age Group</label>
                  <select
                    value={newMemberAgeGroup}
                    onChange={(e) => setNewMemberAgeGroup(e.target.value as AgeGroup)}
                    className="w-full px-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="ADULT">Adult (18-64)</option>
                    <option value="CHILD">Child (&lt;18)</option>
                    <option value="OLDER_ADULT">Older Adult (65+)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Sensitivity</label>
                  <select
                    value={newMemberSensitivity}
                    onChange={(e) => setNewMemberSensitivity(e.target.value as EnvironmentalSensitivity)}
                    className="w-full px-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="HIGH">High (Vulnerable)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Outdoor Time (min/day)</label>
                  <input
                    type="number"
                    min="0"
                    max="720"
                    step="15"
                    value={newMemberOutdoorMin}
                    onChange={(e) => setNewMemberOutdoorMin(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Commute Mode</label>
                  <select
                    value={newMemberCommute}
                    onChange={(e) => setNewMemberCommute(e.target.value as TransportMode)}
                    className="w-full px-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white"
                  >
                    <option value="METRO">Metro Rail</option>
                    <option value="BUS">City Bus</option>
                    <option value="PETROL_CAR">Petrol Car</option>
                    <option value="EV_CAR">Electric Car</option>
                    <option value="TWO_WHEELER_PETROL">Two-Wheeler</option>
                    <option value="BICYCLE">Bicycle</option>
                    <option value="WALKING">Walking</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Health Notes / Sensitivity Context</label>
                <input
                  type="text"
                  placeholder="e.g. Mild seasonal asthma, outdoor sports"
                  value={newMemberNotes}
                  onChange={(e) => setNewMemberNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-midnight-950 font-bold hover:brightness-110 transition-all shadow-glow-cyan"
              >
                Add Member to Roster
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Home & Filtration Configuration */}
      {activeTab === 'home' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-midnight-900/60 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Home className="w-5 h-5 text-cyan-400" />
              <span>Dwelling Architecture & Dimensions</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Dwelling Type</label>
                <select
                  value={profile.home.homeType}
                  onChange={(e) => {
                    const updated = {
                      ...profile,
                      home: { ...profile.home, homeType: e.target.value as HomeType }
                    };
                    updateProfileAndSave(updated);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white"
                >
                  <option value="APARTMENT">Multi-Story Apartment</option>
                  <option value="INDEPENDENT_HOUSE">Independent House / Villa</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Primary Room Internal Air Volume (m³)</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="20"
                    max="150"
                    step="2"
                    value={profile.home.primaryRoomVolumeM3}
                    onChange={(e) => {
                      const updated = {
                        ...profile,
                        home: { ...profile.home, primaryRoomVolumeM3: Number(e.target.value) }
                      };
                      updateProfileAndSave(updated);
                    }}
                    className="flex-1 accent-cyan-400"
                  />
                  <span className="font-mono text-cyan-300 text-sm font-bold w-16">
                    {profile.home.primaryRoomVolumeM3} m³
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Typical bedroom: 40-55 m³. Living hall: 70-120 m³.
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Window Sealing Quality</label>
                <select
                  value={profile.home.windowSealingQuality}
                  onChange={(e) => {
                    const updated = {
                      ...profile,
                      home: { ...profile.home, windowSealingQuality: e.target.value as any }
                    };
                    updateProfileAndSave(updated);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white"
                >
                  <option value="TIGHT_WEATHERSTRIPPED">Tight Weatherstripped (Modern double-pane, low drafts)</option>
                  <option value="STANDARD">Standard Masonry & Gasket (Typical urban flat)</option>
                  <option value="DRAFTY">Drafty / Loose Fitting (Higher outdoor particulate infiltration)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-midnight-900/60 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-teal-400" />
              <span>Air Filtration & Indoor Sources</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-midnight-950/80 border border-white/5">
                <div>
                  <span className="font-bold text-white block">Mechanical Air Purifier Present</span>
                  <span className="text-[11px] text-slate-400">Enables active HEPA aerosol clearance</span>
                </div>
                <input
                  type="checkbox"
                  checked={profile.home.hasPurifier}
                  onChange={(e) => {
                    const updated = {
                      ...profile,
                      home: { ...profile.home, hasPurifier: e.target.checked }
                    };
                    updateProfileAndSave(updated);
                  }}
                  className="rounded bg-midnight-950 border-white/20 text-cyan-500 focus:ring-0 w-4 h-4"
                />
              </div>

              {profile.home.hasPurifier && (
                <>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Purifier CADR Rating (m³/h)</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="range"
                        min="50"
                        max="600"
                        step="10"
                        value={profile.home.purifierCADRM3H}
                        onChange={(e) => {
                          const updated = {
                            ...profile,
                            home: { ...profile.home, purifierCADRM3H: Number(e.target.value) }
                          };
                            updateProfileAndSave(updated);
                        }}
                        className="flex-1 accent-teal-400"
                      />
                      <span className="font-mono text-teal-300 text-sm font-bold w-20">
                        {profile.home.purifierCADRM3H} m³/h
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Filter Media Standard</label>
                    <select
                      value={profile.home.filterType}
                      onChange={(e) => {
                        const updated = {
                          ...profile,
                          home: { ...profile.home, filterType: e.target.value as any }
                        };
                        updateProfileAndSave(updated);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white"
                    >
                      <option value="HEPA">True HEPA (H13/H14 99.97% retention)</option>
                      <option value="MERV13_BOX_FAN">MERV 13 Corsi-Rosenthal DIY Box Fan</option>
                      <option value="BASIC_CARBON">Basic Carbon/Pre-Filter</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-slate-300 font-medium mb-1">Primary Kitchen Cooking Fuel</label>
                <select
                  value={profile.home.cookingFuel}
                  onChange={(e) => {
                    const updated = {
                      ...profile,
                      home: { ...profile.home, cookingFuel: e.target.value as CookingFuel }
                    };
                    updateProfileAndSave(updated);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white"
                >
                  <option value="INDUCTION">Induction / Clean Electric</option>
                  <option value="LPG">LPG Cylinder</option>
                  <option value="PIPED_GAS">Piped Natural Gas (PNG)</option>
                  <option value="BIOMASS">Biomass / Solid Fuel</option>
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5">
                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.home.hasKitchenExhaust}
                    onChange={(e) => {
                      const updated = {
                        ...profile,
                        home: { ...profile.home, hasKitchenExhaust: e.target.checked }
                      };
                      updateProfileAndSave(updated);
                    }}
                    className="rounded bg-midnight-950 border-white/20 text-cyan-500 focus:ring-0"
                  />
                  <span>Functional High-Velocity Kitchen Chimney / Exhaust Hood</span>
                </label>

                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.home.usesIncenseOrCoils}
                    onChange={(e) => {
                      const updated = {
                        ...profile,
                        home: { ...profile.home, usesIncenseOrCoils: e.target.checked }
                      };
                      updateProfileAndSave(updated);
                    }}
                    className="rounded bg-midnight-950 border-white/20 text-rose-500 focus:ring-0"
                  />
                  <span>Regular Burning of Incense (Agarbatti) or Mosquito Coils</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Daily Routine Schedule */}
      {activeTab === 'routine' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <span>Current Daily Routine Timeline</span>
            </h2>

            <div className="space-y-3">
              {profile.routine.map((act) => (
                <div
                  key={act.id}
                  className="glass-card p-4 rounded-xl border border-white/10 bg-midnight-900/60 flex items-center justify-between hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-14 text-center">
                      <span className="font-mono text-base font-bold text-cyan-400">
                        {String(act.startHour).padStart(2, '0')}:{String(act.startMinute).padStart(2, '0')}
                      </span>
                      <span className="block text-[10px] text-slate-500">
                        {act.durationMinutes} min
                      </span>
                    </div>

                    <div className="h-8 w-px bg-white/10" />

                    <div>
                      <h4 className="font-semibold text-white text-sm">{act.label}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${
                          act.environment === 'OUTDOOR'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : act.environment === 'TRANSIT'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                        }`}>
                          {act.environment}
                        </span>

                        <span className="text-[10px] text-slate-400">
                          {act.exertionLevel.replace(/_/g, ' ')}
                        </span>

                        <span className="text-[10px] text-slate-400">
                          • {act.flexibility.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveActivity(act.id)}
                    className="text-slate-500 hover:text-rose-400 p-2 rounded-lg transition-colors"
                    title="Remove activity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add Activity Form */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-midnight-900/40 h-fit space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Add Routine Activity</span>
            </h3>

            <form onSubmit={handleAddActivity} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Activity Label</label>
                <input
                  type="text"
                  required
                  value={newActLabel}
                  onChange={(e) => setNewActLabel(e.target.value)}
                  placeholder="e.g. Morning Jog in Park"
                  className="w-full px-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Start Hour (0-23)</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={newActStartHour}
                    onChange={(e) => setNewActStartHour(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Duration (min)</label>
                  <input
                    type="number"
                    min="15"
                    max="480"
                    step="15"
                    value={newActDuration}
                    onChange={(e) => setNewActDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Environment</label>
                  <select
                    value={newActEnv}
                    onChange={(e) => setNewActEnv(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white"
                  >
                    <option value="OUTDOOR">Outdoor</option>
                    <option value="TRANSIT">Transit</option>
                    <option value="INDOOR">Indoor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Exertion Level</label>
                  <select
                    value={newActExertion}
                    onChange={(e) => setNewActExertion(e.target.value as ExertionLevel)}
                    className="w-full px-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white"
                  >
                    <option value="SLEEP">Sleep (Resting)</option>
                    <option value="SEDENTARY">Sedentary</option>
                    <option value="LIGHT_ACTIVITY">Light Activity</option>
                    <option value="MODERATE_EXERCISE">Moderate Exercise</option>
                    <option value="HEAVY_EXERCISE">Heavy Athletics</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Activity Category</label>
                  <select
                    value={newActType}
                    onChange={(e) => setNewActType(e.target.value as ActivityType)}
                    className="w-full px-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white"
                  >
                    <option value="EXERCISE_OUTDOOR">Outdoor Exercise</option>
                    <option value="EXERCISE_INDOOR">Indoor Exercise</option>
                    <option value="COMMUTE_TRANSIT">Transit Commute</option>
                    <option value="COMMUTE_OUTDOOR">Outdoor Commute</option>
                    <option value="OUTDOOR_ERRAND">Outdoor Errand</option>
                    <option value="WORK">Work / Study</option>
                    <option value="HOUSEHOLD_CHORE">Household Chore</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Schedule Priority</label>
                  <select
                    value={newActPriority}
                    onChange={(e) => setNewActPriority(e.target.value as 'HIGH' | 'MEDIUM' | 'LOW')}
                    className="w-full px-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white"
                  >
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Rescheduling Flexibility</label>
                <select
                  value={newActFlexibility}
                  onChange={(e) => setNewActFlexibility(e.target.value as ActivityFlexibility)}
                  className="w-full px-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white"
                >
                  <option value="CAN_SUBSTITUTE_INDOORS">Can Substitute Indoors</option>
                  <option value="FLEXIBLE_TIME">Flexible Time Window</option>
                  <option value="FIXED">Strictly Fixed Schedule</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-midnight-950 font-bold hover:brightness-110 transition-all shadow-glow-cyan"
              >
                Add Activity to Routine
              </button>
            </form>
          </div>
        </div>
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
