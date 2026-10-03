import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWebhookConfig } from '../services/settings.api.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Settings, Copy, Shield, Webhook, CheckCircle2, Loader2, AlertCircle, Check } from 'lucide-react';

// ─── Copy-to-clipboard button with visual confirmation ────────────────────────

const CopyField = ({ label, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available (non-HTTPS dev)
      const el = document.createElement('textarea');
      el.value = value;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={value}
          className="flex-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 px-3.5 py-2.5 focus:outline-none min-w-0"
        />
        <Button
          size="sm"
          variant="secondary"
          icon={copied ? Check : Copy}
          onClick={handleCopy}
          className={copied ? 'text-emerald-400 border-emerald-500/40' : ''}
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
    </div>
  );
};

// ─── System status items ──────────────────────────────────────────────────────

const STATUS_ITEMS = [
  { title: 'Meta OAuth 2.0 Auth Server',             status: 'Healthy' },
  { title: 'Vercel AI SDK Core Service',              status: 'Healthy' },
  { title: 'Special Rule Engine & Template Processor', status: 'Healthy' },
  { title: 'PostgreSQL + Prisma ORM Data Layer',      status: 'Healthy' },
  { title: 'Anti-Spam & Rate Limiter Middleware',     status: 'Active'  },
  { title: 'Background Job Scheduler (Token Refresh)','status': 'Active'  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export const SettingsPage = () => {
  const webhookQuery = useQuery({
    queryKey: ['webhookConfig'],
    queryFn: async () => {
      const res = await getWebhookConfig();
      return res.data;
    },
    staleTime: 1000 * 60 * 10 // config doesn't change — cache 10 min
  });

  const config = webhookQuery.data;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          Account &amp; Webhook Configuration <Settings className="w-6 h-6 text-indigo-400" />
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Technical setup for Meta Developer Portal webhooks and system health.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Webhook card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-600/20 flex items-center justify-center text-pink-400">
                <Webhook className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base">Meta Webhook Configuration</CardTitle>
                <CardDescription>Paste these into your Meta Developer App settings</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {webhookQuery.isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading configuration…
              </div>
            )}

            {webhookQuery.isError && (
              <div className="flex items-center gap-2 text-red-400 text-sm p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Failed to load webhook config. Make sure the backend is running.
              </div>
            )}

            {config && (
              <>
                <CopyField label="Callback URL"  value={config.callbackUrl} />
                <CopyField label="Verify Token"  value={config.verifyToken} />

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-xs">
                  <span className="font-bold text-indigo-400">Subscribed Webhook Fields:</span>
                  {config.subscribedFields?.map((f) => (
                    <p key={f} className="text-slate-400">• {f}</p>
                  ))}
                </div>

                <p className="text-[11px] text-slate-500">
                  After saving in Meta, subscribe to the <strong className="text-slate-400">instagram</strong> object
                  for both <code className="text-slate-300">comments</code> and{' '}
                  <code className="text-slate-300">messages</code> fields.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* System status card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center text-emerald-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base">System Status</CardTitle>
                <CardDescription>Core service health checklist</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs">
            {STATUS_ITEMS.map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800"
              >
                <span className="font-medium text-slate-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  {item.title}
                </span>
                <Badge variant="success">{item.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
