import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getConversations, getConversationMessages } from '../services/conversations.api.js';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { MessageSquare, User, Bot, Send } from 'lucide-react';

export const ConversationsPage = () => {
  const [selectedId, setSelectedId] = useState(null);

  const convQuery = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await getConversations();
      return res.data?.data || [];
    }
  });

  const conversations = convQuery.data || [];
  const activeId = selectedId || (conversations.length > 0 ? conversations[0].id : null);

  const msgQuery = useQuery({
    queryKey: ['messages', activeId],
    queryFn: async () => {
      const res = await getConversationMessages(activeId);
      return res.data?.data;
    },
    enabled: !!activeId
  });

  const activeConversation = conversations.find((c) => c.id === activeId) || msgQuery.data?.conversation;
  const messages = msgQuery.data?.messages || (Array.isArray(msgQuery.data) ? msgQuery.data : []);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          Instagram DM Inbox <MessageSquare className="w-6 h-6 text-pink-400" />
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review customer conversation threads and automated AI direct message responses.
        </p>
      </div>

      {conversations.length === 0 ? (
        <Card className="text-center py-16 px-6 border-dashed border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-200">No Instagram Conversations Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            When users send direct messages to your connected Instagram account, conversations and automated AI replies will be tracked here in real-time.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[650px]">
          {/* Conversation List Sidebar */}
          <Card className="p-4 flex flex-col overflow-y-auto divide-y divide-slate-800/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-2">Conversations</h3>
            {conversations.map((conv) => {
              const isSelected = conv.id === activeId;
              const lastMsg = conv.messages?.[0];

              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    isSelected ? 'bg-indigo-600/20 border border-indigo-500/30' : 'hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" /> @{conv.participantUsername || 'user'}
                    </span>
                    <Badge variant="success" className="text-[9px]">
                      Active
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {lastMsg ? `"${lastMsg.content}"` : 'No messages yet'}
                  </p>
                </div>
              );
            })}
          </Card>

          {/* Message Bubble History Area */}
          <Card className="md:col-span-2 p-6 flex flex-col justify-between h-full bg-slate-950/60">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full ig-gradient-bg flex items-center justify-center text-white text-xs font-bold">
                  IG
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">
                    @{activeConversation?.participantUsername || 'User'}
                  </h3>
                  <p className="text-[10px] text-slate-500">Instagram Messaging API Thread</p>
                </div>
              </div>
              <Badge variant="info">AI Auto-Reply On</Badge>
            </div>

            {/* Messages Scroll View */}
            <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-2">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                  No message history for this conversation yet.
                </div>
              ) : (
                messages.map((msg) => {
                  const isAi = msg.senderType === 'AI' || msg.senderType === 'RULE';
                  return (
                    <div key={msg.id} className={`flex items-start gap-2.5 ${isAi ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        isAi ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>
                      <div className={`max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isAi
                          ? 'bg-indigo-600/90 text-white rounded-tr-none shadow-lg shadow-indigo-600/20'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}>
                        <p>{msg.content}</p>
                        <span className="block text-[9px] opacity-70 mt-1 text-right">
                          {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Read-only status info bar */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Bot className="w-4 h-4 text-indigo-400" />
              <span>AI Automated Response Engine actively monitoring incoming messages.</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
