import { useState } from 'react';
import { CheckSquare, ChevronRight, Droplets, Footprints, Zap } from 'lucide-react';
import { ProgressRing } from '../components/ProgressRing';
import { useDailyLog } from '../hooks/useDailyLog';
import { useDayType } from '../hooks/useDayType';
import { useChecklistItems } from '../hooks/useChecklistItems';
import { useAppSettings } from '../hooks/useAppSettings';
import { SESSION_COLOURS, SESSION_LABELS } from '../data/schedule';
import { NUTRITION_PLAN, computeDayTotals } from '../data/nutrition';
import type { HydrationPayload, StepsPayload } from '../types';

interface TodayProps { onOpenChecklist: () => void; }

export function Today({ onOpenChecklist }: TodayProps) {
  const { session, dayType } = useDayType();
  const { addEntry, getByType, loading } = useDailyLog();
  const { doneCount, totalCount } = useChecklistItems();
  const { settings } = useAppSettings();
  const [stepsInput, setStepsInput] = useState('');
  const [showStepsInput, setShowStepsInput] = useState(false);

  const plan = NUTRITION_PLAN[dayType];

  const mealEntries = getByType('meal');
  const selections: Record<string, string> = {};
  for (const entry of mealEntries) {
    const payload = entry.payload as { slot: string; alternative: string };
    selections[payload.slot] = payload.alternative;
  }
  const totals = computeDayTotals(plan, selections);

  const hydrationEntries = getByType('hydration');
  const totalMl = hydrationEntries.reduce((sum, entry) => sum + (entry.payload as HydrationPayload).ml, 0);
  const totalL = totalMl / 1000;

  const stepsEntries = getByType('steps');
  const stepsEntry = stepsEntries[stepsEntries.length - 1];
  const currentSteps = stepsEntry ? (stepsEntry.payload as StepsPayload).steps : 0;

  const suppEntries = getByType('supplement');
  const morningDone = suppEntries.filter(entry => {
    const payload = entry.payload as { name: string; taken: boolean };
    return payload.taken && ['Omega 3', 'Vitamin D', 'Vitamin C', 'Multivitamin', 'B Vitamin'].includes(payload.name);
  }).length;
  const intraDone = suppEntries.filter(entry => {
    const payload = entry.payload as { name: string; taken: boolean };
    return payload.taken && ['Essential Amino Acids (EAA)', 'Creatine'].includes(payload.name);
  }).length;
  const eveningDone = suppEntries.filter(entry => {
    const payload = entry.payload as { name: string; taken: boolean };
    return payload.taken && payload.name === 'Magnesium';
  }).length;

  const handleAddWater = async (ml: number) => {
    await addEntry('hydration', { ml });
  };

  const handleLogSteps = async () => {
    const next = parseInt(stepsInput, 10);
    if (!isNaN(next) && next > 0) {
      await addEntry('steps', { steps: next }, `steps-${new Date().toISOString().split('T')[0]}`);
      setShowStepsInput(false);
      setStepsInput('');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-500">Loading...</div>;

  const dayName = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">{dayName}</p>
          <h1 className="text-2xl font-bold text-slate-100">Today</h1>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold text-white ${SESSION_COLOURS[session]}`}>
          {SESSION_LABELS[session]}
        </span>
      </div>

      <button onClick={onOpenChecklist} className="w-full bg-slate-800 rounded-2xl p-4 flex items-center gap-3 active:bg-slate-700">
        <CheckSquare size={18} className="text-orange-400" />
        <div className="text-left">
          <p className="font-semibold text-slate-200">Daily checklist</p>
          <p className="text-xs text-slate-500">{doneCount} of {totalCount} complete</p>
        </div>
        <span className="text-xs text-slate-500 ml-auto">Open</span>
        <ChevronRight size={16} className="text-slate-500" />
      </button>

      <div className="bg-slate-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Droplets size={18} className="text-blue-400" />
          <h2 className="font-semibold text-slate-200">Hydration</h2>
          <span className="ml-auto text-xs text-slate-500">Target: {settings.hydrationMinL}-{settings.hydrationMaxL}L</span>
        </div>
        <div className="flex items-center gap-6">
          <ProgressRing
            value={totalL}
            max={settings.hydrationMinL}
            size={100}
            strokeWidth={9}
            colour="#3b82f6"
            label={`${totalL.toFixed(1)}L / ${settings.hydrationMinL}L`}
          />
          <div className="flex-1 space-y-2">
            <p className="text-2xl font-bold text-slate-100">{totalL.toFixed(2)}L</p>
            <div className="flex gap-2">
              <button onClick={() => handleAddWater(250)} className="flex-1 bg-blue-600 active:bg-blue-700 text-white text-sm font-medium py-2 rounded-xl">+250ml</button>
              <button onClick={() => handleAddWater(500)} className="flex-1 bg-blue-500 active:bg-blue-600 text-white text-sm font-medium py-2 rounded-xl">+500ml</button>
            </div>
            <p className="text-xs text-slate-500">Start strong, then keep adding water through the day.</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={18} className="text-yellow-400" />
          <h2 className="font-semibold text-slate-200">Supplements</h2>
          <span className="text-xs text-slate-500 ml-auto">Coach plan</span>
        </div>
        <div className="flex gap-4">
          {[
            { label: 'Morning', done: morningDone, total: 5, active: true },
            { label: 'Intra', done: intraDone, total: 2, active: dayType === 'training' },
            { label: 'Evening', done: eveningDone, total: 1, active: true },
          ].map(({ label, done, total, active }) => (
            <div key={label} className={`flex-1 flex flex-col items-center gap-1.5 ${!active ? 'opacity-40' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${done === total && active ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                {done}/{total}
              </div>
              <span className="text-xs text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl p-4">
        <h2 className="font-semibold text-slate-200 mb-3">Today&apos;s nutrition</h2>
        <div className="grid grid-cols-4 gap-2 text-center mb-2">
          {[
            { label: 'kcal', val: totals.kcal, target: plan.targetKcal, colour: 'text-orange-400' },
            { label: 'Protein', val: totals.p, target: plan.targetP, colour: 'text-blue-400' },
            { label: 'Carbs', val: totals.c, target: plan.targetC, colour: 'text-yellow-400' },
            { label: 'Fats', val: totals.f, target: plan.targetF, colour: 'text-pink-400' },
          ].map(({ label, val, target, colour }) => (
            <div key={label} className="bg-slate-700/50 rounded-xl p-2">
              <p className={`text-lg font-bold ${colour}`}>{label === 'kcal' ? val : `${val}g`}</p>
              <p className="text-xs text-slate-500">/ {label === 'kcal' ? target : `${target}g`}</p>
              <p className="text-xs text-slate-600 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-600 text-center">Totals reflect the meals you have logged today.</p>
      </div>

      <div className="bg-slate-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Footprints size={18} className="text-green-400" />
          <h2 className="font-semibold text-slate-200">Steps</h2>
          <span className="text-xs text-slate-500 ml-auto">Target: {settings.stepGoal.toLocaleString()}/day</span>
        </div>
        {showStepsInput ? (
          <div className="flex gap-2">
            <input type="number" value={stepsInput} onChange={e => setStepsInput(e.target.value)} placeholder="e.g. 6500" className="flex-1 bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm" autoFocus />
            <button onClick={handleLogSteps} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium">Log</button>
            <button onClick={() => setShowStepsInput(false)} className="text-slate-500 text-sm px-2">Cancel</button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-100">{currentSteps.toLocaleString()}</p>
              <p className="text-xs text-slate-500">steps today</p>
            </div>
            <button onClick={() => setShowStepsInput(true)} className="flex items-center gap-1 text-sm text-slate-400 bg-slate-700 px-3 py-2 rounded-xl">Log <ChevronRight size={14} /></button>
          </div>
        )}
      </div>
    </div>
  );
}
