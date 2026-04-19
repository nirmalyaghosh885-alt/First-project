import React from 'react';
import { Home, Scan, Play, Users, Trophy, Settings, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const menuItems = [
    { id: 'home', icon: Home, label: 'Aura Home' },
    { id: 'workout', icon: Play, label: 'AI Workout' },
    { id: 'scan', icon: Scan, label: 'Prop Scanner' },
    { id: 'arena', icon: Users, label: 'Virtual Arena' },
    { id: 'ranking', icon: Trophy, label: 'Leaderboard' },
  ];

  return (
    <aside className="w-20 md:w-64 h-full bg-bg border-r border-surface-bright flex flex-col p-6">
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="logo-pill">AURA</div>
        <span className="hidden md:block font-bold text-sm tracking-tight text-text-main">GYM AI</span>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "w-full flex items-center gap-4 p-3 rounded-lg transition-all duration-200 group",
              activeTab === item.id 
                ? "bg-accent/10 border border-accent/20 text-accent" 
                : "text-text-dim hover:bg-surface-bright/50 hover:text-text-main"
            )}
          >
            <item.icon className={cn("shrink-0 size-5", activeTab === item.id ? "text-accent" : "text-text-dim group-hover:text-text-main")} />
            <span className="hidden md:block font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-2 pt-6 border-t border-surface-bright">
        <button className="w-full flex items-center gap-4 p-3 rounded-lg text-text-dim hover:bg-surface-bright/50 hover:text-text-main transition-colors">
          <Settings className="shrink-0 size-5" />
          <span className="hidden md:block font-medium text-sm">Settings</span>
        </button>
        <button className="w-full flex items-center gap-4 p-3 rounded-lg text-text-dim hover:bg-error/10 hover:text-error transition-colors">
          <LogOut className="shrink-0 size-5" />
          <span className="hidden md:block font-medium text-sm">Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
