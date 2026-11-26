import React from 'react';
import { Home, Sparkles } from 'lucide-react';
import { HouseholdProfile, HomeType, CookingFuel } from '../../domain/household/types';

interface HomeSettingsTabProps {
  profile: HouseholdProfile;
  onUpdateProfile: (updated: HouseholdProfile) => void;
}

export const HomeSettingsTab: React.FC<HomeSettingsTabProps> = ({ profile, onUpdateProfile }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-midnight-900/60 space-y-6">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Home className="w-5 h-5 text-cyan-400" />
          <span>Dwelling Architecture &amp; Dimensions</span>
        </h3>

        <div className="space-y-4 text-xs">
          <div>
            <label htmlFor="home-dwelling-type" className="block text-slate-300 font-medium mb-1">Dwelling Type</label>
            <select
              id="home-dwelling-type"
              value={profile.home.homeType}
              onChange={(e) => onUpdateProfile({ ...profile, home: { ...profile.home, homeType: e.target.value as HomeType } })}
              className="w-full px-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white"
            >
              <option value="APARTMENT">Multi-Story Apartment</option>
              <option value="INDEPENDENT_HOUSE">Independent House / Villa</option>
            </select>
          </div>

          <div>
            <label htmlFor="home-room-volume" className="block text-slate-300 font-medium mb-1">Primary Room Internal Air Volume (m³)</label>
            <div className="flex items-center space-x-3">
              <input
                id="home-room-volume"
                type="range"
                min="20"
                max="150"
                step="2"
                value={profile.home.primaryRoomVolumeM3}
                onChange={(e) => onUpdateProfile({ ...profile, home: { ...profile.home, primaryRoomVolumeM3: Number(e.target.value) } })}
                className="flex-1 accent-cyan-400"
              />
              <span className="font-mono text-cyan-300 text-sm font-bold w-16">{profile.home.primaryRoomVolumeM3} m³</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Typical bedroom: 40-55 m³. Living hall: 70-120 m³.</span>
          </div>

          <div>
            <label htmlFor="home-window-sealing" className="block text-slate-300 font-medium mb-1">Window Sealing Quality</label>
            <select
              id="home-window-sealing"
              value={profile.home.windowSealingQuality}
              onChange={(e) => onUpdateProfile({
                ...profile,
                home: { ...profile.home, windowSealingQuality: e.target.value as 'TIGHT_WEATHERSTRIPPED' | 'STANDARD' | 'DRAFTY' },
              })}
              className="w-full px-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white"
            >
              <option value="TIGHT_WEATHERSTRIPPED">Tight Weatherstripped (Modern double-pane, low drafts)</option>
              <option value="STANDARD">Standard Masonry &amp; Gasket (Typical urban flat)</option>
              <option value="DRAFTY">Drafty / Loose Fitting (Higher outdoor particulate infiltration)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-midnight-900/60 space-y-6">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-teal-400" />
          <span>Air Filtration &amp; Indoor Sources</span>
        </h3>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-midnight-950/80 border border-white/5">
            <div>
              <span className="font-bold text-white block">Mechanical Air Purifier Present</span>
              <span className="text-[11px] text-slate-400">Enables active HEPA aerosol clearance</span>
            </div>
            <input
              type="checkbox"
              aria-label="Mechanical Air Purifier Present"
              checked={profile.home.hasPurifier}
              onChange={(e) => onUpdateProfile({ ...profile, home: { ...profile.home, hasPurifier: e.target.checked } })}
              className="rounded bg-midnight-950 border-white/20 text-cyan-500 focus:ring-0 w-4 h-4"
            />
          </div>

          {profile.home.hasPurifier && (
            <>
              <div>
                <label htmlFor="home-purifier-cadr" className="block text-slate-300 font-medium mb-1">Purifier CADR Rating (m³/h)</label>
                <div className="flex items-center space-x-3">
                  <input
                    id="home-purifier-cadr"
                    type="range"
                    min="50"
                    max="600"
                    step="10"
                    value={profile.home.purifierCADRM3H}
                    onChange={(e) => onUpdateProfile({ ...profile, home: { ...profile.home, purifierCADRM3H: Number(e.target.value) } })}
                    className="flex-1 accent-teal-400"
                  />
                  <span className="font-mono text-teal-300 text-sm font-bold w-20">{profile.home.purifierCADRM3H} m³/h</span>
                </div>
              </div>

              <div>
                <label htmlFor="home-filter-type" className="block text-slate-300 font-medium mb-1">Filter Media Standard</label>
                <select
                  id="home-filter-type"
                  value={profile.home.filterType}
                  onChange={(e) => onUpdateProfile({
                    ...profile,
                    home: { ...profile.home, filterType: e.target.value as 'HEPA' | 'MERV13_BOX_FAN' | 'BASIC_CARBON' },
                  })}
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
            <label htmlFor="home-cooking-fuel" className="block text-slate-300 font-medium mb-1">Primary Kitchen Cooking Fuel</label>
            <select
              id="home-cooking-fuel"
              value={profile.home.cookingFuel}
              onChange={(e) => onUpdateProfile({ ...profile, home: { ...profile.home, cookingFuel: e.target.value as CookingFuel } })}
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
                onChange={(e) => onUpdateProfile({ ...profile, home: { ...profile.home, hasKitchenExhaust: e.target.checked } })}
                className="rounded bg-midnight-950 border-white/20 text-cyan-500 focus:ring-0"
              />
              <span>Functional High-Velocity Kitchen Chimney / Exhaust Hood</span>
            </label>

            <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.home.usesIncenseOrCoils}
                onChange={(e) => onUpdateProfile({ ...profile, home: { ...profile.home, usesIncenseOrCoils: e.target.checked } })}
                className="rounded bg-midnight-950 border-white/20 text-rose-500 focus:ring-0"
              />
              <span>Regular Burning of Incense (Agarbatti) or Mosquito Coils</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
