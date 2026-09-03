import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import ProtectedRoute from './components/ProtectedRoute';

const DefaultRedirect = () => {
  const { user, token } = useAuth();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role === 'STUDENT') return <Navigate to="/dashboard" replace />;
  if (user.role === 'TECHNICIAN') return <Navigate to="/technician" replace />;
  return <Navigate to="/admin" replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<DefaultRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/technician"
        element={
          <ProtectedRoute allowedRoles={['TECHNICIAN', 'ADMIN', 'STAFF']}>
            <TechnicianDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'TECHNICIAN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/complaint/:id"
        element={
          <ProtectedRoute>
            <ComplaintDetailPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
