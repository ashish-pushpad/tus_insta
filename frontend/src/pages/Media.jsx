import React from 'react';
import { useInstagram } from '../hooks/useInstagram.js';
import { useAutomation } from '../hooks/useAutomation.js';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Switch } from '../components/ui/Switch.jsx';
import { Film, Image, Layers, ExternalLink, Bot, MessageSquare } from 'lucide-react';

export const MediaPage = () => {
  const { media, isLoading } = useInstagram();
  const { toggleAutomation } = useAutomation();

  const getMediaIcon = (type) => {
    switch (type) {
      case 'REEL':
      case 'VIDEO':
        return <Film className="w-4 h-4 text-pink-400" />;
      case 'CAROUSEL_ALBUM':
        return <Layers className="w-4 h-4 text-indigo-400" />;
      default:
        return <Image className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Instagram Content & Reels</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure per-post and per-reel AI comment and DM automation toggles.
        </p>
      </div>

      {media.length === 0 ? (
        <Card className="text-center py-16 px-6 border-dashed border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Film className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-200">No Instagram Media Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            Once your connected Instagram Professional account publishes posts, reels, or carousels, they will appear here to configure per-post automation.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {media.map((item) => (
            <Card key={item.id} className="p-0 overflow-hidden flex flex-col justify-between">
              <div>
                {/* Media Thumbnail */}
                <div className="relative aspect-video w-full bg-slate-900 overflow-hidden flex items-center justify-center">
                  {item.mediaUrl ? (
                    <img
                      src={item.mediaUrl}
                      alt={item.caption || 'Instagram media'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      {getMediaIcon(item.mediaType)}
                      <span className="text-[11px] mt-1">{item.mediaType}</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge variant="neutral" className="bg-slate-950/80 backdrop-blur-md border-slate-700 flex items-center gap-1.5">
                      {getMediaIcon(item.mediaType)}
                      <span className="text-[10px] font-bold">{item.mediaType}</span>
                    </Badge>
                  </div>
                  {item.permalink && (
                    <a
                      href={item.permalink}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute top-3 right-3 p-2 rounded-xl bg-slate-950/80 text-slate-300 hover:text-white backdrop-blur-md transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Caption */}
                <div className="p-4 space-y-3">
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {item.caption || 'No caption available'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Published: {new Date(item.timestamp || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Automation Controls */}
              <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-indigo-400" /> AI Comment Reply
                  </span>
                  <Switch
                    checked={item.aiCommentReplyEnabled}
                    onChange={(val) => toggleAutomation({ mediaId: item.mediaId, aiCommentReplyEnabled: val })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-pink-400" /> AI DM Automation
                  </span>
                  <Switch
                    checked={item.aiDmReplyEnabled}
                    onChange={(val) => toggleAutomation({ mediaId: item.mediaId, aiDmReplyEnabled: val })}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
