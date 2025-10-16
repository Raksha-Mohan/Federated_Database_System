import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

// Auth Context
import { AuthProvider, useAuth } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import Dashboard from './pages/Dashboard';
import PatientsList from './pages/PatientsList';
import PatientForm from './pages/PatientForm';
import PoliciesList from './pages/PoliciesList';
import PolicyForm from './pages/PolicyForm';
import ClaimsList from './pages/ClaimsList';
import ClaimForm from './pages/ClaimForm';

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />

      {/* Hospital routes - Only accessible to hospital staff */}
      <Route path="/patients" element={
        <ProtectedRoute allowedRoles={['hospital']}>
          <MainLayout>
            <PatientsList />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/patients/new" element={
        <ProtectedRoute allowedRoles={['hospital']}>
          <MainLayout>
            <PatientForm />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/patients/:id" element={
        <ProtectedRoute allowedRoles={['hospital']}>
          <MainLayout>
            <PatientForm />
          </MainLayout>
        </ProtectedRoute>
      } />

      {/* Insurance routes - Only accessible to insurance staff */}
      <Route path="/policies" element={
        <ProtectedRoute allowedRoles={['insurance']}>
          <MainLayout>
            <PoliciesList />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/policies/new" element={
        <ProtectedRoute allowedRoles={['insurance']}>
          <MainLayout>
            <PolicyForm />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/policies/:id" element={
        <ProtectedRoute allowedRoles={['insurance']}>
          <MainLayout>
            <PolicyForm />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/claims" element={
        <ProtectedRoute allowedRoles={['insurance']}>
          <MainLayout>
            <ClaimsList />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/claims/new" element={
        <ProtectedRoute allowedRoles={['insurance']}>
          <MainLayout>
            <ClaimForm />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/claims/:id" element={
        <ProtectedRoute allowedRoles={['insurance']}>
          <MainLayout>
            <ClaimForm />
          </MainLayout>
        </ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <AppContent />
          <ToastContainer position="bottom-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;