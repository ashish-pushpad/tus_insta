import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getActivityLogs } from '../services/activity.api.js';
import { useInstagram } from '../hooks/useInstagram.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Instagram, MessageSquare, Bot, Zap, ArrowRight, Activity, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { account, connectAccount } = useInstagram();

  const statsQuery = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await getDashboardStats();
      return res.data?.data || res.data;
    }
  });

  const logsQuery = useQuery({
    queryKey: ['recentActivityLogs'],
    queryFn: async () => {
      const res = await getActivityLogs('ALL');
      return res.data?.data || [];
    }
  });

  const stats = statsQuery.data?.todayActivity || { commentsReplied: 0, dmsReplied: 0, rulesTriggered: 0 };
  const recentLogs = Array.isArray(logsQuery.data) ? logsQuery.data : [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Instagram AI Assistant <Sparkles className="w-5 h-5 text-indigo-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated comment replies, private DMs, and special keyword rule executions.
          </p>
        </div>
        {!account?.isConnected && (
          <Button variant="instagram" icon={Instagram} onClick={connectAccount}>
            Connect Account
          </Button>
        )}
      </div>

      {/* Overview Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-indigo-500/20 bg-indigo-950/20">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400">
              <Instagram className="w-5 h-5" />
            </div>
            <Badge variant={account?.isConnected ? 'success' : 'warning'}>
              {account?.isConnected ? '● Connected' : '● Action Required'}
            </Badge>
          </div>
          <CardTitle className="text-base font-bold">Instagram Account</CardTitle>
          <CardDescription className="text-xs">
            {account?.isConnected ? `@${account.username}` : 'No account connected'}
          </CardDescription>
        </Card>

        <Card className="border-pink-500/20 bg-pink-950/20">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-pink-600/20 flex items-center justify-center text-pink-400">
              <Bot className="w-5 h-5" />
            </div>
            <Badge variant="success">● Active</Badge>
          </div>
          <CardTitle className="text-base font-bold">Comment AI Agent</CardTitle>
          <CardDescription className="text-xs">Friendly engagement & automated post replies</CardDescription>
        </Card>

        <Card className="border-emerald-500/20 bg-emerald-950/20">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <Badge variant="success">● Active</Badge>
          </div>
          <CardTitle className="text-base font-bold">DM Automation AI</CardTitle>
          <CardDescription className="text-xs">Direct message assistant & Private Replies</CardDescription>
        </Card>
      </div>

      {/* Today's Activity Stats Counter */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Today's Activity</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="bg-slate-900/60 border-slate-800">
            <p className="text-xs font-semibold text-slate-400">Comments Replied</p>
            <p className="text-3xl font-extrabold text-indigo-400 mt-2">{stats.commentsReplied}</p>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Live auto-replies
            </p>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800">
            <p className="text-xs font-semibold text-slate-400">DMs Replied</p>
            <p className="text-3xl font-extrabold text-pink-400 mt-2">{stats.dmsReplied}</p>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Automated inbox
            </p>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800">
            <p className="text-xs font-semibold text-slate-400">Special Rules Triggered</p>
            <p className="text-3xl font-extrabold text-emerald-400 mt-2">{stats.rulesTriggered}</p>
            <p className="text-[11px] text-slate-400 mt-1">Priority rule matches</p>
          </Card>
        </div>
      </div>

      {/* Recent Activity Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" /> Recent Activity
            </CardTitle>
            <CardDescription>Latest automated comments and DMs processed by AI & Rules</CardDescription>
          </div>
          <Link to="/activity">
            <Button variant="ghost" size="sm" icon={ArrowRight}>
              View All Logs
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Comment / Message</th>
                  <th className="px-4 py-3">Source / Rule</th>
                  <th className="px-4 py-3">Generated Action</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No automated activity yet. Webhook events from comments and DMs will appear here in real-time.
                    </td>
                  </tr>
                ) : (
                  recentLogs.slice(0, 5).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-200">@{log.fromUsername || 'user'}</td>
                      <td className="px-4 py-3 max-w-xs truncate text-slate-300">"{log.commentText}"</td>
                      <td className="px-4 py-3">
                        <Badge variant={log.responseType === 'RULE' ? 'warning' : 'info'}>
                          {log.responseType === 'RULE' ? 'Special Rule' : 'AI Agent'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate text-slate-400">{log.generatedReply || '-'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={log.status === 'SENT' ? 'success' : 'danger'}>
                          {log.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
