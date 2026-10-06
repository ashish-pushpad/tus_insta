import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Bot,
  Instagram,
  MessageSquare,
  Zap,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Mail,
  Globe,
  FileText,
  Trash2,
  Info,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';

// Read from env — falls back gracefully when not set
const APP_NAME        = import.meta.env.VITE_APP_NAME            || 'InstaAuto AI';
const COMPANY_NAME    = import.meta.env.VITE_COMPANY_NAME        || null;
const SUPPORT_EMAIL   = import.meta.env.VITE_SUPPORT_EMAIL       || null;
const WEBSITE_URL     = import.meta.env.VITE_WEBSITE_URL         || null;
const PRIVACY_URL     = import.meta.env.VITE_PRIVACY_POLICY_URL  || '/privacy';
const DELETION_URL    = import.meta.env.VITE_DATA_DELETION_URL   || '/data-deletion';

/* ─── small reusable section wrapper ───────────────────────────────────────── */
const Section = ({ icon: Icon, title, children, accent = 'indigo' }) => {
  const accents = {
    indigo:  { icon: 'text-indigo-400 bg-indigo-600/15',  border: 'border-indigo-500/20'  },
    pink:    { icon: 'text-pink-400 bg-pink-600/15',       border: 'border-pink-500/20'    },
    emerald: { icon: 'text-emerald-400 bg-emerald-600/15', border: 'border-emerald-500/20' },
    amber:   { icon: 'text-amber-400 bg-amber-600/15',     border: 'border-amber-500/20'   },
    violet:  { icon: 'text-violet-400 bg-violet-600/15',   border: 'border-violet-500/20'  },
    rose:    { icon: 'text-rose-400 bg-rose-600/15',       border: 'border-rose-500/20'    },
    sky:     { icon: 'text-sky-400 bg-sky-600/15',         border: 'border-sky-500/20'     },
  };
  const a = accents[accent] || accents.indigo;

  return (
    <Card className={`border ${a.border}`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${a.icon}`}>
            <Icon className="w-4 h-4" />
          </div>
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-slate-300 leading-relaxed space-y-3">
          {children}
        </div>
      </CardContent>
    </Card>
  );
};

/* ─── flow step pill ────────────────────────────────────────────────────────── */
const FlowStep = ({ label, last = false }) => (
  <div className="flex items-center gap-2">
    <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 whitespace-nowrap">
      {label}
    </span>
    {!last && <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
  </div>
);

/* ─── bullet list item ───────────────────────────────────────────────────────── */
const Bullet = ({ children }) => (
  <li className="flex items-start gap-2">
    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
    <span>{children}</span>
  </li>
);

/* ─── external link helper ──────────────────────────────────────────────────── */
const ExternalLink = ({ href, children }) =>
  href ? (
    <a
      href={href}
      target={href.startsWith('/') ? undefined : '_blank'}
      rel={href.startsWith('/') ? undefined : 'noopener noreferrer'}
      className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
    >
      {children}
    </a>
  ) : (
    <span className="text-slate-500 italic">{children} (not configured)</span>
  );

/* ══════════════════════════════════════════════════════════════════════════════
   About Page
══════════════════════════════════════════════════════════════════════════════ */
export const AboutPage = () => {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
    <div className="space-y-8 max-w-4xl mx-auto">

      {/* ── Hero header ─────────────────────────────────────────────────── */}
      <div className="pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl ig-gradient-bg flex items-center justify-center shadow-lg shadow-pink-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              About {APP_NAME}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Instagram Auto-Reply Platform</p>
          </div>
        </div>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          <strong className="text-slate-200">{APP_NAME}</strong> is an AI-assisted social media
          automation platform designed to help businesses and creators manage conversations with
          their audiences more efficiently.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="info">Meta Graph API</Badge>
          <Badge variant="success">AI-Powered</Badge>
          <Badge variant="neutral">Instagram Integration</Badge>
          <Badge variant="warning">Automation</Badge>
        </div>
      </div>

      {/* ── What can it do? ──────────────────────────────────────────────── */}
      <Section icon={Bot} title={`What Can ${APP_NAME} Do?`} accent="indigo">
        <p>
          The platform can connect with supported Instagram accounts through Meta's authorized APIs
          and provide tools for managing comments and supported messaging workflows.
        </p>
        <p>Depending on the features enabled for your account, {APP_NAME} can help you:</p>
        <ul className="space-y-1.5 mt-2">
          <Bullet>Monitor supported Instagram comments.</Bullet>
          <Bullet>Identify comments based on configured rules or keywords.</Bullet>
          <Bullet>Generate AI-assisted responses.</Bullet>
          <Bullet>Publish automated replies when enabled.</Bullet>
          <Bullet>Process supported Instagram messages.</Bullet>
          <Bullet>Generate AI-assisted responses to supported messages.</Bullet>
          <Bullet>Manage automation settings.</Bullet>
          <Bullet>Monitor automation activity.</Bullet>
        </ul>
        <p className="text-slate-400 text-xs mt-2">
          The exact functionality available depends on the Meta permissions granted to the application
          and the features enabled by the user.
        </p>
      </Section>

      {/* ── How Instagram integration works ──────────────────────────────── */}
      <Section icon={Instagram} title="How Instagram Integration Works" accent="pink">
        <p>
          When you connect an eligible Instagram account, you authorize {APP_NAME} to communicate
          with Meta's APIs on your behalf.
        </p>
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            The basic flow
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <FlowStep label="Connect Instagram" />
            <FlowStep label="Authorize Access" />
            <FlowStep label="Receive Supported Events" />
            <FlowStep label="Process Data" />
            <FlowStep label="Generate Response" />
            <FlowStep label="Perform Authorized Action" last />
          </div>
        </div>
        <p className="text-slate-400 text-xs mt-3">
          We only request access needed for the functionality that you choose to use.
        </p>
      </Section>

      {/* ── AI-Assisted Communication ─────────────────────────────────────── */}
      <Section icon={Zap} title="AI-Assisted Communication" accent="violet">
        <p>
          Our platform can use artificial intelligence to generate responses based on the content
          and context available to the application.
        </p>
        <p>
          AI-generated responses are intended to assist with communication and automation. They may
          occasionally contain errors or inappropriate responses, so users are responsible for
          configuring their automation appropriately.
        </p>
      </Section>

      {/* ── Your Control ──────────────────────────────────────────────────── */}
      <Section icon={UserCheck} title="Your Control" accent="emerald">
        <p>You remain in control of your connected account. You can:</p>
        <ul className="space-y-1.5 mt-2">
          <Bullet>Configure automation settings.</Bullet>
          <Bullet>
            Change or disable automation via the{' '}
          the Automations page.
          </Bullet>
          <Bullet>
            Disconnect your Instagram account from the{' '}
            the Instagram connection settings.
          </Bullet>
          <Bullet>Request deletion of your data.</Bullet>
          <Bullet>Contact our support team regarding the Service.</Bullet>
        </ul>
      </Section>

      {/* ── Third-Party Platforms ─────────────────────────────────────────── */}
      <Section icon={MessageSquare} title="Third-Party Platforms" accent="amber">
        <p>
          {APP_NAME} integrates with third-party services, including Meta and Instagram. Instagram
          and Meta are products and services operated by{' '}
          <a
            href="https://www.meta.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
          >
            Meta Platforms, Inc.
          </a>
        </p>
        <p className="text-slate-400 text-xs mt-1">
          {APP_NAME} is not a replacement for Instagram and does not control the availability or
          functionality of Meta's platforms.
        </p>
      </Section>

      {/* ── Privacy & Data Deletion ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Section icon={ShieldCheck} title="Privacy" accent="sky">
          <p>
            We take privacy seriously. For information about the information we collect, how we use
            it, and your rights, please review our Privacy Policy.
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="text-slate-400">Privacy Policy:</span>
            <ExternalLink href={PRIVACY_URL}>Privacy Policy</ExternalLink>
          </div>
        </Section>

        <Section icon={Trash2} title="Data Deletion" accent="rose">
          <p>
            You can request deletion of your information by following the instructions on our Data
            Deletion page.
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold">
            <Trash2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="text-slate-400">Data Deletion:</span>
            <ExternalLink href={DELETION_URL}>Data Deletion</ExternalLink>
          </div>
        </Section>
      </div>

      {/* ── Contact ──────────────────────────────────────────────────────── */}
      <Section icon={Mail} title="Contact" accent="indigo">
        <p>For questions or support, reach out to our team:</p>
        <div className="mt-3 space-y-2.5">
          {COMPANY_NAME && (
            <div className="flex items-center gap-2 text-xs">
              <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="text-slate-400 font-semibold">Company:</span>
              <span className="text-slate-200">{COMPANY_NAME}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs">
            <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-slate-400 font-semibold">Email:</span>
            {SUPPORT_EMAIL ? (
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
              >
                {SUPPORT_EMAIL}
              </a>
            ) : (
              <span className="text-slate-500 italic">not configured</span>
            )}
          </div>
          {WEBSITE_URL && (
            <div className="flex items-center gap-2 text-xs">
              <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="text-slate-400 font-semibold">Website:</span>
              <a
                href={WEBSITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
              >
                {WEBSITE_URL}
              </a>
            </div>
          )}
        </div>

        {(!COMPANY_NAME && !SUPPORT_EMAIL && !WEBSITE_URL) && (
          <p className="text-slate-500 text-xs mt-2 italic">
            Contact information has not been configured. Set{' '}
            <code className="bg-slate-800 px-1 py-0.5 rounded text-slate-300">VITE_COMPANY_NAME</code>,{' '}
            <code className="bg-slate-800 px-1 py-0.5 rounded text-slate-300">VITE_SUPPORT_EMAIL</code>, and{' '}
            <code className="bg-slate-800 px-1 py-0.5 rounded text-slate-300">VITE_WEBSITE_URL</code>{' '}
            in your <code className="bg-slate-800 px-1 py-0.5 rounded text-slate-300">.env</code> file.
          </p>
        )}
      </Section>

      {/* ── Footer note ──────────────────────────────────────────────────── */}
      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500">
        <p>
          <span className="ig-gradient-text font-bold">{APP_NAME}</span> — Instagram Auto-Reply Platform
        </p>
        <p>Last Updated: October 4, 2026</p>
      </div>

    </div>
    </main>
  );
};

export default AboutPage;
