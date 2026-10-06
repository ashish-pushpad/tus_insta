import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'InstaAuto AI';
const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || 'the operator of this service';
const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || 'support@yourdomain.com';

const Section = ({ title, children }) => (
  <section className="space-y-3">
    <h2 className="text-lg font-bold text-white">{title}</h2>
    <div className="space-y-3 text-sm leading-7 text-slate-300">{children}</div>
  </section>
);

export const PrivacyPolicyPage = () => (
  <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
    <article className="mx-auto max-w-3xl space-y-8">
      <header className="border-b border-slate-800 pb-8">
        <Link to="/about" className="mb-8 inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300">
          <ArrowLeft className="h-4 w-4" /> Back to {APP_NAME}
        </Link>
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-sky-600/15 p-3 text-sky-400"><ShieldCheck className="h-6 w-6" /></div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
            <p className="mt-2 text-sm text-slate-400">Last updated: October 4, 2026</p>
          </div>
        </div>
      </header>

      <Section title="1. Overview">
        <p>{COMPANY_NAME} (“we,” “us,” or “our”) operates {APP_NAME}, an Instagram automation service. This policy explains what information we collect, how we use it, how we protect it, and the choices available to you.</p>
        <p>By using {APP_NAME}, you agree to this policy. You may use this page without creating an account or signing in.</p>
      </Section>
      <Section title="2. Information we collect">
        <p>We collect account details such as your name, email address, and authentication credentials when you register. We collect information you choose to connect from an eligible Instagram professional account, including account identifiers, profile information, comments, messages, media, and permissions granted through Meta.</p>
        <p>We also collect configuration, automation, activity, device, and basic log information needed to operate and secure the service. We do not collect Instagram passwords.</p>
      </Section>
      <Section title="3. How we use information">
        <p>We use information to provide and maintain the service, connect to Meta and Instagram at your direction, process supported comments and messages, run configured automations, generate AI-assisted responses, provide support, prevent abuse, and comply with legal obligations.</p>
        <p>We use Meta and Instagram data only for the functionality described in the service and permitted by the permissions you grant. We do not sell personal information.</p>
      </Section>
      <Section title="4. Sharing and service providers">
        <p>We may share information with infrastructure, hosting, analytics, security, and AI service providers only as needed to provide the service. We may disclose information when required by law, to protect rights and safety, or as part of a business transfer. Meta and Instagram process information under their own policies.</p>
      </Section>
      <Section title="5. Data retention and security">
        <p>We retain information only as long as reasonably needed for the purposes described here, unless a longer period is required by law. We use reasonable administrative, technical, and organizational safeguards, but no online service can guarantee absolute security.</p>
      </Section>
      <Section title="6. Your choices and deletion">
        <p>You can disconnect your Instagram account, disable automations, update account information, or request deletion of your data. Visit our <Link to="/data-deletion" className="text-indigo-400 underline underline-offset-2">Data Deletion</Link> page for instructions. You may also contact us at <a href={`mailto:${SUPPORT_EMAIL}`} className="text-indigo-400 underline underline-offset-2">{SUPPORT_EMAIL}</a>.</p>
      </Section>
      <Section title="7. Children’s privacy">
        <p>{APP_NAME} is not directed to children under 13, and we do not knowingly collect personal information from children under 13.</p>
      </Section>
      <Section title="8. Changes and contact">
        <p>We may update this policy from time to time. The “Last updated” date above shows when the latest version took effect. Questions about this policy can be sent to <a href={`mailto:${SUPPORT_EMAIL}`} className="text-indigo-400 underline underline-offset-2">{SUPPORT_EMAIL}</a>.</p>
      </Section>
      <footer className="border-t border-slate-800 pt-6 text-xs text-slate-500">{APP_NAME} — Instagram Auto-Reply Platform</footer>
    </article>
  </main>
);

export default PrivacyPolicyPage;
