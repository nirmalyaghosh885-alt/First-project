import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TrainerLive from './components/TrainerLive';
import PropScanner from './components/PropScanner';
import LiveArena from './components/LiveArena';
import { UserProfile, PropItem } from './types';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from './lib/utils';

const MOCK_USER: UserProfile = {
  name: "Ishaan Mukherjee",
  readinessScore: 85,
  streak: 12,
  level: 4
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isTrainerOpen, setIsTrainerOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [userProps, setUserProps] = useState<PropItem[]>([]);

  const handleTabChange = (tab: string) => {
    if (tab === 'workout') {
      setIsScannerOpen(false);
      setIsTrainerOpen(true);
    } else if (tab === 'scan') {
      setIsTrainerOpen(false);
      setIsScannerOpen(true);
    } else {
      setActiveTab(tab);
    }
  };

  const handlePropAdded = (prop: PropItem) => {
    setUserProps([...userProps, prop]);
  };

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      
      <main className="flex-1 overflow-y-auto scroll-smooth bg-[radial-gradient(circle_at_top_right,_#111_0%,_#000_100%)]">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Dashboard user={MOCK_USER} onNavigate={handleTabChange} />
            </motion.div>
          )}

          {activeTab === 'arena' && (
            <motion.div
              key="arena"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="h-full"
            >
              <LiveArena />
            </motion.div>
          )}

          {activeTab === 'ranking' && (
            <motion.div
              key="ranking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center"
            >
              <h2 className="text-3xl font-bold mb-4 font-display">Leaderboard</h2>
              <div className="aura-glass max-w-2xl mx-auto rounded-3xl p-8 space-y-4">
                 {[
                   { name: 'Sneha P.', score: 2450, rank: 1 },
                   { name: 'Tanmoy D.', score: 2100, rank: 2 },
                   { name: 'Ishaan (Me)', score: 1850, rank: 3, current: true },
                   { name: 'Amit G.', score: 1400, rank: 4 },
                 ].map((u) => (
                   <div key={u.name} className={cn(
                     "flex items-center justify-between p-4 rounded-xl border",
                     u.current ? "bg-aura-600/10 border-aura-600/30 text-aura-500" : "bg-neutral-900 border-neutral-800 text-neutral-400"
                   )}>
                     <div className="flex items-center gap-4">
                        <span className="font-mono text-xl opacity-50">#{u.rank}</span>
                        <span className="font-bold text-lg text-white">{u.name}</span>
                     </div>
                     <span className="font-mono font-bold">{u.score} XP</span>
                   </div>
                 ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Fullscreen Overlays */}
      <AnimatePresence>
        {isTrainerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="z-[60]"
          >
            <TrainerLive userName={MOCK_USER.name} onClose={() => setIsTrainerOpen(false)} />
          </motion.div>
        )}

        {isScannerOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="z-[100]"
          >
            <PropScanner onPropAdded={handlePropAdded} onClose={() => setIsScannerOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Toast / Notification simulation (AI UI) */}
      <div className="fixed bottom-6 right-6">
         {userProps.length > 0 && (
            <motion.div 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl shadow-2xl flex items-center gap-3"
            >
               <div className="w-10 h-10 bg-aura-600 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-xs">{userProps.length}</span>
               </div>
               <p className="text-sm font-medium">Props Calibrated Added to Plan</p>
            </motion.div>
         )}
      </div>
    </div>
  );
}

