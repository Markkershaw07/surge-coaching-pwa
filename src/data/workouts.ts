import type { SessionType, WorkoutSession } from '../types';

export const WORKOUT_SESSIONS: WorkoutSession[] = [
  {
    type: 'push',
    exercises: [
      { id: 'push-wu', label: 'Pec Deck Machine', sets: 3, reps: '12-15', rest: '1 min', isWarmUp: true },
      { id: 'push-a', label: 'Smith Machine Incline Press', sets: 2, reps: '8-15', rest: '2 min', notes: 'Active range, control eccentric, biceps at side of chest' },
      { id: 'push-b', label: 'Machine Chest Press Flat', sets: 3, reps: '8-15', rest: '2 min', notes: 'Active range, control eccentric' },
      { id: 'push-c', label: 'Dumbbell Lateral Raises', sets: 3, reps: '8-15', rest: '1 min' },
      { id: 'push-d', label: 'Seated Dips', sets: 2, reps: '8-15', rest: '1 min', notes: 'Elbows strict and tight throughout' },
      { id: 'push-e', label: 'Dual Rope Tricep Extension', sets: 2, reps: '8-15', rest: '1 min' },
      { id: 'push-f', label: 'Dumbbell Skull Crusher', sets: 2, reps: '8-15', rest: '1 min', notes: 'Arm fixed - move only through elbow' },
      { id: 'push-g', label: 'Cable Crunches', sets: 4, reps: '12-15', rest: '0 min', notes: 'Rib cage down, core not arms, lock hips' },
    ],
  },
  {
    type: 'pull',
    exercises: [
      { id: 'pull-wu', label: 'Standing Lat Cable Pull Over', sets: 3, reps: '15', rest: '-', isWarmUp: true, notes: 'Light weight, sub max' },
      { id: 'pull-a', label: 'Single Arm D Handle Lat Pulldown', sets: 3, reps: '8-15', rest: '1 min', notes: 'Drive elbow into lat, short position' },
      { id: 'pull-b', label: 'Seated Row Machine', sets: 3, reps: '8-15', rest: '2 min', notes: '2-count hold in the short, upper back bias' },
      { id: 'pull-c', label: 'Barbell Romanian Deadlift', sets: 2, reps: '8-15', rest: '2 min' },
      { id: 'pull-d', label: 'Lat Pulldown', sets: 3, reps: '8-15', rest: '1 min' },
      { id: 'pull-e', label: 'Rear Delt Fly', sets: 3, reps: '12-15', rest: '1 min' },
      { id: 'pull-f', label: 'Preacher Curl', sets: 3, reps: '8-15', rest: '1 min' },
      { id: 'pull-g', label: 'Dual D-Handle Curl', sets: 3, reps: '8-15', rest: '1 min' },
    ],
  },
  {
    type: 'legs',
    exercises: [
      { id: 'legs-wu', label: 'Stationary Bike', sets: 1, reps: '5 min', rest: '-', isWarmUp: true },
      { id: 'legs-a', label: 'Seated Machine Hip Adductor', sets: 3, reps: '12-15', rest: '1 min', notes: 'Drive knees together' },
      { id: 'legs-b', label: 'Seated Hamstring Curl', sets: 3, reps: '8-15', rest: '2 min' },
      { id: 'legs-c', label: 'Leg Extension', sets: 3, reps: '8-15', rest: '2 min', notes: 'Pull into seat, knee at axis, contract at top' },
      { id: 'legs-d', label: 'Hack Squat', sets: 2, reps: '8-15', rest: '2 min' },
      { id: 'legs-e', label: 'Leg Press Machine (Normal Stance)', sets: 2, reps: '8-15', rest: '2 min', notes: 'Low and narrow foot, quad bias' },
      { id: 'legs-f', label: 'Dumbbell Bulgarian Split Squat', sets: 2, reps: '12-15 + dropset BW', rest: '2 min', notes: 'Rear foot on bench, drive quad and glute' },
      { id: 'legs-g', label: 'Standing Calf Raise', sets: 3, reps: '12-15', rest: '1 min', notes: 'Drive through big toe, max stretch and contraction' },
    ],
  },
  {
    type: 'upper',
    exercises: [
      { id: 'upper-a', label: 'Cable Single Arm Lateral Raise', sets: 2, reps: '12-15', rest: '1 min', notes: 'Cuffed, drive wide, load on medial delts' },
      { id: 'upper-b', label: 'Shoulder Press Machine', sets: 3, reps: '8-15', rest: '1 min', notes: 'Elbows out towards the walls, not just up' },
      { id: 'upper-c', label: 'Pec Deck Machine', sets: 3, reps: '8-15 + dropset', rest: '1 min' },
      { id: 'upper-d', label: 'Machine Chest Press Incline', sets: 2, reps: '8-15', rest: '2 min' },
      { id: 'upper-e', label: 'Dumbbell Single Arm Row', sets: 3, reps: '8-15', rest: '1 min' },
      { id: 'upper-f', label: 'Single Arm Cuffed Tricep Extension', sets: 3, reps: '8-15', rest: '1 min', notes: 'Cross-body grip, shoulder locked down and back' },
      { id: 'upper-g', label: 'Preacher Curl', sets: 3, reps: '8-15', rest: '1 min' },
    ],
  },
];

export function getWorkoutSession(type: SessionType): WorkoutSession | undefined {
  return WORKOUT_SESSIONS.find(s => s.type === type);
}
