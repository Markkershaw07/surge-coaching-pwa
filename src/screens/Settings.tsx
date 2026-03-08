import { useEffect, useMemo, useState } from 'react';
import { Bell, Download, Settings2, Shield, Upload } from 'lucide-react';
import { exportBackup, importBackup } from '../utils/backup';
import { PLAN_VERSION } from '../data/targets';
import { useAppSettings } from '../hooks/useAppSettings';

export function Settings() {
  const { settings, saveSettings, requestNotificationPermission } = useAppSettings();
  const [draft, setDraft] = useState(settings);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showBackupReminder, setShowBackupReminder] = useState(() => !localStorage.getItem('surge_last_backup'));
  const notificationSupported = useMemo(() => typeof Notification !== 'undefined', []);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportBackup();
      setShowBackupReminder(false);
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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
    event.target.value = '';
  };

  const saveAllSettings = () => {
    saveSettings(draft);
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center gap-2">
        <Settings2 size={20} className="text-slate-400" />
        <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
      </div>

      {showBackupReminder && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex items-start gap-2">
          <Bell size={16} className="text-yellow-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-400">No backup created yet</p>
            <p className="text-xs text-yellow-500/80 mt-0.5">Export your data so you always have a safe copy of your plan and logs.</p>
          </div>
          <button onClick={() => setShowBackupReminder(false)} className="text-slate-600 text-xs">Dismiss</button>
        </div>
      )}

      <div className="bg-slate-800 rounded-2xl p-4 space-y-3">
        <h2 className="font-semibold text-slate-200">Data backup</h2>
        <button onClick={handleExport} disabled={exporting} className="w-full flex items-center justify-center gap-2 bg-orange-500 active:bg-orange-600 disabled:opacity-60 text-white py-3 rounded-xl font-medium">
          <Download size={16} />
          {exporting ? 'Exporting...' : 'Export backup'}
        </button>
        <label className="w-full flex items-center justify-center gap-2 bg-slate-700 active:bg-slate-600 text-slate-200 py-3 rounded-xl font-medium cursor-pointer">
          <Upload size={16} />
          Import backup
          <input type="file" accept=".json" onChange={handleImport} className="hidden" />
        </label>
        {importError && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-300">{importError}</div>}
        {importSuccess && <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-xs text-green-300">Import successful. Reloading...</div>}
      </div>

      <div className="bg-slate-800 rounded-2xl p-4 space-y-4">
        <h2 className="font-semibold text-slate-200">Targets</h2>
        <div>
          <label className="text-xs text-slate-500 block mb-1">Hydration minimum (L)</label>
          <input type="number" step="0.5" min="1" max="10" value={draft.hydrationMinL} onChange={e => setDraft(prev => ({ ...prev, hydrationMinL: parseFloat(e.target.value) || 0 }))} className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">Hydration maximum (L)</label>
          <input type="number" step="0.5" min="1" max="12" value={draft.hydrationMaxL} onChange={e => setDraft(prev => ({ ...prev, hydrationMaxL: parseFloat(e.target.value) || 0 }))} className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">Daily step goal</label>
          <input type="number" step="500" min="1000" max="30000" value={draft.stepGoal} onChange={e => setDraft(prev => ({ ...prev, stepGoal: parseInt(e.target.value, 10) || 0 }))} className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-200">Reminders</h2>
          <button onClick={() => requestNotificationPermission()} disabled={!notificationSupported} className="text-xs text-orange-400 disabled:text-slate-600">
            {notificationSupported ? `Notifications: ${settings.reminders.browserNotifications ? 'On' : 'Off'}` : 'Not supported'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['mealReminders', 'Meal reminders'],
            ['taskReminders', 'Task reminders'],
            ['hydrationReminders', 'Hydration nudges'],
            ['stepsReminders', 'Step nudges'],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setDraft(prev => ({ ...prev, reminders: { ...prev.reminders, [key]: !prev.reminders[key as keyof typeof prev.reminders] } }))}
              className={`rounded-xl px-3 py-2 ${draft.reminders[key as keyof typeof draft.reminders] ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-400'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Wake reminder</label>
            <input type="time" value={draft.reminders.wakeTime} onChange={e => setDraft(prev => ({ ...prev, reminders: { ...prev.reminders, wakeTime: e.target.value } }))} className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Workout reminder</label>
            <input type="time" value={draft.reminders.workoutTime} onChange={e => setDraft(prev => ({ ...prev, reminders: { ...prev.reminders, workoutTime: e.target.value } }))} className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Evening reminder</label>
            <input type="time" value={draft.reminders.eveningTime} onChange={e => setDraft(prev => ({ ...prev, reminders: { ...prev.reminders, eveningTime: e.target.value } }))} className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Meal gap (min)</label>
            <input type="number" min="60" step="15" value={draft.reminders.mealGapMin} onChange={e => setDraft(prev => ({ ...prev, reminders: { ...prev.reminders, mealGapMin: parseInt(e.target.value, 10) || 0 } }))} className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Quiet hours start</label>
            <input type="time" value={draft.reminders.quietHoursStart} onChange={e => setDraft(prev => ({ ...prev, reminders: { ...prev.reminders, quietHoursStart: e.target.value } }))} className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Quiet hours end</label>
            <input type="time" value={draft.reminders.quietHoursEnd} onChange={e => setDraft(prev => ({ ...prev, reminders: { ...prev.reminders, quietHoursEnd: e.target.value } }))} className="w-full bg-slate-700 text-slate-100 rounded-xl px-3 py-2 text-sm" />
          </div>
        </div>
        <p className="text-xs text-slate-500">Notifications currently work as local browser or installed PWA reminders on this device. Full closed-app push delivery will need a backend send service.</p>
      </div>

      <button onClick={saveAllSettings} className="w-full bg-orange-500 active:bg-orange-600 text-white py-3 rounded-xl font-medium">Save settings</button>

      <div className="bg-slate-800 rounded-2xl p-4 space-y-2">
        <h2 className="font-semibold text-slate-200">Plan version</h2>
        <div className="flex items-center justify-between bg-slate-700/50 rounded-xl px-3 py-2">
          <div>
            <p className="text-sm text-slate-200">{PLAN_VERSION.label}</p>
            <p className="text-xs text-slate-500">Effective: {PLAN_VERSION.effectiveDate}</p>
          </div>
          <span className="text-xs text-slate-600 font-mono">{PLAN_VERSION.id}</span>
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-slate-500" />
          <h2 className="text-sm font-medium text-slate-400">Health and safety</h2>
        </div>
        <p className="text-xs text-slate-600">These targets come from your coach. If anything feels off or you have medical concerns, adjust with guidance from a professional.</p>
      </div>
    </div>
  );
}
