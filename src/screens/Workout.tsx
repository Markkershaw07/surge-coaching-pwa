import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Dumbbell, PauseCircle, PlayCircle, RotateCcw } from 'lucide-react';
import { MovementPrepCard } from '../components/MovementPrepCard';
import { ExerciseLogger } from '../components/ExerciseLogger';
import { useDayType } from '../hooks/useDayType';
import { useDailyLog } from '../hooks/useDailyLog';
import { useHistory } from '../hooks/useHistory';
import { SESSION_LABELS } from '../data/schedule';
import { MOVEMENT_PREP } from '../data/movementPrep';
import { getWorkoutSession } from '../data/workouts';
import type { Exercise, ExerciseLog, SetLog, WorkoutPayload } from '../types';

function parseRestSeconds(rest: string): number {
  const match = rest.match(/(\d+)/);
  if (!match) return 0;
  return Number(match[1]) * 60;
}

function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function buildInitialExerciseSets(exercises: Exercise[], previous?: Record<string, SetLog[]>): Record<string, SetLog[]> {
  const result: Record<string, SetLog[]> = {};
  for (const exercise of exercises) {
    const previousSets = previous?.[exercise.id] ?? [];
    result[exercise.id] = Array.from({ length: exercise.sets }, (_, index) => ({
      setNumber: index + 1,
      reps: previousSets[index]?.reps ?? 10,
      weight: previousSets[index]?.weight ?? 0,
      isFeeder: previousSets[index]?.isFeeder ?? false,
      completedAt: undefined,
    }));
  }
  return result;
}

export function Workout() {
  const { session, dayType } = useDayType();
  const { addEntry, editEntry, getByType, loading } = useDailyLog();
  const { getWorkoutHistory } = useHistory();
  const workoutSession = session !== 'rest' ? getWorkoutSession(session) : undefined;
  const prepExercises = session !== 'rest' ? MOVEMENT_PREP[session] : undefined;

  const [exerciseSets, setExerciseSets] = useState<Record<string, SetLog[]>>({});
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [workoutStartedAt, setWorkoutStartedAt] = useState<number>(Date.now());
  const [restExercise, setRestExercise] = useState<string>('');
  const [restSecondsLeft, setRestSecondsLeft] = useState(0);
  const [lastSessionSets, setLastSessionSets] = useState<Record<string, SetLog[]>>({});
  const [finishSummary, setFinishSummary] = useState<{ completedSets: number; durationMin: number } | null>(null);

  useEffect(() => {
    if (!workoutSession || loading) return;

    const todaysWorkout = [...getByType('workout')].reverse().find(entry => {
      const payload = entry.payload as WorkoutPayload;
      return payload.sessionType === session;
    });

    if (todaysWorkout) {
      const payload = todaysWorkout.payload as WorkoutPayload;
      const setsMap: Record<string, SetLog[]> = {};
      for (const exercise of payload.exercises) {
        setsMap[exercise.exerciseId] = exercise.sets;
      }
      setExerciseSets(buildInitialExerciseSets(workoutSession.exercises, setsMap));
      setCurrentEntryId(todaysWorkout.id);
      setWorkoutStartedAt((payload.finishedAt ?? todaysWorkout.timestamp) - ((payload.durationMin ?? 0) * 60_000));
      if (payload.finished) {
        const completedSets = payload.exercises.reduce((sum, exercise) => sum + exercise.sets.filter(set => set.completedAt).length, 0);
        setFinishSummary({ completedSets, durationMin: payload.durationMin ?? 0 });
      }
      return;
    }

    setExerciseSets(buildInitialExerciseSets(workoutSession.exercises));
    setCurrentEntryId(`workout-${session}-${new Date().toISOString().split('T')[0]}`);
    setWorkoutStartedAt(Date.now());
    setFinishSummary(null);
  }, [getByType, loading, session, workoutSession]);

  useEffect(() => {
    if (session === 'rest') return;
    getWorkoutHistory(12).then(entries => {
      const previous = [...entries].reverse().find(entry => {
        const payload = entry.payload as WorkoutPayload;
        return payload.sessionType === session && entry.date !== new Date().toISOString().split('T')[0];
      });
      if (!previous) {
        setLastSessionSets({});
        return;
      }
      const payload = previous.payload as WorkoutPayload;
      const map: Record<string, SetLog[]> = {};
      for (const exercise of payload.exercises) {
        map[exercise.exerciseId] = exercise.sets;
      }
      setLastSessionSets(map);
    });
  }, [getWorkoutHistory, session]);

  useEffect(() => {
    if (restSecondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setRestSecondsLeft(value => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [restSecondsLeft]);

  const completedSets = useMemo(() => Object.values(exerciseSets).flat().filter(set => !!set.completedAt).length, [exerciseSets]);
  const totalSets = useMemo(() => Object.values(exerciseSets).flat().length, [exerciseSets]);
  const allPrescribedDone = workoutSession?.exercises.every(exercise => (exerciseSets[exercise.id] ?? []).slice(0, exercise.sets).every(set => !!set.completedAt)) ?? false;

  const saveWorkout = async (finished: boolean) => {
    if (!workoutSession || !currentEntryId) return;
    const exercises: ExerciseLog[] = workoutSession.exercises.map(exercise => ({
      exerciseId: exercise.id,
      sets: exerciseSets[exercise.id] ?? [],
    }));
    const durationMin = Math.max(1, Math.round((Date.now() - workoutStartedAt) / 60_000));
    const payload: WorkoutPayload = {
      sessionType: session,
      exercises,
      finished,
      finishedAt: finished ? Date.now() : undefined,
      durationMin,
    };

    const existing = getByType('workout').find(entry => entry.id === currentEntryId);
    if (existing) {
      await editEntry(existing, payload);
    } else {
      await addEntry('workout', payload, currentEntryId);
    }

    if (finished) {
      setFinishSummary({ completedSets, durationMin });
    }
  };

  const handleSetsChange = (exerciseId: string, sets: SetLog[]) => {
    setExerciseSets(prev => ({ ...prev, [exerciseId]: sets }));
    setFinishSummary(null);
  };

  const handleCompleteSet = (exercise: Exercise) => {
    const seconds = parseRestSeconds(exercise.rest);
    if (seconds > 0) {
      setRestExercise(exercise.label);
      setRestSecondsLeft(seconds);
    }
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

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800 rounded-2xl p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Session progress</p>
          <p className="text-2xl font-bold text-slate-100 mt-2">{completedSets}/{totalSets}</p>
          <p className="text-xs text-slate-500 mt-1">sets complete</p>
        </div>
        <div className="bg-slate-800 rounded-2xl p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Rest timer</p>
          <p className="text-2xl font-bold text-orange-400 mt-2">{restSecondsLeft > 0 ? formatCountdown(restSecondsLeft) : '--:--'}</p>
          <p className="text-xs text-slate-500 mt-1">{restSecondsLeft > 0 ? `For ${restExercise}` : 'Starts when you finish a set'}</p>
        </div>
      </div>

      {restSecondsLeft > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 flex items-center gap-3">
          <PauseCircle size={18} className="text-orange-400" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-orange-300">Rest for {restExercise}</p>
            <p className="text-xs text-orange-200/80">Next working set in {formatCountdown(restSecondsLeft)}</p>
          </div>
          <button onClick={() => setRestSecondsLeft(0)} className="text-xs text-slate-300">Skip</button>
        </div>
      )}

      {prepExercises && prepExercises.length > 0 && <MovementPrepCard exercises={prepExercises} />}

      <div className="bg-slate-700/30 rounded-xl px-3 py-2 text-xs text-slate-500">
        Tempo: 3-1-1-0 | Take feeder sets as needed before your first working set | Rest is already shown exercise by exercise
      </div>

      <div className="space-y-3">
        {workoutSession?.exercises.map(exercise => (
          <ExerciseLogger
            key={exercise.id}
            exercise={exercise}
            sets={exerciseSets[exercise.id] ?? []}
            lastSessionSets={lastSessionSets[exercise.id]?.map(set => ({ reps: set.reps, weight: set.weight }))}
            onChange={sets => handleSetsChange(exercise.id, sets)}
            onCompleteSet={handleCompleteSet}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => saveWorkout(false)}
          className="w-full py-3 rounded-2xl font-semibold text-slate-200 bg-slate-700 active:bg-slate-600 flex items-center justify-center gap-2"
        >
          <PlayCircle size={16} /> Save progress
        </button>
        <button
          onClick={() => saveWorkout(true)}
          className={`w-full py-3 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 ${allPrescribedDone ? 'bg-green-600 active:bg-green-700' : 'bg-orange-500 active:bg-orange-600'}`}
        >
          <CheckCircle2 size={16} /> Finish workout
        </button>
      </div>

      {finishSummary && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 space-y-1">
          <p className="text-sm font-semibold text-green-400">Workout complete</p>
          <p className="text-xs text-slate-300">{finishSummary.completedSets} sets logged in about {finishSummary.durationMin} minutes.</p>
          <button onClick={() => setFinishSummary(null)} className="text-xs text-slate-500 inline-flex items-center gap-1 mt-2">
            <RotateCcw size={12} /> Keep editing if you need to adjust something
          </button>
        </div>
      )}
    </div>
  );
}
