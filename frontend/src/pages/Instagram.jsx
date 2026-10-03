import React from 'react';
import { useInstagram } from '../hooks/useInstagram.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Instagram, ShieldCheck, Key, RefreshCw, CheckCircle2 } from 'lucide-react';

export const InstagramPage = () => {
  const { account, isLoading, connectAccount } = useInstagram();

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          Instagram Account Integration <Instagram className="w-6 h-6 text-pink-500" />
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage official Meta OAuth credentials and Instagram Professional account status.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Connected Instagram Professional Account</CardTitle>
            <CardDescription>Official Meta Graph API v19.0 Integration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {account?.isConnected ? (
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                {account.profilePictureUrl ? (
                  <img
                    src={account.profilePictureUrl}
                    alt={account.username}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-pink-500/50 shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl ig-gradient-bg flex items-center justify-center text-white text-xl font-bold shadow-lg border-2 border-pink-500/50">
                    {account.username?.[0]?.toUpperCase() || 'IG'}
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-100">{account.name}</h3>
                    <Badge variant="success">● Connected</Badge>
                  </div>
                  <p className="text-xs font-semibold text-pink-400">@{account.username}</p>
                  <p className="text-[11px] text-slate-500">Instagram User ID: {account.instagramUserId}</p>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 border-2 border-dashed border-slate-800 rounded-2xl space-y-4">
                <Instagram className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No Instagram Professional Account Linked</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Connect your Instagram Creator or Business account via Meta OAuth dialog to enable AI auto-replies.
                </p>
                <Button variant="instagram" icon={Instagram} onClick={connectAccount}>
                  Connect Instagram via Meta OAuth
                </Button>
              </div>
            )}

            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Granted Meta Permissions</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  'instagram_basic',
                  'instagram_manage_comments',
                  'instagram_manage_messages',
                  'pages_read_engagement',
                  'pages_show_list'
                ].map((scope) => (
                  <div key={scope} className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-mono text-[11px] text-slate-300">{scope}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Security & Token Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Token Type</span>
              <p className="font-semibold text-slate-200">Long-Lived Page Access Token</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Token Expiration</span>
              <p className="font-semibold text-emerald-400">Valid (Auto-Refreshed 60 Days)</p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 space-y-1">
              <ShieldCheck className="w-5 h-5 text-indigo-400 mb-1" />
              <p className="font-semibold">Server-Side Storage</p>
              <p className="text-[11px] text-indigo-300/80">
                Access tokens are stored strictly server-side and never exposed to client browsers.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
