import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'InstaAuto AI';
const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || 'support@yourdomain.com';

export const DataDeletionPage = () => (
  <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
    <article className="mx-auto max-w-3xl space-y-8">
      <header className="border-b border-slate-800 pb-8">
        <Link to="/privacy" className="mb-8 inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"><ArrowLeft className="h-4 w-4" /> Privacy Policy</Link>
        <div className="flex items-start gap-4"><div className="rounded-xl bg-rose-600/15 p-3 text-rose-400"><Trash2 className="h-6 w-6" /></div><div><h1 className="text-3xl font-extrabold tracking-tight">Data Deletion</h1><p className="mt-2 text-sm text-slate-400">{APP_NAME}</p></div></div>
      </header>
      <section className="space-y-4 text-sm leading-7 text-slate-300">
        <p>To request deletion of your {APP_NAME} account and associated data, email <a href={`mailto:${SUPPORT_EMAIL}?subject=Data%20deletion%20request`} className="text-indigo-400 underline underline-offset-2">{SUPPORT_EMAIL}</a> from the email address associated with your account.</p>
        <p>Include “Data deletion request” in the subject. We will verify the request, disconnect or remove associated Meta and Instagram data where applicable, and confirm completion or explain any information that must be retained by law.</p>
        <p>You can also disconnect the app from your Meta or Instagram account settings. Disconnecting stops future access; it does not by itself submit a deletion request for data already stored by the service.</p>
      </section>
      <footer className="border-t border-slate-800 pt-6 text-xs text-slate-500">Requests are handled within a reasonable period and may require identity verification.</footer>
    </article>
  </main>
);

export default DataDeletionPage;
