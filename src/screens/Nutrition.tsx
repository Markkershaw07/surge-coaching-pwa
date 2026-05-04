import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ClipboardList, Info, UtensilsCrossed } from 'lucide-react';
import { MealCard } from '../components/MealCard';
import { MacroBar } from '../components/MacroBar';
import { useDayType } from '../hooks/useDayType';
import { useDailyLog } from '../hooks/useDailyLog';
import { useWeeklyPlan } from '../hooks/useWeeklyPlan';
import { NUTRITION_PLAN, computeDayTotals } from '../data/nutrition';
import { COOKING_RULES } from '../data/targets';
import type { MealPayload } from '../types';

function todayKey() {
  return new Date().toISOString().split('T')[0];
}

export function Nutrition() {
  const { dayType } = useDayType();
  const { addEntry, editEntry, getByType, loading } = useDailyLog();
  const weeklyPlan = useWeeklyPlan();

  const [viewType, setViewType] = useState<'training' | 'rest'>(dayType);
  const [showCookingRules, setShowCookingRules] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const todayPlan = weeklyPlan.getDay(todayKey());
  const plan = NUTRITION_PLAN[viewType];
  const todayMealEntries = getByType('meal');

  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    for (const slot of NUTRITION_PLAN[viewType].slots) {
      defaults[slot.id] = slot.defaultOption;
    }
    return defaults;
  });

  const mealState = useMemo(() => {
    const next = new Map<string, { entryId: string; payload: MealPayload; entryRef: typeof todayMealEntries[number] }>();
    for (const entry of todayMealEntries) {
      const payload = entry.payload as MealPayload;
      next.set(payload.slot, { entryId: entry.id, payload, entryRef: entry });
    }
    return next;
  }, [todayMealEntries]);

  useEffect(() => {
    if (loading) return;

    const baseSelections: Record<string, string> = {};
    const sourceDayType = todayPlan?.dayType ?? dayType;
    for (const slot of NUTRITION_PLAN[sourceDayType].slots) {
      baseSelections[slot.id] = todayPlan?.selections[slot.id] ?? slot.defaultOption;
    }

    for (const entry of todayMealEntries) {
      const payload = entry.payload as MealPayload;
      baseSelections[payload.slot] = payload.alternative;
    }

    setSelections(baseSelections);
    setViewType(sourceDayType);
  }, [dayType, loading, todayMealEntries, todayPlan]);

  const plannedTotals = computeDayTotals(plan, selections);
  const eatenSelections = useMemo(() => {
    const next: Record<string, string> = {};
    for (const [slotId, state] of mealState.entries()) {
      if (state.payload.eaten) next[slotId] = state.payload.alternative;
    }
    return next;
  }, [mealState]);
  const eatenTotals = computeDayTotals(plan, eatenSelections);

  const mismatches: string[] = [];
  if (Math.abs(plannedTotals.kcal - plan.targetKcal) > 5) mismatches.push(`kcal: ${plannedTotals.kcal} vs ${plan.targetKcal} target`);
  if (Math.abs(plannedTotals.p - plan.targetP) > 1) mismatches.push(`Protein: ${plannedTotals.p}g vs ${plan.targetP}g target`);
  if (Math.abs(plannedTotals.c - plan.targetC) > 1) mismatches.push(`Carbs: ${plannedTotals.c}g vs ${plan.targetC}g target`);
  if (Math.abs(plannedTotals.f - plan.targetF) > 1) mismatches.push(`Fat: ${plannedTotals.f}g vs ${plan.targetF}g target`);

  const plannerTotals = useMemo(() => computeDayTotals(weeklyPlan.selectedPlan, weeklyPlan.selectedDay.selections), [weeklyPlan.selectedPlan, weeklyPlan.selectedDay]);

  const upsertMeal = async (slotId: string, alternative: string, eaten: boolean) => {
    const existing = mealState.get(slotId);
    if (existing) {
      await editEntry(existing.entryRef, {
        ...existing.payload,
        alternative,
        eaten,
        eatenAt: eaten ? (existing.payload.eatenAt ?? Date.now()) : undefined,
      } as MealPayload);
      return;
    }

    await addEntry('meal', {
      slot: slotId,
      alternative,
      eaten,
      eatenAt: eaten ? Date.now() : undefined,
    } as MealPayload, `meal-${slotId}-${todayKey()}`);
  };

  const handleSelect = async (slotId: string, optionId: string) => {
    setSelections(prev => ({ ...prev, [slotId]: optionId }));
    const existing = mealState.get(slotId);
    await upsertMeal(slotId, optionId, existing?.payload.eaten ?? false);
  };

  const applyTodayPlan = async () => {
    if (!todayPlan) return;
    setViewType(todayPlan.dayType);
    setSelections(todayPlan.selections);
    for (const [slotId, optionId] of Object.entries(todayPlan.selections)) {
      const existing = mealState.get(slotId);
      await upsertMeal(slotId, optionId, existing?.payload.eaten ?? false);
    }
  };

  const toggleMealEaten = async (slotId: string) => {
    const optionId = selections[slotId] ?? plan.slots.find(slot => slot.id === slotId)?.defaultOption;
    if (!optionId) return;
    const existing = mealState.get(slotId);
    await upsertMeal(slotId, optionId, !(existing?.payload.eaten ?? false));
  };

  const copyShoppingList = async () => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(weeklyPlan.shoppingListText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1500);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UtensilsCrossed size={20} className="text-orange-500" />
          <h1 className="text-2xl font-bold text-slate-100">Nutrition</h1>
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-orange-400" />
          <h2 className="font-semibold text-slate-200">Weekly planner</h2>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {weeklyPlan.weekDays.map(day => (
            <button
              key={day.date}
              onClick={() => weeklyPlan.setSelectedDate(day.date)}
              className={`min-w-[82px] rounded-xl px-3 py-2 text-left ${weeklyPlan.selectedDate === day.date ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-300'}`}
            >
              <div className="text-xs uppercase">{new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short' })}</div>
              <div className="text-sm font-semibold">{new Date(day.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
            </button>
          ))}
        </div>

        <div className="flex bg-slate-700 rounded-xl p-1 gap-1">
          <button
            onClick={() => weeklyPlan.updateDayType(weeklyPlan.selectedDay.date, 'training')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${weeklyPlan.selectedDay.dayType === 'training' ? 'bg-orange-500 text-white' : 'text-slate-400'}`}
          >
            Training
          </button>
          <button
            onClick={() => weeklyPlan.updateDayType(weeklyPlan.selectedDay.date, 'rest')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${weeklyPlan.selectedDay.dayType === 'rest' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}
          >
            Rest
          </button>
        </div>

        <div className="bg-slate-700/40 rounded-xl p-3">
          <p className="text-sm text-slate-200 font-semibold">{plannerTotals.kcal} kcal planned</p>
          <p className="text-xs text-slate-500 mt-1">Protein {plannerTotals.p}g | Carbs {plannerTotals.c}g | Fat {plannerTotals.f}g</p>
        </div>

        <div className="space-y-3">
          {weeklyPlan.selectedPlan.slots.map(slot => (
            <MealCard
              key={`${weeklyPlan.selectedDay.date}-${slot.id}`}
              slot={slot}
              selectedOptionId={weeklyPlan.selectedDay.selections[slot.id] ?? slot.defaultOption}
              onSelect={optionId => weeklyPlan.updateSelection(weeklyPlan.selectedDay.date, slot.id, optionId)}
            />
          ))}
        </div>

        <div className="bg-slate-700/40 rounded-xl p-3 space-y-3">
          <div className="flex items-center gap-2">
            <ClipboardList size={16} className="text-orange-400" />
            <p className="text-sm font-semibold text-slate-200">Shopping list</p>
            <button onClick={copyShoppingList} className="ml-auto text-xs text-orange-400">{copySuccess ? 'Copied' : 'Copy list'}</button>
          </div>
          <pre className="whitespace-pre-wrap text-xs text-slate-300 font-sans max-h-56 overflow-y-auto">{weeklyPlan.shoppingListText}</pre>
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-200">Today&apos;s meals</h2>
          <button onClick={applyTodayPlan} className="text-xs text-orange-400">Use today&apos;s plan</button>
        </div>

        <div className="flex bg-slate-700 rounded-xl p-1 gap-1">
          <button
            onClick={() => setViewType('training')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${viewType === 'training' ? 'bg-orange-500 text-white' : 'text-slate-400'}`}
          >
            Training day
          </button>
          <button
            onClick={() => setViewType('rest')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${viewType === 'rest' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}
          >
            Rest day
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="bg-slate-700/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-200">Planned intake</h2>
              <div className="text-right">
                <p className="text-lg font-bold text-orange-400">{plannedTotals.kcal} kcal</p>
                <p className="text-xs text-slate-500">target: {plan.targetKcal} kcal</p>
              </div>
            </div>
            <MacroBar label="Protein" value={plannedTotals.p} target={plan.targetP} colour="#3b82f6" />
            <MacroBar label="Carbs" value={plannedTotals.c} target={plan.targetC} colour="#eab308" />
            <MacroBar label="Fat" value={plannedTotals.f} target={plan.targetF} colour="#ec4899" />
          </div>
          <div className="bg-slate-700/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-200">Eaten so far</h2>
              <div className="text-right">
                <p className="text-lg font-bold text-green-400">{eatenTotals.kcal} kcal</p>
                <p className="text-xs text-slate-500">fills as you confirm meals</p>
              </div>
            </div>
            <MacroBar label="Protein" value={eatenTotals.p} target={plan.targetP} colour="#22c55e" />
            <MacroBar label="Carbs" value={eatenTotals.c} target={plan.targetC} colour="#14b8a6" />
            <MacroBar label="Fat" value={eatenTotals.f} target={plan.targetF} colour="#f97316" />
          </div>
        </div>

        {mismatches.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex items-start gap-2">
            <Info size={16} className="text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-yellow-400">Macro calculation mismatch detected</p>
              {mismatches.map((mismatch, index) => (
                <p key={index} className="text-xs text-yellow-500/80 mt-0.5">{mismatch}</p>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {plan.slots.map(slot => {
            const state = mealState.get(slot.id);
            const eaten = state?.payload.eaten ?? false;
            return (
              <MealCard
                key={slot.id}
                slot={slot}
                selectedOptionId={selections[slot.id] ?? slot.defaultOption}
                onSelect={optionId => handleSelect(slot.id, optionId)}
                onAction={() => toggleMealEaten(slot.id)}
                actionLabel={eaten ? 'Mark as not eaten' : 'Mark as eaten'}
                actionTone={eaten ? 'success' : 'primary'}
                statusText={eaten ? 'Included in today\'s intake totals' : 'Planned only until you mark it eaten'}
              />
            );
          })}
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between p-4"
          onClick={() => setShowCookingRules(value => !value)}
        >
          <span className="text-sm font-medium text-slate-400">Cooking rules</span>
          <span className="text-xs text-slate-600">{showCookingRules ? 'Hide' : 'Show'}</span>
        </button>
        {showCookingRules && (
          <ul className="px-4 pb-4 space-y-1.5">
            {COOKING_RULES.map((rule, index) => (
              <li key={index} className="text-xs text-slate-400 flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">-</span>
                {rule}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
