import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { MovementPrepExercise } from '../types';

interface Props {
  exercises: MovementPrepExercise[];
}

export function MovementPrepCard({ exercises }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 text-left"
        onClick={() => setOpen(v => !v)}
      >
        <span className="font-semibold text-slate-200">Movement Prep</span>
        {open ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
      </button>
      {open && (
        <ul className="px-4 pb-4 space-y-2">
          {exercises.map((ex, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 text-xs flex items-center justify-center shrink-0">{i + 1}</span>
              <div>
                <p className="text-sm text-slate-200">{ex.name}</p>
                <p className="text-xs text-slate-500">{ex.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
