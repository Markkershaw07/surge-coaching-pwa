import { useEffect, useState } from 'react';
import { Dumbbell, RefreshCw } from 'lucide-react';
import { MovementPrepCard } from '../components/MovementPrepCard';
import { ExerciseLogger } from '../components/ExerciseLogger';
import { useDayType } from '../hooks/useDayType';
import { useDailyLog } from '../hooks/useDailyLog';
import { SESSION_LABELS } from '../data/schedule';
import { MOVEMENT_PREP } from '../data/movementPrep';
import { getWorkoutSession } from '../data/workouts';
import type { ExerciseLog, SetLog, WorkoutPayload } from '../types';

export function Workout() {
  const { session, dayType } = useDayType();
  const { addEntry, getByType, loading } = useDailyLog();
  const workoutSession = session !== 'rest' ? getWorkoutSession(session) : undefined;
  const prepExercises = session !== 'rest' ? MOVEMENT_PREP[session] : undefined;

  const [exerciseSets, setExerciseSets] = useState<Record<string, SetLog[]>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading) {
      const workoutEntries = getByType('workout');
      if (workoutEntries.length > 0) {
        const latest = workoutEntries[workoutEntries.length - 1];
        const payload = latest.payload as WorkoutPayload;
        const setsMap: Record<string, SetLog[]> = {};
        for (const exercise of payload.exercises) {
          setsMap[exercise.exerciseId] = exercise.sets;
        }
        setExerciseSets(setsMap);
        setSaved(true);
      }
    }
  }, [getByType, loading]);

  const handleSetsChange = (exerciseId: string, sets: SetLog[]) => {
    setExerciseSets(prev => ({ ...prev, [exerciseId]: sets }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!workoutSession) return;
    const exercises: ExerciseLog[] = workoutSession.exercises.map(exercise => ({
      exerciseId: exercise.id,
      sets: exerciseSets[exercise.id] ?? [],
    }));
    const sessionDate = new Date().toISOString().split('T')[0];
    await addEntry('workout', {
      sessionType: session,
      exercises,
    } as WorkoutPayload, `workout-${session}-${sessionDate}`);
    setSaved(true);
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-500">Loading...</div>;

  if (dayType === 'rest') {
    return (
      <div className="space-y-4 pb-6">
        <div className="flex items-center gap-2">
          <Dumbbell size={20} className="text-slate-500" />
          <h1 className="text-2xl font-bold text-slate-100">Workout</h1>
        </div>
        <div className="bg-slate-800 rounded-2xl p-6 text-center">
          <p className="text-4xl mb-3">Rest</p>
          <p className="font-semibold text-slate-200 text-lg">Rest day</p>
          <p className="text-slate-500 text-sm mt-2">No lifting session today. Focus on recovery, steps, cardio, and nutrition.</p>
          <p className="text-slate-600 text-xs mt-4">If you are doing cardio today, log it from the Checklist screen.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell size={20} className="text-orange-500" />
          <h1 className="text-2xl font-bold text-slate-100">Workout</h1>
        </div>
        <span className="text-sm font-semibold text-orange-400">{SESSION_LABELS[session]}</span>
      </div>

      {prepExercises && prepExercises.length > 0 && <MovementPrepCard exercises={prepExercises} />}

      <div className="bg-slate-700/30 rounded-xl px-3 py-2 text-xs text-slate-500">
        Tempo: 3-1-1-0 | 1-2 feeder sets | Rest: 90-120s for compounds, as needed for isolations
      </div>

      <div className="space-y-2">
        {workoutSession?.exercises.map(exercise => (
          <ExerciseLogger
            key={exercise.id}
            exercise={exercise}
            sets={exerciseSets[exercise.id] ?? []}
            onChange={sets => handleSetsChange(exercise.id, sets)}
          />
        ))}
      </div>

      <button
        onClick={handleSave}
        className={`w-full py-3 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 ${saved ? 'bg-green-600' : 'bg-orange-500 active:bg-orange-600'}`}
      >
        {saved ? <><RefreshCw size={16} /> Session saved</> : 'Save session'}
      </button>
    </div>
  );
}
