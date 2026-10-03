import React from 'react';
import { useAutomation } from '../hooks/useAutomation.js';
import { useInstagram } from '../hooks/useInstagram.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.jsx';
import { Switch } from '../components/ui/Switch.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Bot, MessageSquare, ShieldAlert, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

// ─── Per-media automation row ─────────────────────────────────────────────────

const MediaAutomationRow = ({ item, onToggleComment, onToggleDm, isToggling }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
    <div className="flex items-center gap-3 min-w-0">
      {item.mediaUrl ? (
        <img
          src={item.mediaUrl}
          alt="media thumbnail"
          className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-slate-800"
        />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-slate-800 flex-shrink-0 flex items-center justify-center text-slate-500 text-[10px]">
          {item.mediaType?.slice(0, 3) || '—'}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate max-w-[220px]">
          {item.caption ? item.caption.slice(0, 60) + (item.caption.length > 60 ? '…' : '') : 'No caption'}
        </p>
        <p className="text-[11px] text-slate-500">{item.mediaType} · {item.mediaId?.slice(-8)}</p>
      </div>
    </div>
    <div className="flex items-center gap-4 flex-shrink-0">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Bot className="w-3.5 h-3.5 text-indigo-400" />
        <span>AI Comments</span>
        <Switch
          checked={item.aiCommentReplyEnabled}
          onChange={(val) => onToggleComment(item.mediaId, val)}
          disabled={isToggling}
        />
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <MessageSquare className="w-3.5 h-3.5 text-pink-400" />
        <span>AI DMs</span>
        <Switch
          checked={item.aiDmReplyEnabled}
          onChange={(val) => onToggleDm(item.mediaId, val)}
          disabled={isToggling}
        />
      </div>
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export const AutomationsPage = () => {
  const { automations, isLoading, toggleAutomation, isToggling } = useAutomation();
  const { account } = useInstagram();

  const handleToggle = (mediaId, field, value) => {
    toggleAutomation({ mediaId, [field]: value }).catch((err) => {
      console.error('Failed to update automation:', err.message);
    });
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 gap-3">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading automation settings…</span>
      </div>
    );
  }

  // ── No account connected ──────────────────────────────────────────────────
  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-slate-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-200">No Instagram Account Connected</h2>
        <p className="text-sm text-slate-400 max-w-sm">
          Connect your Instagram Professional account first to manage per-post automation settings.
        </p>
      </div>
    );
  }

  // ── Active / inactive counts ──────────────────────────────────────────────
  const commentActiveCount = automations.filter((m) => m.aiCommentReplyEnabled).length;
  const dmActiveCount      = automations.filter((m) => m.aiDmReplyEnabled).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          Automation Controls <Bot className="w-6 h-6 text-indigo-400" />
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Enable or disable AI auto-reply per post or reel. Changes are saved immediately.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-white">{commentActiveCount}</p>
              <p className="text-xs text-slate-400">Posts with AI Comment Reply ON</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-pink-600/20 flex items-center justify-center text-pink-400 flex-shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-white">{dmActiveCount}</p>
              <p className="text-xs text-slate-400">Posts with AI DM Reply ON</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-emerald-950/10">
          <CardContent className="pt-5 pb-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <Badge variant="success" className="mb-1">Active</Badge>
              <p className="text-xs text-slate-400">Anti-spam &amp; duplicate suppression</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-media list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Per-Post Automation Settings</CardTitle>
              <CardDescription>
                {automations.length === 0
                  ? 'No media found — fetch your posts from the Instagram page first.'
                  : `${automations.length} post${automations.length !== 1 ? 's' : ''} · toggles save instantly`}
              </CardDescription>
            </div>
            {isToggling && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Saving…
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-2.5">
          {automations.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">
              No posts available. Go to the Instagram page and load your media first.
            </p>
          ) : (
            automations.map((item) => (
              <MediaAutomationRow
                key={item.id}
                item={item}
                isToggling={isToggling}
                onToggleComment={(mediaId, val) =>
                  handleToggle(mediaId, 'aiCommentReplyEnabled', val)
                }
                onToggleDm={(mediaId, val) =>
                  handleToggle(mediaId, 'aiDmReplyEnabled', val)
                }
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
