import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import './App.css';

// Lazy load components
const Layout = React.lazy(() => import('./components/Layout'));
const GuestPage = React.lazy(() => import('./pages/GuestPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const TaskTablePage = React.lazy(() => import('./pages/TaskTablePage'));
const TaskCreatePage = React.lazy(() => import('./pages/TaskCreatePage'));
const TaskDetailPage = React.lazy(() => import('./pages/TaskDetailPage'));
const TrashPage = React.lazy(() => import('./pages/TrashPage'));

const queryClient = new QueryClient();

// Loading component
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <div>Loading...</div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicRoute><GuestPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tasks" element={<TaskTablePage />} />
          <Route path="tasks/new" element={<TaskCreatePage />} />
          <Route path="tasks/:id" element={<TaskDetailPage />} />
          <Route path="tasks/:id/edit" element={<TaskDetailPage isEditingByDefault={true} />} />
          <Route path="trash" element={<TrashPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <Toaster position="bottom-center" />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
