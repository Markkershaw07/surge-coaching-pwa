import { useMemo, useState } from 'react';
import { CheckSquare, ChevronRight, Droplets, Footprints, UtensilsCrossed, Zap } from 'lucide-react';
import { ProgressRing } from '../components/ProgressRing';
import { useDailyLog } from '../hooks/useDailyLog';
import { useDayType } from '../hooks/useDayType';
import { useChecklistItems } from '../hooks/useChecklistItems';
import { useAppSettings } from '../hooks/useAppSettings';
import { useWeeklyPlan } from '../hooks/useWeeklyPlan';
import { SESSION_COLOURS, SESSION_LABELS } from '../data/schedule';
import { NUTRITION_PLAN, computeDayTotals } from '../data/nutrition';
import type { HydrationPayload, MealPayload, StepsPayload, SupplementPayload } from '../types';

interface TodayProps { onOpenChecklist: () => void; }

function todayKey() {
  return new Date().toISOString().split('T')[0];
}

export function Today({ onOpenChecklist }: TodayProps) {
  const { session, dayType } = useDayType();
  const { addEntry, getByType, loading } = useDailyLog();
  const { doneCount, totalCount, itemStates } = useChecklistItems();
  const { settings } = useAppSettings();
  const weeklyPlan = useWeeklyPlan();
  const [stepsInput, setStepsInput] = useState('');
  const [showStepsInput, setShowStepsInput] = useState(false);
  const [stepsError, setStepsError] = useState<string | null>(null);

  const plan = NUTRITION_PLAN[dayType];
  const todayPlan = weeklyPlan.getDay(todayKey());

  const mealEntries = getByType('meal').map(entry => entry.payload as MealPayload);
  const plannedSelections = useMemo(() => {
    const defaults = { ...(todayPlan?.selections ?? {}) };
    for (const slot of plan.slots) {
      defaults[slot.id] = defaults[slot.id] ?? slot.defaultOption;
    }
    for (const entry of mealEntries) {
      defaults[entry.slot] = entry.alternative;
    }
    return defaults;
  }, [mealEntries, plan.slots, todayPlan]);

  const eatenSelections = useMemo(() => {
    const eaten: Record<string, string> = {};
    for (const entry of mealEntries) {
      if (entry.eaten) eaten[entry.slot] = entry.alternative;
    }
    return eaten;
  }, [mealEntries]);

  const plannedTotals = computeDayTotals(plan, plannedSelections);
  const eatenTotals = computeDayTotals(plan, eatenSelections);
  const eatenMealCount = mealEntries.filter(entry => entry.eaten).length;

  const hydrationEntries = getByType('hydration');
  const totalMl = hydrationEntries.reduce((sum, entry) => sum + (entry.payload as HydrationPayload).ml, 0);
  const totalL = totalMl / 1000;

  const stepsEntries = getByType('steps');
  const stepsEntry = stepsEntries[stepsEntries.length - 1];
  const currentSteps = stepsEntry ? (stepsEntry.payload as StepsPayload).steps : 0;
  const stepProgress = Math.min(100, Math.round((currentSteps / settings.stepGoal) * 100));

  const suppEntries = getByType('supplement');
  const morningDone = suppEntries.filter(entry => {
    const payload = entry.payload as SupplementPayload;
    return payload.taken && ['Omega 3', 'Vitamin D', 'Vitamin C', 'Multivitamin', 'B Vitamin'].includes(payload.name);
  }).length;
  const intraDone = suppEntries.filter(entry => {
    const payload = entry.payload as SupplementPayload;
    return payload.taken && ['Essential Amino Acids (EAA)', 'Creatine'].includes(payload.name);
  }).length;
  const eveningDone = suppEntries.filter(entry => {
    const payload = entry.payload as SupplementPayload;
    return payload.taken && payload.name === 'Magnesium';
  }).length;

  const handleAddWater = async (ml: number) => {
    await addEntry('hydration', { ml });
  };

  const handleLogSteps = async () => {
    const next = parseInt(stepsInput, 10);
    if (Number.isNaN(next)) {
      setStepsError('Enter a number for today\'s steps.');
      return;
    }
    if (next < 0 || next > 100000) {
      setStepsError('Keep steps between 0 and 100,000.');
      return;
    }

    await addEntry('steps', { steps: next }, `steps-${todayKey()}`);
    setShowStepsInput(false);
    setStepsInput('');
    setStepsError(null);
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
            <p className="text-xs text-slate-500">On wake: 500ml-1L with electrolyte | 500ml with each meal.</p>
          </div>
        </div>
      </div>

      <button onClick={onOpenChecklist} className="w-full bg-slate-800 rounded-2xl p-4 text-left active:bg-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={18} className="text-yellow-400" />
          <h2 className="font-semibold text-slate-200">Supplements</h2>
          <span className="text-xs text-slate-500 ml-auto">Tap to manage</span>
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
      </button>

      <button onClick={onOpenChecklist} className="w-full bg-slate-800 rounded-2xl p-4 text-left active:bg-slate-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <UtensilsCrossed size={18} className="text-orange-400" />
            <h2 className="font-semibold text-slate-200">Today&apos;s nutrition</h2>
          </div>
          <span className="text-xs text-slate-500">{eatenMealCount}/{plan.slots.length} meals eaten</span>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center mb-3">
          {[
            { label: 'kcal', val: eatenTotals.kcal, target: plan.targetKcal, colour: 'text-orange-400' },
            { label: 'Protein', val: eatenTotals.p, target: plan.targetP, colour: 'text-blue-400' },
            { label: 'Carbs', val: eatenTotals.c, target: plan.targetC, colour: 'text-yellow-400' },
            { label: 'Fats', val: eatenTotals.f, target: plan.targetF, colour: 'text-pink-400' },
          ].map(({ label, val, target, colour }) => (
            <div key={label} className="bg-slate-700/50 rounded-xl p-2">
              <p className={`text-lg font-bold ${colour}`}>{label === 'kcal' ? val : `${val}g`}</p>
              <p className="text-xs text-slate-500">/ {label === 'kcal' ? target : `${target}g`}</p>
              <p className="text-xs text-slate-600 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500">Planned: {plannedTotals.kcal} kcal | Eaten: {eatenTotals.kcal} kcal. Tap Checklist to mark meals as eaten.</p>
      </button>

      <div className="bg-slate-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Footprints size={18} className="text-green-400" />
          <h2 className="font-semibold text-slate-200">Steps</h2>
          <span className="text-xs text-slate-500 ml-auto">Target: {settings.stepGoal.toLocaleString()}/day</span>
        </div>
        {showStepsInput ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input type="number" value={stepsInput} onChange={e => setStepsInput(e.target.value)} placeholder="e.g. 6500" className="flex-1 bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm" autoFocus />
              <button onClick={handleLogSteps} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium">Log</button>
              <button onClick={() => { setShowStepsInput(false); setStepsError(null); }} className="text-slate-500 text-sm px-2">Cancel</button>
            </div>
            {stepsError && <p className="text-xs text-red-400">{stepsError}</p>}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-100">{currentSteps.toLocaleString()}</p>
                <p className="text-xs text-slate-500">steps today</p>
              </div>
              <button onClick={() => setShowStepsInput(true)} className="flex items-center gap-1 text-sm text-slate-400 bg-slate-700 px-3 py-2 rounded-xl">Log <ChevronRight size={14} /></button>
            </div>
            <div>
              <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${stepProgress}%` }} />
              </div>
              <p className="text-xs text-slate-500 mt-1">{stepProgress}% of your daily goal</p>
            </div>
          </div>
        )}
      </div>

      {itemStates.workout?.ticked && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4">
          <p className="text-sm font-semibold text-green-400">Workout complete</p>
          <p className="text-xs text-slate-400 mt-1">Today&apos;s session has been finished and synced to your checklist.</p>
        </div>
      )}
    </div>
  );
}
