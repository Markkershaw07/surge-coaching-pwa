import { useState, useEffect } from 'react';
import { TrendingUp, Scale, History, Flame } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDailyLog } from '../hooks/useDailyLog';
import { useHistory } from '../hooks/useHistory';
import type { WeightPayload, WorkoutPayload } from '../types';

export function Progress() {
  const { addEntry, getByType, loading } = useDailyLog();
  const { getWeightHistory, getWorkoutHistory } = useHistory();

  const [weightInput, setWeightInput] = useState('');
  const [weightHistory, setWeightHistory] = useState<{ date: string; kg: number }[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<{ date: string; sessionType: string }[]>([]);

  const todayWeightEntries = getByType('weight');
  const todayWeight = todayWeightEntries.length > 0 ? (todayWeightEntries[todayWeightEntries.length - 1].payload as WeightPayload).kg : null;

  useEffect(() => {
    getWeightHistory(90).then(setWeightHistory);
    getWorkoutHistory(4).then(entries => {
      setWorkoutHistory(entries.map(e => ({
        date: e.date,
        sessionType: (e.payload as WorkoutPayload).sessionType,
      })));
    });
  }, []);

  const handleLogWeight = async () => {
    const kg = parseFloat(weightInput);
    if (!isNaN(kg) && kg > 0) {
      const date = new Date().toISOString().split('T')[0];
      await addEntry('weight', { kg } as WeightPayload, `weight-${date}`);
      setWeightInput('');
      getWeightHistory(90).then(setWeightHistory);
    }
  };

  // Streak calculations
  const suppEntries = getByType('supplement');
  const suppStreak = suppEntries.length > 0 ? 1 : 0; // simplified — count today

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-500">Loading…</div>;

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center gap-2">
        <TrendingUp size={20} className="text-orange-500" />
        <h1 className="text-2xl font-bold text-slate-100">Progress</h1>
      </div>

      {/* Bodyweight */}
      <div className="bg-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Scale size={18} className="text-orange-400" />
          <h2 className="font-semibold text-slate-200">Bodyweight</h2>
          <span className="text-xs text-slate-500 ml-auto">Fasted morning</span>
        </div>

        {todayWeight ? (
          <p className="text-3xl font-bold text-orange-400">{todayWeight}kg <span className="text-sm text-slate-500 font-normal">today</span></p>
        ) : (
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              value={weightInput}
              onChange={e => setWeightInput(e.target.value)}
              placeholder="Today's fasted weight (kg)"
              className="flex-1 bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm"
            />
            <button onClick={handleLogWeight} className="bg-orange-500 active:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium">Log</button>
          </div>
        )}

        {weightHistory.length > 1 && (
          <div className="h-40 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightHistory} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ color: '#f97316' }}
                />
                <Line type="monotone" dataKey="kg" stroke="#f97316" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {weightHistory.length <= 1 && (
          <p className="text-xs text-slate-600 text-center">Log a few days to see your weight trend</p>
        )}
      </div>

      {/* Weekly check-in helper */}
      <div className="bg-slate-800 rounded-2xl p-4 space-y-2">
        <h2 className="font-semibold text-slate-200">Weekly Check-In Helper</h2>
        <p className="text-xs text-slate-500">What to share with your coach each week:</p>
        <ul className="space-y-1.5">
          {[
            'Fasted morning weight (same day each week)',
            'Progress photos (front, side, back) in good lighting',
            'Overall energy and recovery rating (1–10)',
            'Any struggles with nutrition, sleep or training',
            'Highlight of the week',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
              <span className="text-orange-500 mt-0.5 shrink-0">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Workout history */}
      <div className="bg-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <History size={18} className="text-blue-400" />
          <h2 className="font-semibold text-slate-200">Recent Workouts</h2>
        </div>
        {workoutHistory.length === 0 ? (
          <p className="text-xs text-slate-600 text-center py-4">No workout sessions logged yet</p>
        ) : (
          <div className="space-y-1">
            {workoutHistory.slice(-7).reverse().map((w, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-700/50 rounded-lg px-3 py-2 text-sm">
                <span className="text-slate-200 capitalize">{w.sessionType}</span>
                <span className="text-xs text-slate-500">{w.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Streaks */}
      <div className="bg-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Flame size={18} className="text-orange-400" />
          <h2 className="font-semibold text-slate-200">Today's Status</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-700/50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-yellow-400">{suppStreak > 0 ? '✓' : '–'}</p>
            <p className="text-xs text-slate-500 mt-1">Supps logged</p>
          </div>
          <div className="bg-slate-700/50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{todayWeight ? '✓' : '–'}</p>
            <p className="text-xs text-slate-500 mt-1">Weight logged</p>
          </div>
        </div>
      </div>
    </div>
  );
}
