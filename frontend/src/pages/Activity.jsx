import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getActivityLogs } from '../services/activity.api.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Activity, Filter, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ActivityPage = () => {
  const [filter, setFilter] = useState('ALL');

  const logsQuery = useQuery({
    queryKey: ['activityLogs', filter],
    queryFn: async () => {
      const res = await getActivityLogs(filter);
      return res.data.data;
    }
  });

  const logs = logsQuery.data || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Activity & Execution Logs <Activity className="w-6 h-6 text-indigo-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time audit trail of all processed comments, rule triggers, AI generations, and API status codes.
          </p>
        </div>
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => logsQuery.refetch()}>
          Refresh Logs
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {['ALL', 'RULES', 'AI', 'ERRORS'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              filter === f
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Log Table Card */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Incoming Comment / Message</th>
                  <th className="px-6 py-3.5">Response Source</th>
                  <th className="px-6 py-3.5">Generated Reply</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No activity logs found for the selected filter. Events will appear here as incoming webhooks are processed.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-6 py-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(log.createdAt || Date.now()).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-200">@{log.fromUsername || 'user'}</td>
                      <td className="px-6 py-4 max-w-xs truncate text-slate-300">"{log.commentText}"</td>
                      <td className="px-6 py-4">
                        <Badge variant={log.responseType === 'RULE' ? 'warning' : 'info'}>
                          {log.responseType === 'RULE' ? 'Special Rule' : log.responseType === 'AI' ? 'Vercel AI SDK' : 'None'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 max-w-sm truncate text-slate-400 font-sans">
                        {log.generatedReply || (log.error ? <span className="text-red-400 italic">{log.error}</span> : '-')}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={log.status === 'SENT' ? 'success' : 'danger'}>
                          {log.status === 'SENT' ? '● SENT' : '● FAILED'}
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
