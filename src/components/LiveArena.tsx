import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Timer, Heart, Zap, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

interface Friend {
  id: string;
  name: string;
  avatar: string;
  reps: number;
  bpm: number;
  status: 'active' | 'resting';
}

const INITIAL_FRIENDS: Friend[] = [
  { id: '1', name: 'Tanmoy', avatar: 'https://picsum.photos/seed/t/100/100', reps: 12, bpm: 145, status: 'active' },
  { id: '2', name: 'Sneha', avatar: 'https://picsum.photos/seed/s/100/100', reps: 15, bpm: 158, status: 'active' },
  { id: '3', name: 'Amit', avatar: 'https://picsum.photos/seed/a/100/100', reps: 8, bpm: 110, status: 'resting' },
];

const LiveArena = () => {
  const [friends, setFriends] = useState(INITIAL_FRIENDS);
  const [sessionTime, setSessionTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSessionTime(t => t + 1), 1000);
    const activity = setInterval(() => {
      setFriends(prev => prev.map(f => {
        if (f.status === 'active' && Math.random() > 0.7) {
          return { ...f, reps: f.reps + 1, bpm: f.bpm + Math.floor(Math.random() * 5) - 2 };
        }
        return f;
      }));
    }, 2000);

    return () => {
      clearInterval(timer);
      clearInterval(activity);
    };
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10">
      <div className="flex justify-between items-center bg-surface border border-surface-bright rounded-3xl p-8">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center shadow-[0_0_30px_#D9FF0022]">
                <Users className="text-black" size={32} />
            </div>
            <div>
                <h2 className="text-3xl font-bold tracking-tighter uppercase text-text-main">VIRTUAL <span className="text-accent">ARENA</span></h2>
                <p className="text-text-dim text-sm uppercase tracking-widest font-mono">Sync_ Kolkata_ Sprints_04</p>
            </div>
         </div>
         <div className="text-right">
            <p className="stat-label mb-2">Session Time</p>
            <p className="text-4xl font-mono font-black text-text-main">{formatTime(sessionTime)}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* User Card */}
        <div className="bg-bg border-2 border-accent/40 rounded-3xl p-8 shadow-[0_0_40px_rgba(217,255,0,0.05)]">
           <div className="flex justify-between items-start mb-8">
              <div className="w-20 h-20 rounded-2xl bg-surface border border-surface-bright overflow-hidden">
                 <img src="https://picsum.photos/seed/ish/100/100" alt="ME" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>
              <div className="px-3 py-1 bg-accent rounded text-[10px] font-black text-black uppercase tracking-widest">YOU</div>
           </div>
           <h3 className="text-xl font-bold mb-8 text-text-main">Ishaan (Me)</h3>
           <div className="space-y-6 font-mono">
              <div className="flex justify-between items-end">
                 <span className="stat-label">Reps</span>
                 <span className="text-3xl text-text-main leading-none">0</span>
              </div>
              <div className="flex justify-between items-end">
                 <span className="stat-label">BPM</span>
                 <span className="text-3xl text-error flex items-center gap-2 leading-none">92 <Heart size={18} fill="currentColor" /></span>
              </div>
           </div>
        </div>

        {/* Friends Cards */}
        {friends.map((friend) => (
          <motion.div 
            key={friend.id}
            layout
            className="polish-card p-8"
          >
           <div className="flex justify-between items-start mb-8">
              <div className="w-20 h-20 rounded-2xl bg-surface border border-surface-bright overflow-hidden opacity-80">
                 <img src={friend.avatar} alt={friend.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>
              <div className={cn(
                "px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest",
                friend.status === 'active' ? "bg-accent/10 text-accent border border-accent/20" : "bg-surface-bright text-text-dim"
              )}>
                {friend.status}
              </div>
           </div>
           <h3 className="text-xl font-bold mb-8 text-text-main">{friend.name}</h3>
           <div className="space-y-6 font-mono">
              <div className="flex justify-between items-end">
                 <span className="stat-label">Reps</span>
                 <span className="text-3xl text-text-main leading-none">{friend.reps}</span>
              </div>
              <div className="flex justify-between items-end">
                 <span className="stat-label">BPM</span>
                 <span className="text-3xl text-text-dim/60 flex items-center gap-2 leading-none">{friend.bpm} <Heart size={18} fill="currentColor" /></span>
              </div>
           </div>
          </motion.div>
        ))}
      </div>

      {/* Arena Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="polish-card p-8 space-y-8">
            <h4 className="font-bold flex items-center gap-2 text-text-dim uppercase tracking-widest text-sm">
               <ShieldCheck className="text-accent" size={18} />
               NETWORK STATUS
            </h4>
            <div className="space-y-4">
               <div className="p-5 bg-bg border border-surface-bright rounded-2xl flex justify-between items-center">
                  <span className="text-sm text-text-dim uppercase font-bold tracking-tight">Security Layer</span>
                  <span className="text-[10px] font-mono text-accent uppercase font-bold bg-accent/10 px-2 py-1 rounded">AES-256 ACTIVE</span>
               </div>
               <div className="p-5 bg-bg border border-surface-bright rounded-2xl flex justify-between items-center">
                  <span className="text-sm text-text-dim uppercase font-bold tracking-tight">Global Sync</span>
                  <span className="text-[10px] font-mono text-accent uppercase font-bold bg-accent/10 px-2 py-1 rounded">24ms LATENCY</span>
               </div>
            </div>
         </div>

         <div className="polish-card p-8 flex flex-col justify-center items-center text-center">
            <div className="w-20 h-20 bg-accent/5 border border-accent/20 rounded-full flex items-center justify-center text-accent mb-6 shadow-[0_0_30px_#D9FF0011]">
               <Zap size={40} />
            </div>
            <p className="text-2xl font-bold mb-3 uppercase tracking-tighter text-text-main">ARENA SYNC_ READY</p>
            <p className="text-sm text-text-dim max-w-[320px] font-medium leading-relaxed">Your real-time metrics are participating in the Kolkata Sprints leaderboards. Push hard to claim the top spot.</p>
         </div>
      </div>
    </div>
  );
};

export default LiveArena;
