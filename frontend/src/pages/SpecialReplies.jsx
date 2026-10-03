import React, { useState } from 'react';
import { useSpecialRules } from '../hooks/useSpecialRules.js';
import { useInstagram } from '../hooks/useInstagram.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Switch } from '../components/ui/Switch.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { ConfirmationModal } from '../components/ui/ConfirmationModal.jsx';
import { Zap, Plus, Edit2, Trash2, Tag, Link as LinkIcon, MessageSquare, CornerDownRight } from 'lucide-react';

export const SpecialRepliesPage = () => {
  const { rules, isLoading, createRule, updateRule, deleteRule } = useSpecialRules();
  const { account } = useInstagram();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState('EXACT');
  const [keywordsStr, setKeywordsStr] = useState('');
  const [actionType, setActionType] = useState('BOTH');
  const [commentReply, setCommentReply] = useState('');
  const [dmMessage, setDmMessage] = useState('');
  const [link, setLink] = useState('');
  const [priority, setPriority] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreateModal = () => {
    setEditingRule(null);
    setName('');
    setTriggerType('EXACT');
    setKeywordsStr('');
    setActionType('BOTH');
    setCommentReply('');
    setDmMessage('');
    setLink('');
    setPriority(10);
    setIsModalOpen(true);
  };

  const openEditModal = (rule) => {
    setEditingRule(rule);
    setName(rule.name);
    setTriggerType(rule.triggerType);
    let kw = rule.keywords;
    if (typeof kw === 'string') {
      try { kw = JSON.parse(kw); } catch { kw = [kw]; }
    }
    setKeywordsStr(Array.isArray(kw) ? kw.join(', ') : String(kw));
    setActionType(rule.actionType);
    setCommentReply(rule.commentReply || '');
    setDmMessage(rule.dmMessage || '');
    setLink(rule.link || '');
    setPriority(rule.priority || 1);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!account?.id) {
      alert('Please connect your Instagram Professional account first before creating special rules.');
      return;
    }
    setIsSubmitting(true);
    const keywords = keywordsStr.split(',').map((k) => k.trim()).filter(Boolean);

    const payload = {
      instagramAccountId: account.id,
      name,
      triggerType,
      keywords,
      actionType,
      commentReply,
      dmMessage,
      link,
      priority: parseInt(priority, 10),
      isEnabled: true
    };

    try {
      if (editingRule) {
        await updateRule({ id: editingRule.id, data: payload });
      } else {
        await createRule(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await deleteRule(deleteId);
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Special Keyword Reply Rules <Zap className="w-6 h-6 text-amber-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure priority rules to intercept specific keywords ("price", "link") before generic AI replies.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={openCreateModal}>
          Create Special Rule
        </Button>
      </div>

      {/* Rules Grid */}
      {rules.length === 0 ? (
        <Card className="text-center py-12 px-6 border-dashed border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-200">No Special Rules Configured</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
            Special rules let you intercept specific high-priority keywords (such as "price", "link", "order") and reply with predefined public comments or direct messages.
          </p>
          <Button variant="primary" icon={Plus} onClick={openCreateModal} disabled={!account?.isConnected}>
            Create Your First Rule
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rules.map((rule) => {
            let keywords = rule.keywords;
            if (typeof keywords === 'string') {
              try { keywords = JSON.parse(keywords); } catch { keywords = [keywords]; }
            }
            const kwList = Array.isArray(keywords) ? keywords : [String(keywords)];

            return (
              <Card key={rule.id} className="flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-100">{rule.name}</h3>
                        <p className="text-[11px] text-slate-400">Priority Level: {rule.priority}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={rule.triggerType === 'EXACT' ? 'info' : 'warning'}>
                        {rule.triggerType}
                      </Badge>
                      <Switch
                        checked={rule.isEnabled}
                        onChange={(val) => updateRule({ id: rule.id, data: { isEnabled: val } })}
                      />
                    </div>
                  </div>

                  {/* Keywords Tags */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Trigger Keywords</span>
                    <div className="flex flex-wrap gap-1.5">
                      {kwList.map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-amber-300 flex items-center gap-1">
                          <Tag className="w-3 h-3" /> {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action details */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="font-semibold text-slate-300">Action:</span>
                      <Badge variant="neutral">{rule.actionType}</Badge>
                    </div>
                    {rule.commentReply && (
                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-indigo-400 flex items-center gap-1">
                          <CornerDownRight className="w-3 h-3" /> Public Comment Reply
                        </span>
                        <p className="text-slate-300">"{rule.commentReply}"</p>
                      </div>
                    )}
                    {rule.dmMessage && (
                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-pink-400 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> Private DM Message
                        </span>
                        <p className="text-slate-300">"{rule.dmMessage}"</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800 mt-4">
                  <Button size="sm" variant="ghost" icon={Edit2} onClick={() => openEditModal(rule)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" icon={Trash2} onClick={() => setDeleteId(rule.id)}>
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Form for Create / Edit */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRule ? 'Edit Special Rule' : 'Create Special Reply Rule'}>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="Rule Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Price Request Automation"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Matching Trigger Type
              </label>
              <select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="EXACT">EXACT (Exact Keyword Match)</option>
                <option value="SEMANTIC">SEMANTIC (Similar Intent Match)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Action Type
              </label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="BOTH">BOTH (Comment Reply + DM)</option>
                <option value="COMMENT_REPLY">COMMENT_REPLY Only</option>
                <option value="DM">DM Only</option>
              </select>
            </div>
          </div>

          <Input
            label="Trigger Keywords (Comma separated)"
            value={keywordsStr}
            onChange={(e) => setKeywordsStr(e.target.value)}
            placeholder="price, cost, how much, rate"
            helperText="Matches comments containing any of these keywords."
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Comment Reply Text
            </label>
            <textarea
              rows={2}
              value={commentReply}
              onChange={(e) => setCommentReply(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Sure! I'll send you the details in DM 📩"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Private DM Message
            </label>
            <textarea
              rows={2}
              value={dmMessage}
              onChange={(e) => setDmMessage(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Hey {{username}} 👋 Here is the link: {{link}}"
            />
            <div className="flex flex-wrap gap-1 mt-1">
              {['{{username}}', '{{link}}', '{{product_name}}', '{{post_url}}'].map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => setDmMessage((prev) => prev + ' ' + tag)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-indigo-300"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Target Link URL"
            icon={LinkIcon}
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://example.com/product"
          />

          <Input
            label="Priority (Higher numbers execute first)"
            type="number"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingRule ? 'Save Changes' : 'Create Rule'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Special Rule"
        description="Are you sure you want to delete this special rule? This action cannot be undone."
      />
    </div>
  );
};
