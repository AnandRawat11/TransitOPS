import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DriverListPage from './pages/DriverListPage';
import TripListPage from './pages/TripListPage';
import MaintenancePage from './pages/MaintenancePage';
import FuelExpensePage from './pages/FuelExpensePage';
import ReportsPage from './pages/ReportsPage';

// Vehicle Feature Pages
import VehicleDashboard from './features/vehicles/pages/VehicleDashboard';
import VehicleListPage from './features/vehicles/pages/VehicleListPage';


import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Authentication Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Main Application Layout Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard (accessible to all authenticated users) */}
              <Route index element={<DashboardPage />} />

              {/* Vehicle Sub-pages */}
              <Route path="vehicles">
                <Route index element={<VehicleDashboard />} />
                <Route path="list" element={<VehicleListPage />} />
                {/* <Route path=":id" element={<VehicleDetailsPage />} /> */}
              </Route>

              <Route path="drivers" element={<DriverListPage />} />
              <Route path="trips" element={<TripListPage />} />
              <Route path="maintenance" element={<MaintenancePage />} />
              <Route path="fuel-expenses" element={<FuelExpensePage />} />
              <Route path="reports" element={<ReportsPage />} />

              {/* Fallback to dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
