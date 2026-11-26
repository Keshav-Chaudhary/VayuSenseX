import React, { useState } from 'react';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import {
  HouseholdActivity,
  ActivityType,
  ActivityFlexibility,
} from '../../domain/household/types';
import { ExertionLevel } from '../../domain/exposure/types';

interface RoutineScheduleTabProps {
  routine: HouseholdActivity[];
  onAddActivity: (activity: HouseholdActivity) => void;
  onRemoveActivity: (id: string) => void;
}

export const RoutineScheduleTab: React.FC<RoutineScheduleTabProps> = ({
  routine,
  onAddActivity,
  onRemoveActivity,
}) => {
  const [newActLabel, setNewActLabel] = useState('');
  const [newActType, setNewActType] = useState<ActivityType>('EXERCISE_OUTDOOR');
  const [newActEnv, setNewActEnv] = useState<'INDOOR' | 'OUTDOOR' | 'TRANSIT'>('OUTDOOR');
  const [newActExertion, setNewActExertion] = useState<ExertionLevel>('MODERATE_EXERCISE');
  const [newActStartHour, setNewActStartHour] = useState<number>(7);
  const [newActDuration, setNewActDuration] = useState<number>(45);
  const [newActFlexibility, setNewActFlexibility] = useState<ActivityFlexibility>('CAN_SUBSTITUTE_INDOORS');
  const [newActPriority, setNewActPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActLabel.trim()) return;

    onAddActivity({
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
    });
    setNewActLabel('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-cyan-400" />
          <span>Current Daily Routine Timeline</span>
        </h2>

        <div className="space-y-3">
          {routine.map((act) => (
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
                onClick={() => onRemoveActivity(act.id)}
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
                onChange={(e) => setNewActEnv(e.target.value as 'INDOOR' | 'OUTDOOR' | 'TRANSIT')}
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
  );
};
