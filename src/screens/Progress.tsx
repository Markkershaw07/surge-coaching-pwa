import { useEffect, useMemo, useState } from 'react';
import { Download, Flame, History, Scale, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useDailyLog } from '../hooks/useDailyLog';
import { useHistory } from '../hooks/useHistory';
import { useAppSettings } from '../hooks/useAppSettings';
import { exportComplianceCsv, exportWorkoutCsv } from '../utils/exportCsv';
import { EXTERNAL_METRICS_PROVIDERS } from '../utils/externalMetrics';
import type { HydrationPayload, MealPayload, StepsPayload, WeightPayload, WorkoutPayload } from '../types';

export function Progress() {
  const { addEntry, getByType, loading } = useDailyLog();
  const { getEntriesForDateRange, getWeightHistory, getWorkoutHistory } = useHistory();
  const { settings } = useAppSettings();

  const [weightInput, setWeightInput] = useState('');
  const [weightHistory, setWeightHistory] = useState<{ date: string; kg: number }[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<{ date: string; sessionType: string; durationMin: number; finished: boolean }[]>([]);
  const [dailySummary, setDailySummary] = useState<Array<{ date: string; steps: number; hydration: number; meals: number }>>([]);

  const todayWeightEntries = getByType('weight');
  const todayWeight = todayWeightEntries.length > 0 ? (todayWeightEntries[todayWeightEntries.length - 1].payload as WeightPayload).kg : null;

  useEffect(() => {
    const load = async () => {
      const [weights, workouts] = await Promise.all([
        getWeightHistory(90),
        getWorkoutHistory(6),
      ]);
      setWeightHistory(weights);
      setWorkoutHistory(workouts.map(entry => ({
        date: entry.date,
        sessionType: (entry.payload as WorkoutPayload).sessionType,
        durationMin: (entry.payload as WorkoutPayload).durationMin ?? 0,
        finished: Boolean((entry.payload as WorkoutPayload).finished),
      })));

      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 13);
      const entries = await getEntriesForDateRange(from.toISOString().split('T')[0], to.toISOString().split('T')[0]);
      const byDate = new Map<string, { steps: number; hydration: number; meals: number }>();
      for (const entry of entries) {
        const current = byDate.get(entry.date) ?? { steps: 0, hydration: 0, meals: 0 };
        if (entry.type === 'steps') current.steps = (entry.payload as StepsPayload).steps;
        if (entry.type === 'hydration') current.hydration += (entry.payload as HydrationPayload).ml / 1000;
        if (entry.type === 'meal' && (entry.payload as MealPayload).eaten) current.meals += 1;
        byDate.set(entry.date, current);
      }
      setDailySummary(Array.from(byDate.entries()).sort(([left], [right]) => left.localeCompare(right)).map(([date, value]) => ({ date: date.slice(5), ...value })));
    };

    load();
  }, [getEntriesForDateRange, getWeightHistory, getWorkoutHistory]);

  const handleLogWeight = async () => {
    const kg = parseFloat(weightInput);
    if (!isNaN(kg) && kg > 0) {
      const date = new Date().toISOString().split('T')[0];
      await addEntry('weight', { kg } as WeightPayload, `weight-${date}`);
      setWeightInput('');
      const weights = await getWeightHistory(90);
      setWeightHistory(weights);
    }
  };

  const todayStepsEntries = getByType('steps');
  const currentSteps = todayStepsEntries.length > 0 ? (todayStepsEntries[todayStepsEntries.length - 1].payload as StepsPayload).steps : 0;
  const todayHydration = getByType('hydration').reduce((sum, entry) => sum + (entry.payload as HydrationPayload).ml, 0) / 1000;
  const todayMeals = getByType('meal').filter(entry => (entry.payload as MealPayload).eaten).length;

  const workoutCompletionRate = useMemo(() => {
    if (workoutHistory.length === 0) return 0;
    return Math.round((workoutHistory.filter(item => item.finished).length / workoutHistory.length) * 100);
  }, [workoutHistory]);

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center gap-2">
        <TrendingUp size={20} className="text-orange-500" />
        <h1 className="text-2xl font-bold text-slate-100">Progress</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800 rounded-2xl p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-slate-500">Workout completion</p>
          <p className="text-3xl font-bold text-green-400 mt-2">{workoutCompletionRate}%</p>
          <p className="text-xs text-slate-500 mt-1">finished sessions in recent history</p>
        </div>
        <div className="bg-slate-800 rounded-2xl p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-slate-500">Today&apos;s meals</p>
          <p className="text-3xl font-bold text-orange-400 mt-2">{todayMeals}</p>
          <p className="text-xs text-slate-500 mt-1">confirmed as eaten</p>
        </div>
      </div>

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
            <input type="number" step="0.1" value={weightInput} onChange={e => setWeightInput(e.target.value)} placeholder="Today's fasted weight (kg)" className="flex-1 bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm" />
            <button onClick={handleLogWeight} className="bg-orange-500 active:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium">Log</button>
          </div>
        )}

        {weightHistory.length > 1 ? (
          <div className="h-44 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightHistory} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={date => date.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px' }} labelStyle={{ color: '#94a3b8' }} itemStyle={{ color: '#f97316' }} />
                <Line type="monotone" dataKey="kg" stroke="#f97316" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-xs text-slate-600 text-center">Log a few days to see your weight trend.</p>
        )}
      </div>

      <div className="bg-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-200">Two-week adherence</h2>
          <span className="text-xs text-slate-500">Water, steps, meals</span>
        </div>
        {dailySummary.length > 0 ? (
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySummary} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="hydration" fill="#3b82f6" name="Hydration (L)" />
                <Bar dataKey="meals" fill="#f97316" name="Meals eaten" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-xs text-slate-600 text-center">Log a few days to unlock adherence charts.</p>
        )}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-slate-700/50 rounded-xl p-3">
            <p className="text-xl font-bold text-green-400">{currentSteps.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">Steps today</p>
          </div>
          <div className="bg-slate-700/50 rounded-xl p-3">
            <p className="text-xl font-bold text-blue-400">{todayHydration.toFixed(1)}L</p>
            <p className="text-xs text-slate-500 mt-1">Water today</p>
          </div>
          <div className="bg-slate-700/50 rounded-xl p-3">
            <p className="text-xl font-bold text-orange-400">{settings.stepGoal.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">Step goal</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <History size={18} className="text-blue-400" />
          <h2 className="font-semibold text-slate-200">Recent workouts</h2>
        </div>
        {workoutHistory.length === 0 ? (
          <p className="text-xs text-slate-600 text-center py-4">No workout sessions logged yet</p>
        ) : (
          <div className="space-y-1">
            {workoutHistory.slice(-7).reverse().map((workout, index) => (
              <div key={index} className="flex items-center justify-between bg-slate-700/50 rounded-lg px-3 py-2 text-sm gap-3">
                <div>
                  <span className="text-slate-200 capitalize">{workout.sessionType}</span>
                  <p className="text-[11px] text-slate-500 mt-1">{workout.finished ? 'Finished workout' : 'Saved mid-session'}{workout.durationMin ? ` | ${workout.durationMin} min` : ''}</p>
                </div>
                <span className="text-xs text-slate-500">{workout.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download size={16} className="text-slate-400" />
            <h2 className="font-semibold text-slate-200">Coach exports</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => exportWorkoutCsv()} className="bg-slate-700 text-slate-200 py-2 rounded-xl text-sm font-medium">Export workouts CSV</button>
          <button onClick={() => exportComplianceCsv()} className="bg-slate-700 text-slate-200 py-2 rounded-xl text-sm font-medium">Export compliance CSV</button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Flame size={18} className="text-orange-400" />
          <h2 className="font-semibold text-slate-200">Integration roadmap</h2>
        </div>
        {EXTERNAL_METRICS_PROVIDERS.map(provider => (
          <div key={provider.id} className="bg-slate-700/50 rounded-xl p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-200">{provider.label}</p>
              <span className={`text-[11px] uppercase tracking-wide ${provider.status === 'manual-only' ? 'text-green-400' : 'text-slate-500'}`}>{provider.status === 'manual-only' ? 'Current' : 'Planned'}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{provider.notes}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
