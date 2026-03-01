import { Check } from 'lucide-react';

interface Props {
  name: string;
  dose: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

export function SupplementCheck({ name, dose, checked, disabled, onChange }: Props) {
  return (
    <button
      className={`flex items-center gap-3 w-full p-3 rounded-xl text-left transition-colors ${
        disabled
          ? 'opacity-40 cursor-not-allowed bg-slate-800'
          : checked
          ? 'bg-green-900/40 border border-green-700/50'
          : 'bg-slate-800 active:bg-slate-700'
      }`}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
    >
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
        checked ? 'bg-green-500 border-green-500' : 'border-slate-600'
      }`}>
        {checked && <Check size={14} className="text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">{name}</p>
        <p className="text-xs text-slate-500">{dose}</p>
      </div>
    </button>
  );
}
