import { useState } from 'react';
import { Check, Circle, Droplets, Footprints } from 'lucide-react';
import { useChecklistItems } from '../hooks/useChecklistItems';
import { useDayType } from '../hooks/useDayType';
import { useDailyLog } from '../hooks/useDailyLog';
import { useReminders } from '../hooks/useReminders';
import { SESSION_COLOURS, SESSION_LABELS } from '../data/schedule';
import { MOVEMENT_PREP } from '../data/movementPrep';
import { CardioPanel } from './CardioPanel';
import { ReminderBanner } from './ReminderBanner';
import type { ChecklistSection, ChecklistItemDef } from '../data/checklistSchedule';
import type { ChecklistItemState, WeightPayload } from '../types';

interface WeighRowProps {
  state: ChecklistItemState;
  isNext: boolean;
  loggedKg: number | null;
  onUndo: () => void;
  onLogWeight: (kg: number) => void;
}

function RowCircle({ ticked, isNext, overdue }: { ticked: boolean; isNext: boolean; overdue: boolean }) {
  if (ticked) {
    return (
      <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
        <Check size={14} strokeWidth={3} className="text-white" />
      </div>
    );
  }

  return (
    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${overdue ? 'border-yellow-400 text-yellow-400' : isNext ? 'border-orange-400 text-orange-400' : 'border-slate-600 text-slate-600'}`}>
      <Circle size={10} fill="currentColor" strokeWidth={0} />
    </div>
  );
}

function WeighRow({ state, isNext, loggedKg, onUndo, onLogWeight }: WeighRowProps) {
  const [showInput, setShowInput] = useState(false);
  const [kgInput, setKgInput] = useState('');

  const handlePress = () => {
    if (state.ticked) {
      onUndo();
    } else {
      setShowInput(true);
    }
  };

  const handleSave = () => {
    const kg = parseFloat(kgInput);
    if (!isNaN(kg) && kg > 0) {
      onLogWeight(kg);
      setShowInput(false);
      setKgInput('');
    }
  };

  return (
    <div className="py-1">
      <button onClick={handlePress} className="w-full flex items-center gap-3 py-2 text-left active:opacity-70 min-h-[44px]">
        <RowCircle ticked={state.ticked} isNext={isNext} overdue={state.overdue} />
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-medium ${state.ticked ? 'text-slate-400 line-through' : 'text-slate-200'}`}>Weigh yourself</p>
            {isNext && !state.ticked && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400">NEXT</span>}
            {state.ticked && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300">TAP TO UNDO</span>}
            {state.overdue && !state.ticked && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-300">DUE</span>}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{state.ticked && loggedKg != null ? `${loggedKg} kg logged` : 'first thing, before eating'}</p>
        </div>
      </button>
      {showInput && !state.ticked && (
        <div className="flex gap-2 mt-1 ml-10 pb-2">
          <input type="number" value={kgInput} onChange={e => setKgInput(e.target.value)} placeholder="kg" className="flex-1 bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm" autoFocus />
          <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium">Save</button>
          <button onClick={() => setShowInput(false)} className="text-slate-500 text-sm px-2">Cancel</button>
        </div>
      )}
    </div>
  );
}

interface ItemRowProps {
  item: ChecklistItemDef;
  state: ChecklistItemState;
  isNext: boolean;
  onComplete: (id: string) => void;
  onUndo: (id: string) => void;
  movementPrepDetails?: { name: string; detail: string }[];
}

function ItemRow({ item, state, isNext, onComplete, onUndo, movementPrepDetails }: ItemRowProps) {
  const sublabel = state.detailText ?? [item.dose, item.hint].filter(Boolean).join(' | ');

  const handlePress = () => {
    if (state.ticked && state.canUndo) {
      onUndo(item.id);
      return;
    }

    if (!state.ticked && ['manual', 'supplement', 'meal', 'hydration'].includes(item.source)) {
      onComplete(item.id);
    }
  };

  return (
    <div className="py-1">
      <button onClick={handlePress} className="w-full flex items-center gap-3 py-3 text-left active:opacity-70 min-h-[56px]">
        <RowCircle ticked={state.ticked} isNext={isNext} overdue={state.overdue} />
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-medium ${state.ticked ? 'text-slate-400 line-through' : 'text-slate-200'}`}>{item.label}</p>
            {isNext && !state.ticked && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400">NEXT</span>}
            {state.overdue && !state.ticked && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-300">DUE</span>}
            {state.ticked && state.source !== 'manual' && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300">AUTO</span>}
            {state.ticked && state.canUndo && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300">UNDO</span>}
            {state.optional && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-400">OPTIONAL</span>}
          </div>
          {sublabel && <p className="text-xs text-slate-500 mt-0.5">{sublabel}</p>}
          {!state.ticked && item.source === 'meal' && <p className="text-[11px] text-slate-600 mt-1">Tap to log the planned/default meal.</p>}
          {!state.ticked && item.source === 'supplement' && <p className="text-[11px] text-slate-600 mt-1">Tap to mark this supplement as taken.</p>}
          {!state.ticked && item.source === 'hydration' && <p className="text-[11px] text-slate-600 mt-1">Tap to add 500ml quickly.</p>}
          {!state.ticked && ['steps', 'workout', 'cardio'].includes(item.source) && <p className="text-[11px] text-slate-600 mt-1">Use the tracker controls on this screen to complete this.</p>}
        </div>
      </button>
      {item.id === 'movement-prep' && movementPrepDetails && movementPrepDetails.length > 0 && (
        <div className="ml-10 pb-2 space-y-1 text-xs text-slate-500">
          {movementPrepDetails.map(exercise => <div key={exercise.name}>{exercise.name} - {exercise.detail}</div>)}
        </div>
      )}
    </div>
  );
}

interface SectionProps {
  section: ChecklistSection;
  itemStates: Record<string, ChecklistItemState>;
  nextItemId: string | null;
  loggedKg: number | null;
  onComplete: (id: string) => void;
  onUndo: (id: string) => void;
  onLogWeight: (kg: number) => void;
  movementPrepDetails?: { name: string; detail: string }[];
}

function SectionBlock({ section, itemStates, nextItemId, loggedKg, onComplete, onUndo, onLogWeight, movementPrepDetails }: SectionProps) {
  return (
    <div className="mt-6 first:mt-0">
      <div className="mb-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{section.title}</p>
        {section.subtitle && <p className="text-xs text-slate-600 mt-0.5">{section.subtitle}</p>}
      </div>
      <div className="divide-y divide-slate-800/60 rounded-2xl bg-slate-800 px-4">
        {section.items.map(item => {
          const state = itemStates[item.id];
          const isNext = item.id === nextItemId;

          if (item.id === 'weigh') {
            return <WeighRow key={item.id} state={state} isNext={isNext} loggedKg={loggedKg} onUndo={() => onUndo(item.id)} onLogWeight={onLogWeight} />;
          }

          return <ItemRow key={item.id} item={item} state={state} isNext={isNext} onComplete={onComplete} onUndo={onUndo} movementPrepDetails={item.id === 'movement-prep' ? movementPrepDetails : undefined} />;
        })}
      </div>
    </div>
  );
}

export function DayChecklist() {
  const {
    sections,
    itemStates,
    doneCount,
    totalCount,
    completeItem,
    undoItem,
    nextItemId,
    firstMealTs,
    hydrationTarget,
    stepGoal,
  } = useChecklistItems();
  const { session } = useDayType();
  const { addEntry, getByType } = useDailyLog();
  const movementPrepDetails = MOVEMENT_PREP[session] ?? [];

  const checklistItems = Object.values(itemStates).map(item => ({ ...item }));
  const { overdueIds, reminderCard } = useReminders({ items: checklistItems, firstMealTs });
  for (const item of checklistItems) {
    item.overdue = overdueIds.has(item.id);
  }
  const displayItemStates = Object.fromEntries(checklistItems.map(item => [item.id, item]));

  const weightEntries = getByType('weight');
  const loggedKg = weightEntries.length > 0 ? (weightEntries[weightEntries.length - 1].payload as WeightPayload).kg : null;
  const allDone = doneCount === totalCount;

  const handleLogWeight = async (kg: number) => {
    await addEntry('weight', { kg });
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-slate-100 flex-1">Daily Checklist</h1>
        <span className="text-sm font-semibold text-orange-400 mr-1">{doneCount}/{totalCount}</span>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold text-white ${SESSION_COLOURS[session]}`}>{SESSION_LABELS[session]}</span>
      </div>

      {reminderCard && <ReminderBanner card={reminderCard} />}

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800 rounded-2xl p-3">
          <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold"><Droplets size={16} className="text-blue-400" /> Water target</div>
          <p className="text-slate-400 text-xs mt-1">{hydrationTarget}L today</p>
        </div>
        <div className="bg-slate-800 rounded-2xl p-3">
          <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold"><Footprints size={16} className="text-green-400" /> Step goal</div>
          <p className="text-slate-400 text-xs mt-1">{stepGoal.toLocaleString()} steps</p>
        </div>
      </div>

      <div>
        {sections.map(section => (
          <SectionBlock
            key={section.id}
            section={section}
            itemStates={displayItemStates}
            nextItemId={nextItemId}
            loggedKg={loggedKg}
            onComplete={completeItem}
            onUndo={undoItem}
            onLogWeight={handleLogWeight}
            movementPrepDetails={movementPrepDetails}
          />
        ))}
      </div>

      <CardioPanel />

      {allDone && (
        <div className="bg-green-900/40 border border-green-700/60 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <Check size={16} strokeWidth={3} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-green-400">Day complete</p>
            <p className="text-xs text-slate-400">Everything important is done for today.</p>
          </div>
        </div>
      )}
    </div>
  );
}
