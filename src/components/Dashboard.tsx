import React from 'react';
import { motion } from 'motion/react';
import { Play, Scan, Users, Zap, Timer, Activity } from 'lucide-react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';

interface DashboardProps {
  user: UserProfile;
  onNavigate: (tab: string) => void;
}

const Dashboard = ({ user, onNavigate }: DashboardProps) => {
  return (
    <div className="p-10 max-w-7xl mx-auto space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 py-4">
        <div className="space-y-2">
          <p className="stat-label mb-2">Welcome back_ {user.name.split(' ')[0]}</p>
          <h1 className="text-5xl md:text-6xl font-bold text-text-main tracking-tighter">
            PRO TRAINING <span className="text-accent">DASHBOARD</span>
          </h1>
        </div>
        <div className="flex bg-surface border border-surface-bright rounded-2xl p-6 gap-10">
          <div className="stat-item">
            <span className="stat-label">Readiness</span>
            <span className="stat-value text-accent">{user.readinessScore}%</span>
          </div>
          <div className="w-px h-full bg-surface-bright" />
          <div className="stat-item">
            <span className="stat-label">Streak</span>
            <span className="stat-value text-accent">{user.streak} Days</span>
          </div>
        </div>
      </div>

      {/* Hero Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.button
          whileHover={{ borderColor: '#D9FF00' }}
          onClick={() => onNavigate('workout')}
          className="group relative h-72 overflow-hidden polish-card p-10 text-left flex flex-col justify-end transition-colors"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Play size={160} fill="currentColor" />
          </div>
          <p className="stat-label mb-2">ACTIVE SESSIONS</p>
          <h3 className="text-3xl font-bold mb-4">Start AI Workout</h3>
          <p className="text-text-dim text-sm max-w-[220px]">Real-time vision metrics and posture correction.</p>
        </motion.button>

        <motion.button
          whileHover={{ borderColor: '#D9FF00' }}
          onClick={() => onNavigate('scan')}
          className="group relative h-72 overflow-hidden polish-card p-10 text-left flex flex-col justify-end transition-colors"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Scan size={160} fill="currentColor" />
          </div>
          <p className="stat-label mb-2">EQUIPMENT CALIBRATION</p>
          <h3 className="text-3xl font-bold mb-4">Prop Scanner</h3>
          <p className="text-text-dim text-sm max-w-[220px]">Measure volumetric weight of household objects.</p>
        </motion.button>

        <motion.button
          whileHover={{ borderColor: '#D9FF00' }}
          onClick={() => onNavigate('arena')}
          className="group relative h-72 overflow-hidden polish-card p-10 text-left flex flex-col justify-end transition-colors"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users size={160} fill="currentColor" />
          </div>
          <p className="stat-label mb-2">SOCIAL SYNC</p>
          <h3 className="text-3xl font-bold mb-4">Live Arena</h3>
          <p className="text-text-dim text-sm max-w-[220px]">Sync training metrics with Kolkata peers.</p>
        </motion.button>
      </div>

      {/* Stats & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="polish-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h4 className="font-bold flex items-center gap-2">
              <Activity className="text-accent" size={18} />
              PERFORMANCE TREND
            </h4>
            <span className="text-[10px] bg-surface-bright px-3 py-1 rounded font-mono text-text-dim uppercase tracking-widest">Live Updates</span>
          </div>
          <div className="flex items-end gap-3 h-48">
            {[45, 80, 60, 95, 30, 85, 70].map((h, i) => (
              <div key={i} className="flex-1 group relative">
                <div 
                  style={{ height: `${h}%` }} 
                  className={cn(
                    "w-full rounded-t-[4px] transition-all duration-500",
                    i === 3 ? "bg-accent" : "bg-surface-bright hover:bg-white/20"
                  )}
                />
                <div className="mt-4 text-center text-[10px] font-mono text-text-dim uppercase">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="font-bold uppercase tracking-widest text-sm text-text-dim">Pending Challenges</h4>
          <div className="polish-card p-6 flex items-center gap-6 group cursor-pointer hover:border-accent/40 transition-colors">
            <div className="w-14 h-14 bg-surface-bright rounded-xl flex items-center justify-center border border-surface-bright group-hover:border-accent transition-colors">
              <Timer size={24} className="text-accent" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">1-Minute Plank Battle</p>
              <p className="text-xs text-text-dim uppercase tracking-wider font-medium">Global Ranking • 4 Competitors</p>
            </div>
            <div className="text-right">
              <p className="text-accent font-mono font-bold">50 XP</p>
              <p className="text-[10px] text-text-dim">BOOST</p>
            </div>
          </div>

          <div className="polish-card p-6 flex items-center gap-6 group cursor-pointer hover:border-accent/40 transition-colors">
            <div className="w-14 h-14 bg-surface-bright rounded-xl flex items-center justify-center border border-surface-bright group-hover:border-accent transition-colors">
              <Zap size={24} className="text-accent" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">Bottle-Row Sprints</p>
              <p className="text-xs text-text-dim uppercase tracking-wider font-medium">Clean 3 sets of 15 • Daily Prop</p>
            </div>
            <div className="text-right">
              <p className="text-accent font-mono font-bold">30 XP</p>
              <p className="text-[10px] text-text-dim">BOOST</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
