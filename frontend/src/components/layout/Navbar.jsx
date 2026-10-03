import React from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useInstagram } from '../../hooks/useInstagram.js';
import { Button } from '../ui/Button.jsx';
import { Badge } from '../ui/Badge.jsx';
import { LogOut, Instagram, UserCheck } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { account, connectAccount } = useInstagram();

  return (
    <header className="h-16 border-b border-slate-800/80 px-8 flex items-center justify-between sticky top-0 bg-slate-950/80 backdrop-blur-md z-30">
      {/* Account / Connection status pill */}
      <div className="flex items-center gap-3">
        {account?.isConnected ? (
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold">
            <div className="w-5 h-5 rounded-full overflow-hidden ig-gradient-bg p-0.5">
              <img
                src={account.profilePictureUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100'}
                alt={account.username}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <span className="text-slate-200">@{account.username}</span>
            <Badge variant="success">Connected</Badge>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Badge variant="warning">Disconnected</Badge>
            <Button size="sm" variant="instagram" icon={Instagram} onClick={connectAccount}>
              Connect Instagram
            </Button>
          </div>
        )}
      </div>

      {/* User profile dropdown & Logout */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs font-bold text-slate-100">{user?.name || 'Account User'}</p>
          <p className="text-[11px] text-slate-400">{user?.email}</p>
        </div>
        <Button variant="ghost" size="sm" icon={LogOut} onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
};
