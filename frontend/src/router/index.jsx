import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Layout } from '../components/layout/Layout.jsx';

import { Login } from '../pages/Login.jsx';
import { Register } from '../pages/Register.jsx';
import { Dashboard } from '../pages/Dashboard.jsx';
import { InstagramPage } from '../pages/Instagram.jsx';
import { MediaPage } from '../pages/Media.jsx';
import { AutomationsPage } from '../pages/Automations.jsx';
import { SpecialRepliesPage } from '../pages/SpecialReplies.jsx';
import { ConversationsPage } from '../pages/Conversations.jsx';
import { ActivityPage } from '../pages/Activity.jsx';
import { AISettingsPage } from '../pages/AISettings.jsx';
import { SettingsPage } from '../pages/Settings.jsx';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-sm">
        Loading SaaS platform context...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/instagram" element={<ProtectedRoute><InstagramPage /></ProtectedRoute>} />
      <Route path="/content" element={<ProtectedRoute><MediaPage /></ProtectedRoute>} />
      <Route path="/automations" element={<ProtectedRoute><AutomationsPage /></ProtectedRoute>} />
      <Route path="/special-replies" element={<ProtectedRoute><SpecialRepliesPage /></ProtectedRoute>} />
      <Route path="/conversations" element={<ProtectedRoute><ConversationsPage /></ProtectedRoute>} />
      <Route path="/activity" element={<ProtectedRoute><ActivityPage /></ProtectedRoute>} />
      <Route path="/ai-settings" element={<ProtectedRoute><AISettingsPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
