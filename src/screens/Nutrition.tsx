import { useState, useEffect } from 'react';
import { UtensilsCrossed, Info } from 'lucide-react';
import { MealCard } from '../components/MealCard';
import { MacroBar } from '../components/MacroBar';
import { useDayType } from '../hooks/useDayType';
import { useDailyLog } from '../hooks/useDailyLog';
import { NUTRITION_PLAN, computeDayTotals } from '../data/nutrition';
import { COOKING_RULES } from '../data/targets';
import type { MealPayload } from '../types';

export function Nutrition() {
  const { dayType } = useDayType();
  const { addEntry, getByType, loading } = useDailyLog();

  const [viewType, setViewType] = useState<'training' | 'rest'>(dayType);
  const plan = NUTRITION_PLAN[viewType];

  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    for (const slot of NUTRITION_PLAN[viewType].slots) {
      defaults[slot.id] = slot.defaultOption;
    }
    return defaults;
  });

  const [showCookingRules, setShowCookingRules] = useState(false);

  // Load saved selections
  useEffect(() => {
    if (!loading) {
      const mealEntries = getByType('meal');
      const saved: Record<string, string> = {};
      for (const e of mealEntries) {
        const p = e.payload as MealPayload;
        saved[p.slot] = p.alternative;
      }
      if (Object.keys(saved).length > 0) {
        setSelections(prev => ({ ...prev, ...saved }));
      }
    }
  }, [loading]);

  const totals = computeDayTotals(plan, selections);

  const handleSelect = async (slotId: string, optionId: string) => {
    setSelections(prev => ({ ...prev, [slotId]: optionId }));
    const dateStr = new Date().toISOString().split('T')[0];
    await addEntry('meal', { slot: slotId, alternative: optionId } as MealPayload, `meal-${slotId}-${dateStr}`);
  };

  // Check for macro mismatches (>1g or >5kcal difference from target)
  const mismatches: string[] = [];
  if (Math.abs(totals.kcal - plan.targetKcal) > 5) mismatches.push(`kcal: ${totals.kcal} vs ${plan.targetKcal} target`);
  if (Math.abs(totals.p - plan.targetP) > 1) mismatches.push(`Protein: ${totals.p}g vs ${plan.targetP}g target`);
  if (Math.abs(totals.c - plan.targetC) > 1) mismatches.push(`Carbs: ${totals.c}g vs ${plan.targetC}g target`);
  if (Math.abs(totals.f - plan.targetF) > 1) mismatches.push(`Fat: ${totals.f}g vs ${plan.targetF}g target`);

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-500">Loading…</div>;

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UtensilsCrossed size={20} className="text-orange-500" />
          <h1 className="text-2xl font-bold text-slate-100">Nutrition</h1>
        </div>
      </div>

      {/* Training/Rest toggle */}
      <div className="flex bg-slate-800 rounded-xl p-1 gap-1">
        <button
          onClick={() => setViewType('training')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewType === 'training' ? 'bg-orange-500 text-white' : 'text-slate-400'
          }`}
        >
          Training Day
        </button>
        <button
          onClick={() => setViewType('rest')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewType === 'rest' ? 'bg-slate-600 text-white' : 'text-slate-400'
          }`}
        >
          Rest Day
        </button>
      </div>

      {/* Day total banner */}
      <div className="bg-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-200">Day Total</h2>
          <div className="text-right">
            <p className="text-lg font-bold text-orange-400">{totals.kcal} kcal</p>
            <p className="text-xs text-slate-500">target: {plan.targetKcal} kcal</p>
          </div>
        </div>
        <MacroBar label="Protein" value={totals.p} target={plan.targetP} colour="#3b82f6" />
        <MacroBar label="Carbs" value={totals.c} target={plan.targetC} colour="#eab308" />
        <MacroBar label="Fat" value={totals.f} target={plan.targetF} colour="#ec4899" />
      </div>

      {/* Mismatch warning */}
      {mismatches.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex items-start gap-2">
          <Info size={16} className="text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-yellow-400">Macro calculation mismatch detected</p>
            {mismatches.map((m, i) => (
              <p key={i} className="text-xs text-yellow-500/80 mt-0.5">{m}</p>
            ))}
          </div>
        </div>
      )}

      {/* Meal cards */}
      <div className="space-y-3">
        {plan.slots.map(slot => (
          <MealCard
            key={slot.id}
            slot={slot}
            selectedOptionId={selections[slot.id] ?? slot.defaultOption}
            onSelect={optionId => handleSelect(slot.id, optionId)}
          />
        ))}
      </div>

      {/* Cooking rules */}
      <div className="bg-slate-800 rounded-2xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between p-4"
          onClick={() => setShowCookingRules(v => !v)}
        >
          <span className="text-sm font-medium text-slate-400">Cooking Rules</span>
          <span className="text-xs text-slate-600">{showCookingRules ? 'Hide' : 'Show'}</span>
        </button>
        {showCookingRules && (
          <ul className="px-4 pb-4 space-y-1.5">
            {COOKING_RULES.map((rule, i) => (
              <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">·</span>
                {rule}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
