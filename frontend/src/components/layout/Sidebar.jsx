import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Instagram,
  FileText,
  Bot,
  Zap,
  MessageSquare,
  Activity,
  Sliders,
  Settings,
  Sparkles
} from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Instagram', path: '/instagram', icon: Instagram },
    { name: 'Content & Reels', path: '/content', icon: FileText },
    { name: 'Automations', path: '/automations', icon: Bot },
    { name: 'Special Replies', path: '/special-replies', icon: Zap },
    { name: 'DM Inbox', path: '/conversations', icon: MessageSquare },
    { name: 'Activity & Logs', path: '/activity', icon: Activity },
    { name: 'AI Settings', path: '/ai-settings', icon: Sliders },
    { name: 'Account Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 glass-card rounded-none border-r border-y-0 border-l-0 border-slate-800 flex flex-col justify-between h-screen sticky top-0 bg-slate-950/90 z-40">
      <div>
        {/* Brand Logo Header */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-10 h-10 rounded-xl ig-gradient-bg flex items-center justify-center shadow-lg shadow-pink-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              InstaAuto <span className="ig-gradient-text text-xs uppercase px-1.5 py-0.5 rounded bg-pink-500/10 border border-pink-500/20">AI</span>
            </h1>
            <p className="text-[11px] font-medium text-slate-400">Instagram Auto-Reply</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-md shadow-indigo-600/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="p-4 m-4 rounded-xl glass-card border border-slate-800 bg-slate-900/40">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-slate-200">Webhook Live</span>
        </div>
        <p className="text-[11px] text-slate-400">Meta Graph API v19.0</p>
      </div>
    </aside>
  );
};
