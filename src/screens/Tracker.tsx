import { useState } from 'react';
import { Droplets, Trash2, Zap, Activity, Footprints } from 'lucide-react';
import { SupplementCheck } from '../components/SupplementCheck';
import { useDailyLog } from '../hooks/useDailyLog';
import { useDayType } from '../hooks/useDayType';
import { MORNING_SUPPS, INTRA_SUPPS, EVENING_SUPPS } from '../data/supplements';
import { DEFAULT_TARGETS } from '../data/targets';
import type { HydrationPayload, SupplementPayload, CardioPayload, StepsPayload } from '../types';

export function Tracker() {
  const { dayType } = useDayType();
  const { addEntry, removeEntry, getByType, loading } = useDailyLog();

  const [intraOverride, setIntraOverride] = useState(false);
  const [cardioZone, setCardioZone] = useState<2 | 3>(2);
  const [cardioDuration, setCardioDuration] = useState('');
  const [cardioDistance, setCardioDistance] = useState('');
  const [showCardioForm, setShowCardioForm] = useState(false);
  const [stepsInput, setStepsInput] = useState('');

  // Hydration
  const hydrationEntries = getByType('hydration');
  const totalMl = hydrationEntries.reduce((sum, e) => sum + (e.payload as HydrationPayload).ml, 0);
  const totalL = totalMl / 1000;

  // Supplements
  const suppEntries = getByType('supplement');
  const isChecked = (name: string) => suppEntries.some(e => (e.payload as SupplementPayload).name === name && (e.payload as SupplementPayload).taken);

  const handleSuppToggle = async (name: string) => {
    const currently = isChecked(name);
    const date = new Date().toISOString().split('T')[0];
    const id = `supp-${name.replace(/\s+/g, '-')}-${date}`;
    await addEntry('supplement', { name, taken: !currently } as SupplementPayload, id);
  };

  // Cardio
  const cardioEntries = getByType('cardio');

  const handleLogCardio = async () => {
    const duration = parseInt(cardioDuration);
    if (!isNaN(duration) && duration > 0) {
      await addEntry('cardio', {
        zone: cardioZone,
        durationMin: duration,
        distanceKm: cardioDistance ? parseFloat(cardioDistance) : undefined,
      } as CardioPayload);
      setCardioDuration('');
      setCardioDistance('');
      setShowCardioForm(false);
    }
  };

  // Weekly cardio indicator
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const mondayStr = monday.toISOString().split('T')[0];
  const todayStr = now.toISOString().split('T')[0];

  const weeklyZ2 = cardioEntries.filter(e => {
    const p = e.payload as CardioPayload;
    return p.zone === 2 && e.date >= mondayStr && e.date <= todayStr;
  }).length;
  const weeklyZ3 = cardioEntries.filter(e => {
    const p = e.payload as CardioPayload;
    return p.zone === 3 && e.date >= mondayStr && e.date <= todayStr;
  }).length;

  // Steps
  const stepsEntries = getByType('steps');
  const currentSteps = stepsEntries.length > 0 ? (stepsEntries[stepsEntries.length - 1].payload as StepsPayload).steps : 0;

  const handleLogSteps = async () => {
    const n = parseInt(stepsInput);
    if (!isNaN(n) && n > 0) {
      const date = new Date().toISOString().split('T')[0];
      await addEntry('steps', { steps: n } as StepsPayload, `steps-${date}`);
      setStepsInput('');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-500">Loading…</div>;

  return (
    <div className="space-y-4 pb-6">
      <h1 className="text-2xl font-bold text-slate-100">Tracker</h1>

      {/* Hydration Log */}
      <div className="bg-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Droplets size={18} className="text-blue-400" />
          <h2 className="font-semibold text-slate-200">Hydration Log</h2>
          <span className="ml-auto text-xs text-slate-500">Coach target: 4.5–6L</span>
        </div>

        <div className="flex gap-2">
          <button onClick={() => addEntry('hydration', { ml: 250 })} className="flex-1 bg-blue-600 active:bg-blue-700 text-white text-sm font-medium py-2 rounded-xl">+250ml</button>
          <button onClick={() => addEntry('hydration', { ml: 500 })} className="flex-1 bg-blue-500 active:bg-blue-600 text-white text-sm font-medium py-2 rounded-xl">+500ml</button>
          <button onClick={() => addEntry('hydration', { ml: 750 })} className="flex-1 bg-blue-400 active:bg-blue-500 text-white text-sm font-medium py-2 rounded-xl">+750ml</button>
        </div>

        <div className="flex items-center justify-between px-1">
          <p className="text-xl font-bold text-blue-400">{totalL.toFixed(2)}L</p>
          <p className="text-xs text-slate-500">today</p>
        </div>

        {hydrationEntries.length > 0 && (
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {[...hydrationEntries].reverse().map((entry) => {
              const p = entry.payload as HydrationPayload;
              return (
                <div key={entry.id} className="flex items-center justify-between bg-slate-700/50 rounded-lg px-3 py-2 text-sm">
                  <span className="text-slate-300">{p.ml}ml</span>
                  <span className="text-xs text-slate-600">
                    {new Date(entry.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button onClick={() => removeEntry(entry)} className="text-slate-600 hover:text-red-400">
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Supplements */}
      <div className="bg-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-yellow-400" />
          <h2 className="font-semibold text-slate-200">Supplements</h2>
          <span className="text-xs text-slate-500 ml-auto">Coach plan</span>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-slate-600 uppercase tracking-wider px-1">Morning</p>
          {MORNING_SUPPS.map(s => (
            <SupplementCheck
              key={s.name}
              name={s.name}
              dose={s.dose}
              checked={isChecked(s.name)}
              onChange={() => handleSuppToggle(s.name)}
            />
          ))}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 px-1">
            <p className="text-xs text-slate-600 uppercase tracking-wider">Intra-Workout</p>
            {dayType === 'rest' && (
              <button
                onClick={() => setIntraOverride(v => !v)}
                className={`ml-auto text-xs px-2 py-0.5 rounded-full ${intraOverride ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-700 text-slate-500'}`}
              >
                {intraOverride ? 'Override ON' : 'Override'}
              </button>
            )}
          </div>
          {INTRA_SUPPS.map(s => (
            <SupplementCheck
              key={s.name}
              name={s.name}
              dose={s.dose}
              checked={isChecked(s.name)}
              disabled={dayType === 'rest' && !intraOverride}
              onChange={() => handleSuppToggle(s.name)}
            />
          ))}
          {dayType === 'rest' && !intraOverride && (
            <p className="text-xs text-slate-600 px-1">Greyed out on rest days. Enable override if needed (e.g. cardio day).</p>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-xs text-slate-600 uppercase tracking-wider px-1">Evening</p>
          {EVENING_SUPPS.map(s => (
            <SupplementCheck
              key={s.name}
              name={s.name}
              dose={s.dose}
              checked={isChecked(s.name)}
              onChange={() => handleSuppToggle(s.name)}
            />
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="bg-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Footprints size={18} className="text-green-400" />
          <h2 className="font-semibold text-slate-200">Steps</h2>
          <span className="text-xs text-slate-500 ml-auto">Target: 8,000</span>
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            value={stepsInput}
            onChange={e => setStepsInput(e.target.value)}
            placeholder="Step count"
            className="flex-1 bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm"
          />
          <button onClick={handleLogSteps} className="bg-green-600 active:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium">Log</button>
        </div>
        {currentSteps > 0 && (
          <p className="text-slate-300 text-sm">{currentSteps.toLocaleString()} steps today</p>
        )}
      </div>

      {/* Cardio Log */}
      <div className="bg-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-purple-400" />
          <h2 className="font-semibold text-slate-200">Cardio</h2>
        </div>

        <div className={`flex items-center text-sm ${weeklyZ2 >= DEFAULT_TARGETS.cardioZ2PerWeek && weeklyZ3 >= DEFAULT_TARGETS.cardioZ3PerWeek ? 'text-green-400' : 'text-slate-500'}`}>
          This week: Z2 ×{weeklyZ2}/{DEFAULT_TARGETS.cardioZ2PerWeek} · Z3 ×{weeklyZ3}/{DEFAULT_TARGETS.cardioZ3PerWeek}
        </div>

        {cardioEntries.length > 0 && (
          <div className="space-y-1">
            {[...cardioEntries].reverse().slice(0, 5).map(entry => {
              const p = entry.payload as CardioPayload;
              return (
                <div key={entry.id} className="flex items-center justify-between bg-slate-700/50 rounded-lg px-3 py-2 text-sm">
                  <span className="text-slate-300">Zone {p.zone} · {p.durationMin} min{p.distanceKm ? ` · ${p.distanceKm}km` : ''}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600">{entry.date}</span>
                    <button onClick={() => removeEntry(entry)} className="text-slate-600 hover:text-red-400"><Trash2 size={12} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showCardioForm ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <button onClick={() => setCardioZone(2)} className={`flex-1 py-2 rounded-xl text-sm font-medium ${cardioZone === 2 ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-400'}`}>Zone 2 (easy)</button>
              <button onClick={() => setCardioZone(3)} className={`flex-1 py-2 rounded-xl text-sm font-medium ${cardioZone === 3 ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-400'}`}>Zone 3 (HR 120+)</button>
            </div>
            <div className="flex gap-2">
              <input type="number" value={cardioDuration} onChange={e => setCardioDuration(e.target.value)} placeholder="Duration (min)" className="flex-1 bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm" />
              <input type="number" step="0.1" value={cardioDistance} onChange={e => setCardioDistance(e.target.value)} placeholder="km (optional)" className="flex-1 bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleLogCardio} className="flex-1 bg-purple-600 active:bg-purple-700 text-white py-2 rounded-xl text-sm font-medium">Log Cardio</button>
              <button onClick={() => setShowCardioForm(false)} className="text-slate-500 px-4 text-sm">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowCardioForm(true)} className="w-full bg-slate-700 active:bg-slate-600 text-slate-300 py-2 rounded-xl text-sm">+ Log Cardio Session</button>
        )}
      </div>
    </div>
  );
}
