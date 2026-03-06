import { useState, useEffect } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { useChecklistItems } from '../hooks/useChecklistItems';
import { useDayType } from '../hooks/useDayType';
import { useDailyLog } from '../hooks/useDailyLog';
import { SESSION_COLOURS, SESSION_LABELS } from '../data/schedule';
import type { ChecklistSection, ChecklistItemDef } from '../data/checklistSchedule';
import type { WeightPayload } from '../types';

interface Props {
  onClose: () => void;
}

// ─── Weigh row — special case with inline kg input ────────────────────────────

interface WeighRowProps {
  ticked: boolean;
  isNext: boolean;
  loggedKg: number | null;
  onToggle: () => void;
  onLogWeight: (kg: number) => void;
}

function WeighRow({ ticked, isNext, loggedKg, onToggle, onLogWeight }: WeighRowProps) {
  const [showInput, setShowInput] = useState(false);
  const [kgInput, setKgInput] = useState('');

  const handleRowTap = () => {
    if (ticked) {
      onToggle();
    } else if (!showInput) {
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

  const circleClass = ticked
    ? 'w-7 h-7 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0'
    : isNext
    ? 'w-7 h-7 rounded-full border-2 border-orange-400 flex items-center justify-center flex-shrink-0'
    : 'w-7 h-7 rounded-full border-2 border-slate-600 flex items-center justify-center flex-shrink-0';

  return (
    <div className="py-1">
      <button
        onClick={handleRowTap}
        className="w-full flex items-center gap-3 py-2 text-left active:opacity-70 min-h-[44px]"
      >
        <div className={circleClass}>
          {ticked && <Check size={14} strokeWidth={3} className="text-white" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className={`text-sm font-medium ${ticked ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
              Weigh yourself
            </p>
            {isNext && !ticked && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400">
                NEXT
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {ticked && loggedKg != null ? `${loggedKg} kg logged` : 'first thing, before eating'}
          </p>
        </div>
      </button>
      {showInput && !ticked && (
        <div className="flex gap-2 mt-1 ml-10 pb-2">
          <input
            type="number"
            value={kgInput}
            onChange={e => setKgInput(e.target.value)}
            placeholder="kg"
            className="flex-1 bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm"
            autoFocus
          />
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium"
          >
            Save
          </button>
          <button
            onClick={() => setShowInput(false)}
            className="text-slate-500 text-sm px-2"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Standard item row ────────────────────────────────────────────────────────

interface ItemRowProps {
  item: ChecklistItemDef;
  ticked: boolean;
  isNext: boolean;
  onToggle: (id: string) => void;
}

function ItemRow({ item, ticked, isNext, onToggle }: ItemRowProps) {
  const circleClass = ticked
    ? 'w-7 h-7 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0'
    : isNext
    ? 'w-7 h-7 rounded-full border-2 border-orange-400 flex items-center justify-center flex-shrink-0'
    : 'w-7 h-7 rounded-full border-2 border-slate-600 flex items-center justify-center flex-shrink-0';

  const sublabel = [item.dose, item.hint].filter(Boolean).join(' · ');

  return (
    <button
      onClick={() => onToggle(item.id)}
      className="w-full flex items-center gap-3 py-3 text-left active:opacity-70 min-h-[56px]"
    >
      <div className={circleClass}>
        {ticked && <Check size={14} strokeWidth={3} className="text-white" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium ${ticked ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
            {item.label}
          </p>
          {isNext && !ticked && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400">
              NEXT
            </span>
          )}
        </div>
        {sublabel && (
          <p className="text-xs text-slate-500 mt-0.5">{sublabel}</p>
        )}
      </div>
    </button>
  );
}

// ─── Meal timer helper ────────────────────────────────────────────────────────

function formatMealTimer(lastMealTs: number): { text: string; colour: string } {
  const minsAgo = Math.floor((Date.now() - lastMealTs) / 60_000);
  const h = Math.floor(minsAgo / 60);
  const m = minsAgo % 60;
  const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
  if (minsAgo < 120) {
    return { text: `last meal ${timeStr} ago · on track`, colour: 'text-green-400' };
  } else if (minsAgo < 210) {
    return { text: `last meal ${timeStr} ago · eat soon`, colour: 'text-orange-400' };
  } else {
    return { text: `last meal ${timeStr} ago · eat now!`, colour: 'text-red-400' };
  }
}

// ─── Section block ────────────────────────────────────────────────────────────

interface SectionProps {
  section: ChecklistSection;
  ticks: Record<string, { ticked: boolean; ts: number }>;
  nextItemId: string | null;
  lastMealTs: number;
  onToggle: (id: string) => void;
  loggedKg: number | null;
  onLogWeight: (kg: number) => void;
}

function SectionBlock({
  section, ticks, nextItemId, lastMealTs, onToggle, loggedKg, onLogWeight,
}: SectionProps) {
  const mealTimer = section.isMeals && lastMealTs > 0 ? formatMealTimer(lastMealTs) : null;

  return (
    <div className="mt-6">
      <div className="mb-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {section.title}
        </p>
        {mealTimer ? (
          <p className={`text-xs mt-0.5 ${mealTimer.colour}`}>{mealTimer.text}</p>
        ) : section.subtitle ? (
          <p className="text-xs text-slate-600 mt-0.5">{section.subtitle}</p>
        ) : null}
      </div>
      <div className="divide-y divide-slate-800/60">
        {section.items.map(item => {
          const ticked = ticks[item.id]?.ticked ?? false;
          const isNext = item.id === nextItemId;

          if (item.id === 'weigh') {
            return (
              <WeighRow
                key={item.id}
                ticked={ticked}
                isNext={isNext}
                loggedKg={loggedKg}
                onToggle={() => onToggle('weigh')}
                onLogWeight={onLogWeight}
              />
            );
          }

          return (
            <ItemRow
              key={item.id}
              item={item}
              ticked={ticked}
              isNext={isNext}
              onToggle={onToggle}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DayChecklist({ onClose }: Props) {
  const { sections, ticks, doneCount, totalCount, toggle, nextItemId, lastMealTs } = useChecklistItems();
  const { session } = useDayType();
  const { addEntry, getByType } = useDailyLog();
  const [visible, setVisible] = useState(false);
  const [, setMinuteTick] = useState(0);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setMinuteTick(n => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  const weightEntries = getByType('weight');
  const loggedKg = weightEntries.length > 0
    ? (weightEntries[weightEntries.length - 1].payload as WeightPayload).kg
    : null;

  const handleLogWeight = async (kg: number) => {
    await addEntry('weight', { kg });
    toggle('weigh');
  };

  const allDone = doneCount === totalCount;

  return (
    <div
      className="fixed inset-0 z-[60] bg-slate-900 overflow-y-auto"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 200ms ease-out',
      }}
    >
      <div className="sticky top-0 bg-slate-900 z-10 flex items-center gap-3 px-4 py-4 border-b border-slate-800">
        <button onClick={handleClose} className="text-slate-400 active:text-slate-200 p-1 -ml-1">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-bold text-slate-100 flex-1">Daily Checklist</h2>
        <span className="text-sm font-semibold text-orange-400 mr-1">
          {doneCount}/{totalCount}
        </span>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold text-white ${SESSION_COLOURS[session]}`}>
          {SESSION_LABELS[session]}
        </span>
      </div>

      <div className="px-4 pb-8">
        {sections.map(section => (
          <SectionBlock
            key={section.id}
            section={section}
            ticks={ticks}
            nextItemId={nextItemId}
            lastMealTs={lastMealTs}
            onToggle={toggle}
            loggedKg={loggedKg}
            onLogWeight={handleLogWeight}
          />
        ))}

        {allDone && (
          <div className="mt-6 bg-green-900/40 border border-green-700/60 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <Check size={16} strokeWidth={3} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-green-400">Day Complete!</p>
              <p className="text-xs text-slate-400">All {totalCount} tasks done. Great work.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
