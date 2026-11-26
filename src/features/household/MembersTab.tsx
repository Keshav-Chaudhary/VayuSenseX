import React, { useState } from 'react';
import { Users, Plus, Trash2 } from 'lucide-react';
import {
  FamilyMember,
  AgeGroup,
  EnvironmentalSensitivity,
} from '../../domain/household/types';
import { TransportMode } from '../../domain/sustainability/types';

interface MembersTabProps {
  members: FamilyMember[];
  onAddMember: (member: FamilyMember) => void;
  onRemoveMember: (id: string) => void;
}

export const MembersTab: React.FC<MembersTabProps> = ({
  members,
  onAddMember,
  onRemoveMember,
}) => {
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAgeGroup, setNewMemberAgeGroup] = useState<AgeGroup>('ADULT');
  const [newMemberSensitivity, setNewMemberSensitivity] = useState<EnvironmentalSensitivity>('STANDARD');
  const [newMemberOutdoorMin, setNewMemberOutdoorMin] = useState<number>(60);
  const [newMemberCommute, setNewMemberCommute] = useState<TransportMode>('PETROL_CAR');
  const [newMemberNotes, setNewMemberNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    onAddMember({
      id: `mem-${Date.now()}`,
      name: newMemberName.trim(),
      ageGroup: newMemberAgeGroup,
      sensitivity: newMemberSensitivity,
      dailyOutdoorMinutes: newMemberOutdoorMin,
      commuteMode: newMemberCommute,
      notes: newMemberNotes.trim() || undefined,
    });
    setNewMemberName('');
    setNewMemberNotes('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Users className="w-5 h-5 text-cyan-400" />
          <span>Configured Family Roster</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((member) => (
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
                  onClick={() => onRemoveMember(member.id)}
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
                  &quot;{member.notes}&quot;
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
  );
};
