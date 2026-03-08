import { useState } from 'react';
import { Activity, Trash2 } from 'lucide-react';
import { useDailyLog } from '../hooks/useDailyLog';
import { DEFAULT_TARGETS } from '../data/targets';
import type { CardioPayload } from '../types';

export function CardioPanel() {
  const { addEntry, removeEntry, getByType, loading } = useDailyLog();
  const [cardioZone, setCardioZone] = useState<2 | 3>(2);
  const [cardioDuration, setCardioDuration] = useState('');
  const [cardioDistance, setCardioDistance] = useState('');
  const [showCardioForm, setShowCardioForm] = useState(false);

  const cardioEntries = getByType('cardio');

  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const mondayStr = monday.toISOString().split('T')[0];
  const todayStr = now.toISOString().split('T')[0];

  const weeklyZ2 = cardioEntries.filter(entry => {
    const payload = entry.payload as CardioPayload;
    return payload.zone === 2 && entry.date >= mondayStr && entry.date <= todayStr;
  }).length;

  const weeklyZ3 = cardioEntries.filter(entry => {
    const payload = entry.payload as CardioPayload;
    return payload.zone === 3 && entry.date >= mondayStr && entry.date <= todayStr;
  }).length;

  const handleLogCardio = async () => {
    const duration = parseInt(cardioDuration, 10);
    if (!isNaN(duration) && duration > 0) {
      await addEntry('cardio', {
        zone: cardioZone,
        durationMin: duration,
        distanceKm: cardioDistance ? parseFloat(cardioDistance) : undefined,
      } as CardioPayload);
      setCardioDuration('');
      setCardioDistance('');
      setShowCardioForm(false);
    }
  };

  if (loading) return null;

  return (
    <div className="bg-slate-800 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Activity size={18} className="text-emerald-400" />
        <h2 className="font-semibold text-slate-200">Cardio</h2>
      </div>

      <div className={`text-sm ${weeklyZ2 >= DEFAULT_TARGETS.cardioZ2PerWeek && weeklyZ3 >= DEFAULT_TARGETS.cardioZ3PerWeek ? 'text-green-400' : 'text-slate-400'}`}>
        This week: Z2 x{weeklyZ2}/{DEFAULT_TARGETS.cardioZ2PerWeek} | Z3 x{weeklyZ3}/{DEFAULT_TARGETS.cardioZ3PerWeek}
      </div>

      {cardioEntries.length > 0 && (
        <div className="space-y-1">
          {[...cardioEntries].reverse().slice(0, 5).map(entry => {
            const payload = entry.payload as CardioPayload;
            return (
              <div key={entry.id} className="flex items-center justify-between bg-slate-700/50 rounded-lg px-3 py-2 text-sm">
                <span className="text-slate-300">Zone {payload.zone} | {payload.durationMin} min{payload.distanceKm ? ` | ${payload.distanceKm}km` : ''}</span>
                <button onClick={() => removeEntry(entry)} className="text-slate-600 hover:text-red-400">
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showCardioForm ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <button onClick={() => setCardioZone(2)} className={`flex-1 py-2 rounded-xl text-sm font-medium ${cardioZone === 2 ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'}`}>Zone 2</button>
            <button onClick={() => setCardioZone(3)} className={`flex-1 py-2 rounded-xl text-sm font-medium ${cardioZone === 3 ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}>Zone 3</button>
          </div>
          <div className="flex gap-2">
            <input type="number" value={cardioDuration} onChange={e => setCardioDuration(e.target.value)} placeholder="Duration (min)" className="flex-1 bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm" />
            <input type="number" step="0.1" value={cardioDistance} onChange={e => setCardioDistance(e.target.value)} placeholder="Distance km" className="flex-1 bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleLogCardio} className="flex-1 bg-emerald-600 active:bg-emerald-700 text-white py-2 rounded-xl text-sm font-medium">Log cardio</button>
            <button onClick={() => setShowCardioForm(false)} className="text-slate-500 px-4 text-sm">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowCardioForm(true)} className="w-full bg-slate-700 active:bg-slate-600 text-slate-300 py-2 rounded-xl text-sm">+ Log cardio session</button>
      )}
    </div>
  );
}
