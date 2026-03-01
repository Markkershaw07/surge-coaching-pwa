import type { MovementPrepExercise, SessionType } from '../types';

export const MOVEMENT_PREP: Partial<Record<SessionType, MovementPrepExercise[]>> = {
  push: [
    { name: 'Threading the needle', detail: '30s/side or 2×6–8' },
    { name: 'Wall slides', detail: '2×10' },
    { name: 'Sub-scapularis release', detail: '3×5s' },
    { name: 'Isometric wall push-up+', detail: 'Up to 2 min' },
    { name: 'Thoracic extension', detail: '1×6–8' },
  ],
  pull: [
    { name: 'Thoracic extension', detail: '1×6–8' },
    { name: 'Scapula pull-ups', detail: '2×10' },
    { name: 'Shoulder lift-offs', detail: '2×10' },
    { name: 'Resisted uppercut', detail: '2×6' },
  ],
  legs: [
    { name: 'Cat/camel', detail: '1×6–8' },
    { name: 'ATG weighted mobility', detail: '2×10' },
    { name: 'Hip distraction and floss', detail: '1×30–60s/side' },
    { name: 'Couch stretch', detail: 'Up to 2 min post-training/side' },
  ],
};
