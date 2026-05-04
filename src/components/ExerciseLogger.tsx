import { Plus, RotateCcw, TimerReset, Trash2 } from 'lucide-react';
import type { Exercise, SetLog } from '../types';

interface PreviousSet {
  reps: number;
  weight: number;
}

interface Props {
  exercise: Exercise;
  sets: SetLog[];
  lastSessionSets?: PreviousSet[];
  onChange: (sets: SetLog[]) => void;
  onCompleteSet: (exercise: Exercise, setIndex: number) => void;
}

function buildNextSet(setNumber: number, base?: SetLog): SetLog {
  return {
    setNumber,
    reps: base?.reps ?? 10,
    weight: base?.weight ?? 0,
    isFeeder: base?.isFeeder ?? false,
    completedAt: undefined,
  };
}

export function ExerciseLogger({ exercise, sets, lastSessionSets = [], onChange, onCompleteSet }: Props) {
  const prescribedCount = exercise.sets;
  const visibleSets = sets.length >= prescribedCount
    ? sets
    : [
        ...sets,
        ...Array.from({ length: prescribedCount - sets.length }, (_, offset) => buildNextSet(sets.length + offset + 1, sets[sets.length - 1])),
      ];

  const updateSet = (index: number, patch: Partial<SetLog>) => {
    const updated = visibleSets.map((item, currentIndex) => currentIndex === index ? { ...item, ...patch, setNumber: currentIndex + 1 } : { ...item, setNumber: currentIndex + 1 });
    onChange(updated);
  };

  const addSet = () => {
    const last = visibleSets[visibleSets.length - 1];
    onChange([...visibleSets, buildNextSet(visibleSets.length + 1, last)]);
  };

  const removeSet = (index: number) => {
    const next = visibleSets.filter((_, currentIndex) => currentIndex !== index).map((item, currentIndex) => ({
      ...item,
      setNumber: currentIndex + 1,
    }));
    onChange(next);
  };

  const completedCount = visibleSets.filter(item => !!item.completedAt).length;
  const lastTopSet = [...lastSessionSets].reverse().find(item => item.weight > 0 || item.reps > 0);

  return (
    <div className={`rounded-2xl border ${exercise.isWarmUp ? 'border-yellow-500/20 bg-slate-800/70' : 'border-slate-700 bg-slate-800'} p-4 space-y-3`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          {exercise.isWarmUp && (
            <span className="text-xs text-yellow-400 font-medium uppercase tracking-wide">Warm up</span>
          )}
          <h3 className="text-sm font-semibold text-slate-100 mt-1">{exercise.label}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {exercise.sets} x {exercise.reps} | Rest {exercise.rest}
          </p>
          {exercise.notes && <p className="text-xs text-slate-400 mt-1">{exercise.notes}</p>}
          {lastTopSet && (
            <p className="text-xs text-emerald-400 mt-2">Last session: {lastTopSet.weight}kg x {lastTopSet.reps}</p>
          )}
        </div>
        <div className="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-300">
          {completedCount}/{visibleSets.length} done
        </div>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-[42px_1fr_1fr_auto] gap-2 px-1 text-[11px] uppercase tracking-wide text-slate-500">
          <span>Set</span>
          <span className="text-center">Weight</span>
          <span className="text-center">Reps</span>
          <span className="text-right">Done</span>
        </div>
        {visibleSets.map((set, index) => {
          const previous = lastSessionSets[index];
          const done = !!set.completedAt;
          return (
            <div key={`${exercise.id}-${index}`} className={`grid grid-cols-[42px_1fr_1fr_auto] gap-2 items-center rounded-xl px-2 py-2 ${done ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-slate-700/50 border border-slate-700'}`}>
              <div className="text-sm font-semibold text-slate-200">{set.setNumber}</div>
              <div>
                <input
                  type="number"
                  min={0}
                  step={2.5}
                  value={set.weight}
                  onChange={event => updateSet(index, { weight: Number(event.target.value) })}
                  className="w-full rounded-lg bg-slate-900/70 px-2 py-2 text-center text-sm text-slate-100"
                />
                {previous && <p className="mt-1 text-[10px] text-slate-500 text-center">Prev {previous.weight}kg</p>}
              </div>
              <div>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={set.reps}
                  onChange={event => updateSet(index, { reps: Number(event.target.value) })}
                  className="w-full rounded-lg bg-slate-900/70 px-2 py-2 text-center text-sm text-slate-100"
                />
                {previous && <p className="mt-1 text-[10px] text-slate-500 text-center">Prev {previous.reps}</p>}
              </div>
              <div className="flex flex-col items-end gap-1">
                <button
                  onClick={() => {
                    updateSet(index, { completedAt: done ? undefined : Date.now() });
                    if (!done) onCompleteSet(exercise, index);
                  }}
                  className={`min-w-[74px] rounded-lg px-3 py-2 text-xs font-semibold ${done ? 'bg-emerald-600 text-white' : 'bg-orange-500 text-white active:bg-orange-600'}`}
                >
                  {done ? 'Done' : 'Finish'}
                </button>
                {index >= prescribedCount && (
                  <button onClick={() => removeSet(index)} className="text-[11px] text-slate-500 hover:text-red-400 flex items-center gap-1">
                    <Trash2 size={12} /> Remove
                  </button>
                )}
                {done && (
                  <button onClick={() => updateSet(index, { completedAt: undefined })} className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1">
                    <RotateCcw size={12} /> Undo
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button onClick={addSet} className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-400">
          <Plus size={15} /> Add extra set
        </button>
        {completedCount > 0 && (
          <div className="inline-flex items-center gap-1 text-xs text-slate-500">
            <TimerReset size={13} /> Rest timer will start when you finish each set
          </div>
        )}
      </div>
    </div>
  );
}
