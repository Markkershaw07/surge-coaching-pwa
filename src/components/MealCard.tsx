import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { MealSlot } from '../types';

interface Props {
  slot: MealSlot;
  selectedOptionId: string;
  onSelect: (optionId: string) => void;
  actionLabel?: string;
  actionTone?: 'primary' | 'success' | 'muted';
  actionDisabled?: boolean;
  onAction?: () => void;
  statusText?: string;
}

export function MealCard({ slot, selectedOptionId, onSelect, actionLabel, actionTone = 'primary', actionDisabled, onAction, statusText }: Props) {
  const [open, setOpen] = useState(false);
  const selected = slot.options.find(option => option.id === selectedOptionId) ?? slot.options[0];

  const actionClasses = actionTone === 'success'
    ? 'bg-green-600 text-white'
    : actionTone === 'muted'
      ? 'bg-slate-700 text-slate-300'
      : 'bg-orange-500 text-white';

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 text-left"
        onClick={() => setOpen(value => !value)}
      >
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">{slot.name}</p>
          <p className="font-semibold text-slate-200">{selected.label}</p>
          <p className="text-xs text-slate-400">
            {selected.totals.kcal} kcal | {selected.totals.p}g P | {selected.totals.c}g C | {selected.totals.f}g F
          </p>
          {statusText && <p className="text-xs text-slate-500 mt-1">{statusText}</p>}
        </div>
        {open ? <ChevronUp size={18} className="text-slate-400 shrink-0" /> : <ChevronDown size={18} className="text-slate-400 shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {slot.options.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {slot.options.map(option => (
                <button
                  key={option.id}
                  onClick={() => onSelect(option.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    option.id === selectedOptionId
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-700 text-slate-300 active:bg-slate-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {onAction && actionLabel && (
            <button
              onClick={onAction}
              disabled={actionDisabled}
              className={`w-full rounded-xl px-3 py-2 text-sm font-medium disabled:opacity-60 ${actionClasses}`}
            >
              {actionLabel}
            </button>
          )}

          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-700">
                <th className="text-left py-1 font-normal">Food</th>
                <th className="text-right py-1 font-normal">Qty</th>
                <th className="text-right py-1 font-normal">kcal</th>
                <th className="text-right py-1 font-normal">P</th>
                <th className="text-right py-1 font-normal">C</th>
                <th className="text-right py-1 font-normal">F</th>
              </tr>
            </thead>
            <tbody>
              {selected.foods.map((food, index) => (
                <tr key={index} className="border-b border-slate-700/50 text-slate-300">
                  <td className="py-1 pr-2">{food.name}</td>
                  <td className="text-right py-1 text-slate-500">{food.qty}</td>
                  <td className="text-right py-1">{food.kcal}</td>
                  <td className="text-right py-1">{food.p}</td>
                  <td className="text-right py-1">{food.c}</td>
                  <td className="text-right py-1">{food.f}</td>
                </tr>
              ))}
              <tr className="font-semibold text-slate-200">
                <td className="pt-2">Total</td>
                <td></td>
                <td className="text-right pt-2">{selected.totals.kcal}</td>
                <td className="text-right pt-2">{selected.totals.p}g</td>
                <td className="text-right pt-2">{selected.totals.c}g</td>
                <td className="text-right pt-2">{selected.totals.f}g</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
