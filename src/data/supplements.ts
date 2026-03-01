import type { Supplement } from '../types';

export const SUPPLEMENTS: Supplement[] = [
  { name: 'Omega 3', dose: '2g', timing: 'morning' },
  { name: 'Vitamin D', dose: '25mcg', timing: 'morning' },
  { name: 'Vitamin C', dose: '2g (2 capsules)', timing: 'morning' },
  { name: 'Multivitamin', dose: '1 capsule', timing: 'morning' },
  { name: 'B Vitamin', dose: '1 capsule', timing: 'morning' },
  { name: 'Essential Amino Acids (EAA)', dose: '15g', timing: 'intra' },
  { name: 'Creatine', dose: '5g', timing: 'intra' },
  { name: 'Magnesium', dose: '400–500mg', timing: 'evening' },
  { name: 'Pre-workout', dose: '300ml water or black coffee/white monster', timing: 'preworkout' },
];

export const MORNING_SUPPS = SUPPLEMENTS.filter(s => s.timing === 'morning');
export const INTRA_SUPPS = SUPPLEMENTS.filter(s => s.timing === 'intra');
export const EVENING_SUPPS = SUPPLEMENTS.filter(s => s.timing === 'evening');
export const PREWORKOUT_SUPPS = SUPPLEMENTS.filter(s => s.timing === 'preworkout');
