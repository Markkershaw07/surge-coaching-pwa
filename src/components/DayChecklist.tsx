import { useState, useEffect } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { useChecklistItems } from '../hooks/useChecklistItems';
import { useDayType } from '../hooks/useDayType';
import { SESSION_COLOURS, SESSION_LABELS } from '../data/schedule';
import type { ChecklistItem } from '../types';

interface RowProps {
  item: ChecklistItem;
  onToggle: (id: string) => void;
}

function ChecklistRow({ item, onToggle }: RowProps) {
  const isManual = item.kind === 'manual';

  const circleClass = item.ticked
    ? 'w-7 h-7 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0'
    : item.partial
    ? 'w-7 h-7 rounded-full border-2 border-orange-400 flex items-center justify-center flex-shrink-0'
    : 'w-7 h-7 rounded-full border-2 border-slate-600 flex items-center justify-center flex-shrink-0';

  const labelClass = item.ticked
    ? 'text-sm font-medium text-slate-200'
    : 'text-sm font-medium text-slate-400';

  const sublabelClass = item.partial
    ? 'text-xs text-orange-400 mt-0.5'
    : 'text-xs text-slate-500 mt-0.5';

  const content = (
    <>
      <div className={circleClass}>
        {item.ticked && <Check size={14} strokeWidth={3} className="text-white" />}
      </div>
      <div>
        <p className={labelClass}>{item.label}</p>
        {item.sublabel && <p className={sublabelClass}>{item.sublabel}</p>}
      </div>
    </>
  );

  if (isManual) {
    return (
      <button
        onClick={() => onToggle(item.id)}
        className="w-full flex items-center gap-3 py-3 text-left active:opacity-70"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 py-3">
      {content}
    </div>
  );
}

interface Props {
  onClose: () => void;
}

export function DayChecklist({ onClose }: Props) {
  const { items, doneCount, totalCount, toggleManual } = useChecklistItems();
  const { session } = useDayType();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  const allDone = doneCount === totalCount;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900 overflow-y-auto"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 200ms ease-out',
      }}
    >
      {/* Sticky header */}
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

      {/* Checklist rows */}
      <div className="px-4 divide-y divide-slate-800/60">
        {items.map(item => (
          <ChecklistRow key={item.id} item={item} onToggle={toggleManual} />
        ))}
      </div>

      {/* Completion banner */}
      {allDone && (
        <div className="mx-4 mt-4 mb-8 bg-green-900/40 border border-green-700/60 rounded-2xl p-4 flex items-center gap-3">
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
  );
}
