import { useState, useEffect } from 'react';
import { Settings2, Download, Upload, Shield, Bell } from 'lucide-react';
import { exportBackup, importBackup } from '../utils/backup';
import { PLAN_VERSION, DEFAULT_TARGETS } from '../data/targets';

export function Settings() {
  const [hydrationMin, setHydrationMin] = useState(DEFAULT_TARGETS.hydrationMinL);
  const [hydrationMax, setHydrationMax] = useState(DEFAULT_TARGETS.hydrationMaxL);
  const [stepGoal, setStepGoal] = useState(DEFAULT_TARGETS.stepGoal);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showBackupReminder, setShowBackupReminder] = useState(false);

  useEffect(() => {
    // Check if backup has ever been created
    const lastBackup = localStorage.getItem('surge_last_backup');
    if (!lastBackup) setShowBackupReminder(true);

    // Load saved targets
    const savedMin = localStorage.getItem('surge_hydration_min');
    const savedMax = localStorage.getItem('surge_hydration_max');
    const savedSteps = localStorage.getItem('surge_step_goal');
    if (savedMin) setHydrationMin(parseFloat(savedMin));
    if (savedMax) setHydrationMax(parseFloat(savedMax));
    if (savedSteps) setStepGoal(parseInt(savedSteps));
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportBackup();
      setShowBackupReminder(false);
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    setImportSuccess(false);
    const result = await importBackup(file);
    if (result.success) {
      setImportSuccess(true);
      setTimeout(() => window.location.reload(), 1500);
    } else {
      setImportError(result.error ?? 'Import failed');
    }
    e.target.value = '';
  };

  const saveTargets = () => {
    localStorage.setItem('surge_hydration_min', String(hydrationMin));
    localStorage.setItem('surge_hydration_max', String(hydrationMax));
    localStorage.setItem('surge_step_goal', String(stepGoal));
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center gap-2">
        <Settings2 size={20} className="text-slate-400" />
        <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
      </div>

      {/* Backup reminder — shown once if no backup created */}
      {showBackupReminder && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex items-start gap-2">
          <Bell size={16} className="text-yellow-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-400">No backup created yet</p>
            <p className="text-xs text-yellow-500/80 mt-0.5">Export your data to keep a safe copy. All data is stored only on this device.</p>
          </div>
          <button onClick={() => setShowBackupReminder(false)} className="text-slate-600 text-xs">Dismiss</button>
        </div>
      )}

      {/* Export / Import */}
      <div className="bg-slate-800 rounded-2xl p-4 space-y-3">
        <h2 className="font-semibold text-slate-200">Data Backup</h2>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 active:bg-orange-600 disabled:opacity-60 text-white py-3 rounded-xl font-medium"
        >
          <Download size={16} />
          {exporting ? 'Exporting…' : 'Export Backup'}
        </button>

        <label className="w-full flex items-center justify-center gap-2 bg-slate-700 active:bg-slate-600 text-slate-200 py-3 rounded-xl font-medium cursor-pointer">
          <Upload size={16} />
          Import Backup
          <input type="file" accept=".json" onChange={handleImport} className="hidden" />
        </label>

        {importError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
            <p className="text-xs text-red-400 font-semibold">Import failed</p>
            <p className="text-xs text-red-500/80 mt-1">{importError}</p>
          </div>
        )}
        {importSuccess && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3">
            <p className="text-xs text-green-400 font-semibold">Import successful — reloading…</p>
          </div>
        )}

        <p className="text-xs text-slate-600">Backup saves all your logs, history and settings as a JSON file. Import is fully validated — existing data is untouched if validation fails.</p>
      </div>

      {/* Plan version */}
      <div className="bg-slate-800 rounded-2xl p-4 space-y-2">
        <h2 className="font-semibold text-slate-200">Plan Version</h2>
        <div className="flex items-center justify-between bg-slate-700/50 rounded-xl px-3 py-2">
          <div>
            <p className="text-sm text-slate-200">{PLAN_VERSION.label}</p>
            <p className="text-xs text-slate-500">Effective: {PLAN_VERSION.effectiveDate}</p>
          </div>
          <span className="text-xs text-slate-600 font-mono">{PLAN_VERSION.id}</span>
        </div>
      </div>

      {/* Adjustable targets */}
      <div className="bg-slate-800 rounded-2xl p-4 space-y-4">
        <h2 className="font-semibold text-slate-200">Targets</h2>
        <p className="text-xs text-slate-500 -mt-2">Defaults from your coach plan. Adjust if needed.</p>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Hydration min (L) — Coach default: 4.5L</label>
            <input
              type="number" step="0.5" min="1" max="10"
              value={hydrationMin}
              onChange={e => setHydrationMin(parseFloat(e.target.value))}
              className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Hydration max (L) — Coach default: 6L</label>
            <input
              type="number" step="0.5" min="1" max="12"
              value={hydrationMax}
              onChange={e => setHydrationMax(parseFloat(e.target.value))}
              className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Daily step goal — Coach default: 8,000</label>
            <input
              type="number" step="500" min="1000" max="30000"
              value={stepGoal}
              onChange={e => setStepGoal(parseInt(e.target.value))}
              className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          onClick={saveTargets}
          className="w-full bg-orange-500 active:bg-orange-600 text-white py-2.5 rounded-xl font-medium text-sm"
        >
          Save Targets
        </button>
      </div>

      {/* Safety note */}
      <div className="bg-slate-800 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-slate-500" />
          <h2 className="text-sm font-medium text-slate-400">Health & Safety</h2>
        </div>
        <p className="text-xs text-slate-600">These targets are from your coach. If you have medical considerations, confirm with a healthcare professional before following any nutrition or exercise plan.</p>
      </div>
    </div>
  );
}
