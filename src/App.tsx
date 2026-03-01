import { useState } from 'react';
import { Home, Dumbbell, UtensilsCrossed, BarChart2, TrendingUp, Settings2 } from 'lucide-react';
import { Today } from './screens/Today';
import { Workout } from './screens/Workout';
import { Nutrition } from './screens/Nutrition';
import { Tracker } from './screens/Tracker';
import { Progress } from './screens/Progress';
import { Settings } from './screens/Settings';

type Tab = 'today' | 'workout' | 'nutrition' | 'tracker' | 'progress' | 'settings';

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'today', label: 'Today', Icon: Home },
  { id: 'workout', label: 'Workout', Icon: Dumbbell },
  { id: 'nutrition', label: 'Nutrition', Icon: UtensilsCrossed },
  { id: 'tracker', label: 'Tracker', Icon: BarChart2 },
  { id: 'progress', label: 'Progress', Icon: TrendingUp },
  { id: 'settings', label: 'Settings', Icon: Settings2 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('today');

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col max-w-md mx-auto">
      {/* Main content area */}
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-24">
        {activeTab === 'today' && <Today />}
        {activeTab === 'workout' && <Workout />}
        {activeTab === 'nutrition' && <Nutrition />}
        {activeTab === 'tracker' && <Tracker />}
        {activeTab === 'progress' && <Progress />}
        {activeTab === 'settings' && <Settings />}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900/95 backdrop-blur-sm border-t border-slate-800 pb-safe">
        <div className="flex">
          {TABS.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors ${
                  active ? 'text-orange-500' : 'text-slate-500 active:text-slate-300'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
