import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAISettings, updateAISettings } from '../services/ai.api.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Switch } from '../components/ui/Switch.jsx';
import { Toast } from '../components/ui/Toast.jsx';
import { Sliders, Sparkles, Save, CheckCircle2 } from 'lucide-react';

export const AISettingsPage = () => {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState('');

  const settingsQuery = useQuery({
    queryKey: ['aiSettings'],
    queryFn: async () => {
      const res = await getAISettings();
      return res.data;
    }
  });

  const [enabled, setEnabled] = useState(true);
  const [replyStyle, setReplyStyle] = useState('friendly');
  const [tone, setTone] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [businessInstructions, setBusinessInstructions] = useState('');
  const [maxResponseLength, setMaxResponseLength] = useState(150);
  const [customInstructions, setCustomInstructions] = useState('');

  useEffect(() => {
    if (settingsQuery.data) {
      const d = settingsQuery.data?.data || settingsQuery.data;
      setEnabled(d.enabled ?? true);
      setReplyStyle(d.replyStyle || 'friendly');
      setTone(d.tone || '');
      setBusinessDescription(d.businessDescription || '');
      setBusinessInstructions(d.businessInstructions || '');
      setMaxResponseLength(d.maxResponseLength || 150);
      setCustomInstructions(d.customInstructions || '');
    }
  }, [settingsQuery.data]);

  const updateMutation = useMutation({
    mutationFn: (data) => updateAISettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiSettings'] });
      setToast('AI configuration saved successfully!');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      enabled,
      replyStyle,
      tone,
      businessDescription,
      businessInstructions,
      maxResponseLength: parseInt(maxResponseLength, 10),
      customInstructions
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {toast && <Toast message={toast} type="success" onClose={() => setToast('')} />}

      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          AI Agent Persona & Tone Settings <Sliders className="w-6 h-6 text-indigo-400" />
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Tune your Vercel AI SDK system prompt parameters, tone of voice, length limits, and business guidelines.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" /> General AI Status & Tone
            </CardTitle>
            <CardDescription>Master toggle and style preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Switch
              label="Enable Vercel AI SDK Integration"
              description="Automatically generate replies when no special rule matches."
              checked={enabled}
              onChange={setEnabled}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Reply Style Preset
                </label>
                <select
                  value={replyStyle}
                  onChange={(e) => setReplyStyle(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="friendly">Friendly & Engaging</option>
                  <option value="professional">Professional & Direct</option>
                  <option value="casual">Casual & Conversational</option>
                  <option value="enthusiastic">Enthusiastic & High-Energy 🔥</option>
                </select>
              </div>

              <Input
                label="Maximum Response Length (Characters)"
                type="number"
                value={maxResponseLength}
                onChange={(e) => setMaxResponseLength(e.target.value)}
              />
            </div>

            <Input
              label="Tone Description"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              placeholder="Friendly and helpful social media assistant"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Context & Brand Guidelines</CardTitle>
            <CardDescription>Provide context so the AI represents your business accurately without hallucinating</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Business Description
              </label>
              <textarea
                rows={3}
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="We are a modern software company providing AI automation for creators..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Business Instructions & Guardrails
              </label>
              <textarea
                rows={3}
                value={businessInstructions}
                onChange={(e) => setBusinessInstructions(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Be warm, clear, concise, and encourage positive engagement..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Custom System Prompt Instructions
              </label>
              <textarea
                rows={2}
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Never mention prices that are not explicitly in the caption..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" icon={Save} isLoading={updateMutation.isPending}>
            Save AI Configuration
          </Button>
        </div>
      </form>
    </div>
  );
};
