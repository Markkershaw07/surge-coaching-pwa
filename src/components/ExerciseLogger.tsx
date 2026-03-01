import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import type { Exercise, SetLog } from '../types';

interface Props {
  exercise: Exercise;
  sets: SetLog[];
  onChange: (sets: SetLog[]) => void;
}

export function ExerciseLogger({ exercise, sets, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const addSet = () => {
    const last = sets[sets.length - 1];
    onChange([...sets, {
      setNumber: sets.length + 1,
      reps: last?.reps ?? 10,
      weight: last?.weight ?? 0,
      isFeeder: false,
    }]);
  };

  const updateSet = (index: number, field: 'reps' | 'weight', val: number) => {
    const updated = sets.map((s, i) => i === index ? { ...s, [field]: val } : s);
    onChange(updated);
  };

  const removeSet = (index: number) => {
    onChange(sets.filter((_, i) => i !== index).map((s, i) => ({ ...s, setNumber: i + 1 })));
  };

  const totalSets = sets.length;
  const badge = totalSets > 0 ? `${totalSets} set${totalSets !== 1 ? 's' : ''}` : 'No sets';

  return (
    <div className={`rounded-xl overflow-hidden ${exercise.isWarmUp ? 'bg-slate-800/60 border border-slate-700/50' : 'bg-slate-800'}`}>
      <button
        className="w-full flex items-center justify-between p-3 text-left gap-2"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex-1 min-w-0">
          {exercise.isWarmUp && (
            <span className="text-xs text-yellow-500 font-medium uppercase tracking-wide">Warm Up · </span>
          )}
          <span className="text-sm font-medium text-slate-200">{exercise.label}</span>
          <div className="text-xs text-slate-500 mt-0.5">
            {exercise.sets}×{exercise.reps} · rest {exercise.rest}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${totalSets > 0 ? 'bg-green-900/60 text-green-400' : 'bg-slate-700 text-slate-500'}`}>{badge}</span>
          {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2">
          {exercise.notes && (
            <p className="text-xs text-orange-400 bg-orange-500/10 rounded-lg px-3 py-2">{exercise.notes}</p>
          )}
          <p className="text-xs text-slate-500">Tempo: 3-1-1-0 · 1–2 feeder sets before working sets</p>

          {sets.length > 0 && (
            <div className="space-y-1">
              <div className="grid grid-cols-4 gap-2 text-xs text-slate-500 px-1">
                <span>Set</span><span className="text-center">Type</span><span className="text-center">Reps</span><span className="text-center">kg</span>
              </div>
              {sets.map((s, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 items-center bg-slate-700/50 rounded-lg px-1 py-1.5">
                  <span className="text-xs text-slate-400 pl-1">{s.setNumber}</span>
                  <button
                    className={`text-xs rounded px-1 py-0.5 ${s.isFeeder ? 'bg-yellow-900/60 text-yellow-400' : 'bg-slate-600 text-slate-300'}`}
                    onClick={() => {
                      const updated = sets.map((st, idx) => idx === i ? { ...st, isFeeder: !st.isFeeder } : st);
                      onChange(updated);
                    }}
                  >
                    {s.isFeeder ? 'Feeder' : 'Work'}
                  </button>
                  <input
                    type="number" min={0} max={100} value={s.reps}
                    onChange={e => updateSet(i, 'reps', Number(e.target.value))}
                    className="bg-slate-600 text-slate-100 text-xs rounded px-1.5 py-1 w-full text-center"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number" min={0} step={2.5} value={s.weight}
                      onChange={e => updateSet(i, 'weight', Number(e.target.value))}
                      className="bg-slate-600 text-slate-100 text-xs rounded px-1.5 py-1 w-full text-center"
                    />
                    <button onClick={() => removeSet(i)} className="text-slate-500 hover:text-red-400 shrink-0">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={addSet}
            className="flex items-center gap-1.5 text-xs text-orange-400 font-medium mt-1"
          >
            <Plus size={14} /> Add Set
          </button>
        </div>
      )}
    </div>
  );
}
