import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from './components/ui/sonner';

import { PublicLayout } from './components/PublicLayout';
import Home from './pages/Home';
import Services from './pages/Services';
import Audit from './pages/Audit';
import AuditReport from './pages/AuditReport';
import Results from './pages/Results';
import About from './pages/About';
import Team from './pages/Team';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Demo from './pages/Demo';

import AdminLogin from './pages/admin/Login';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminAudits from './pages/admin/Audits';
import AdminAuditDetail from './pages/admin/AuditDetail';
import AdminChats from './pages/admin/Chats';
import AdminBookings from './pages/admin/Bookings';
import AdminTasks from './pages/admin/Tasks';
import AdminAnalytics from './pages/admin/Analytics';
import AdminEmails from './pages/admin/Emails';
import AdminCalls from './pages/admin/Calls';
import AdminSettings from './pages/admin/Settings';

const WithPublic = ({ children }) => <PublicLayout>{children}</PublicLayout>;

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<WithPublic><Home /></WithPublic>} />
          <Route path="/services" element={<WithPublic><Services /></WithPublic>} />
          <Route path="/audit" element={<WithPublic><Audit /></WithPublic>} />
          <Route path="/audit-report/:id" element={<WithPublic><AuditReport /></WithPublic>} />
          <Route path="/results" element={<WithPublic><Results /></WithPublic>} />
          <Route path="/about" element={<WithPublic><About /></WithPublic>} />
          <Route path="/team" element={<WithPublic><Team /></WithPublic>} />
          <Route path="/blog" element={<WithPublic><Blog /></WithPublic>} />
          <Route path="/contact" element={<WithPublic><Contact /></WithPublic>} />
          <Route path="/demo" element={<WithPublic><Demo /></WithPublic>} />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="audits" element={<AdminAudits />} />
            <Route path="audits/:id" element={<AdminAuditDetail />} />
            <Route path="chats" element={<AdminChats />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="tasks" element={<AdminTasks />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="emails" element={<AdminEmails />} />
            <Route path="calls" element={<AdminCalls />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* 404 -> Home */}
          <Route path="*" element={<WithPublic><Home /></WithPublic>} />
        </Routes>
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: '#12121A',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#FFFFFF',
            },
          }}
        />
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
