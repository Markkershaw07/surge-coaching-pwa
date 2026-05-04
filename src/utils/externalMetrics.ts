export interface ExternalMetricsProvider {
  id: string;
  label: string;
  status: 'manual-only' | 'planned';
  supports: Array<'steps' | 'weight' | 'cardio' | 'hydration'>;
  notes: string;
}

export const EXTERNAL_METRICS_PROVIDERS: ExternalMetricsProvider[] = [
  {
    id: 'manual',
    label: 'Manual logging',
    status: 'manual-only',
    supports: ['steps', 'weight', 'cardio', 'hydration'],
    notes: 'Current app flow. Entries are logged directly in the app.',
  },
  {
    id: 'apple-health',
    label: 'Apple Health',
    status: 'planned',
    supports: ['steps', 'weight', 'cardio'],
    notes: 'Future option if the app moves to a native wrapper or native app shell.',
  },
  {
    id: 'google-fit',
    label: 'Google Fit',
    status: 'planned',
    supports: ['steps', 'weight', 'cardio'],
    notes: 'Planned behind the same provider abstraction, not available in this web release.',
  },
];
