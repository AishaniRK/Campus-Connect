import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import AppLayout from './layouts/AppLayout';

// Public & Auth Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import ExploreOpportunities from './pages/student/ExploreOpportunities';
import RecommendedOpportunities from './pages/student/RecommendedOpportunities';
import SavedOpportunities from './pages/student/SavedOpportunities';
import ReportIssue from './pages/student/ReportIssue';
import MyComplaints from './pages/student/MyComplaints';
import StudentProfile from './pages/student/StudentProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOpportunities from './pages/admin/AdminOpportunities';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminDepartments from './pages/admin/AdminDepartments';
import AdminStudents from './pages/admin/AdminStudents';

// Route Guards
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-xs">
        Loading session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If student visits admin route, redirect to dashboard; if admin visits student route, redirect to admin dashboard
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Student Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/opportunities" element={<ExploreOpportunities />} />
              <Route path="/recommended" element={<RecommendedOpportunities />} />
              <Route path="/saved" element={<SavedOpportunities />} />
              <Route path="/report-issue" element={<ReportIssue />} />
              <Route path="/complaints" element={<MyComplaints />} />
              <Route path="/profile" element={<StudentProfile />} />
            </Route>

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="opportunities" element={<AdminOpportunities />} />
              <Route path="complaints" element={<AdminComplaints />} />
              <Route path="departments" element={<AdminDepartments />} />
              <Route path="students" element={<AdminStudents />} />
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}

