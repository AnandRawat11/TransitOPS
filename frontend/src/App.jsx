import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CommandPaletteProvider } from './context/CommandPaletteContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import DriverListPage from './pages/DriverListPage';
import FuelExpensePage from './pages/FuelExpensePage';
import ReportsPage from './pages/ReportsPage';

// Vehicle Feature Pages
import VehicleDashboard from './features/vehicles/pages/VehicleDashboard';
import VehicleListPage from './features/vehicles/pages/VehicleListPage';

// Trip Feature Pages
import TripsDashboardPage from './features/trips/pages/TripsDashboardPage';
import TripListPage from './features/trips/pages/TripListPage';
import CreateTripPage from './features/trips/pages/CreateTripPage';

// Maintenance Pages
import MaintenanceDashboardPage from './features/maintenance/pages/MaintenanceDashboardPage';
import MaintenanceListPage from './features/maintenance/pages/MaintenanceListPage';
import CreateMaintenancePage from './features/maintenance/pages/CreateMaintenancePage';

// Finance Pages
import FuelLogsPage from './features/fuel/pages/FuelLogsPage';
import ExpenseListPage from './features/expenses/pages/ExpenseListPage';

// AI Pages
import AiDashboardPage from './features/ai/pages/AiDashboardPage';
import CopilotPage from './features/ai/pages/CopilotPage';

// Analytics Pages
import ExecutiveDashboardPage from './features/analytics/pages/ExecutiveDashboardPage';
import ReportBuilderPage from './features/analytics/pages/ReportBuilderPage';

// Admin & Activity Pages
import ActivityTimelinePage from './features/activity/pages/ActivityTimelinePage';
import UserManagementPage from './features/admin/pages/UserManagementPage';

// Settings & Profile
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';

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
      <ThemeProvider>
        <AuthProvider>
          <CommandPaletteProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />

            {/* Protected Main Application Layout Routes */}
            <Route
              path="/app"
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

              {/* Trip Sub-pages */}
              <Route path="trips">
                <Route index element={<TripsDashboardPage />} />
                <Route path="list" element={<TripListPage />} />
                <Route path="new" element={<CreateTripPage />} />
              </Route>

              {/* Maintenance Sub-pages */}
              <Route path="maintenance">
                <Route index element={<MaintenanceDashboardPage />} />
                <Route path="list" element={<MaintenanceListPage />} />
                <Route path="new" element={<CreateMaintenancePage />} />
              </Route>

              {/* Finance Routes */}
              <Route path="fuel">
                <Route index element={<FuelLogsPage />} />
              </Route>
              
              <Route path="expenses">
                <Route index element={<ExpenseListPage />} />
              </Route>

              <Route path="drivers" element={<DriverListPage />} />
              <Route path="fuel-expenses" element={<FuelExpensePage />} />
              <Route path="reports" element={<ReportsPage />} />

              {/* AI Routes */}
              <Route path="ai">
                <Route index element={<AiDashboardPage />} />
                <Route path="copilot" element={<CopilotPage />} />
              </Route>

              {/* Analytics Routes */}
              <Route path="analytics">
                <Route index element={<ExecutiveDashboardPage />} />
                <Route path="reports" element={<ReportBuilderPage />} />
              </Route>

              {/* Admin Routes */}
              <Route path="admin">
                <Route path="users" element={<UserManagementPage />} />
                <Route path="activity" element={<ActivityTimelinePage />} />
              </Route>

              {/* Settings & Profile Routes */}
              <Route path="settings" element={<SettingsPage />} />
              <Route path="profile" element={<ProfilePage />} />

              {/* Fallback to dashboard */}
              <Route path="*" element={<Navigate to="/app" replace />} />
            </Route>

              {/* Global Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
          </CommandPaletteProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
