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
import EmployeeManager from './pages/admin/EmployeeManager';

import EmployeeLogin from './pages/employee/EmployeeLogin';
import { EmployeeLayout } from './pages/employee/EmployeeLayout';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyAttendance from './pages/employee/MyAttendance';
import MyLeaves from './pages/employee/MyLeaves';
import MyTasks from './pages/employee/MyTasks';
import MyOvertime from './pages/employee/MyOvertime';
import Profile from './pages/employee/Profile';
import Attendance from './pages/admin/Attendance';
import Leaves from './pages/admin/Leaves';
import Overtime from './pages/admin/Overtime';
import Reports from './pages/admin/Reports';

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
            <Route path="employees" element={<EmployeeManager />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="leaves" element={<Leaves />} />
            <Route path="overtime" element={<Overtime />} />
            <Route path="reports" element={<Reports />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="emails" element={<AdminEmails />} />
            <Route path="calls" element={<AdminCalls />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Employee */}
          <Route path="/employee/login" element={<EmployeeLogin />} />
          <Route path="/employee" element={<EmployeeLayout />}>
            <Route index element={<EmployeeDashboard />} />
            <Route path="attendance" element={<MyAttendance />} />
            <Route path="tasks" element={<MyTasks />} />
            <Route path="leaves" element={<MyLeaves />} />
            <Route path="overtime" element={<MyOvertime />} />
            <Route path="profile" element={<Profile />} />
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
