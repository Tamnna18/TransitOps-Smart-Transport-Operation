import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { AuthLayout } from "../layouts/AuthLayout";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { DriverLayout } from "../layouts/DriverLayout";
import { LoadingScreen } from "../pages/auth/LoadingScreen";
import { ROLES } from "../constants";

// Lazy Loaded Pages
const Login = lazy(() => import("../pages/auth/Login").then(module => ({ default: module.Login })));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword").then(module => ({ default: module.ForgotPassword })));
const Unauthorized = lazy(() => import("../pages/auth/Unauthorized").then(module => ({ default: module.Unauthorized })));
const NotFound = lazy(() => import("../pages/NotFound").then(module => ({ default: module.NotFound })));

// Portal Manager Layout Pages
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Fleet = lazy(() => import("../pages/Fleet"));
const Drivers = lazy(() => import("../pages/Drivers"));
const Dispatch = lazy(() => import("../pages/Dispatch"));
const Maintenance = lazy(() => import("../pages/Maintenance"));
const Expenses = lazy(() => import("../pages/Expenses"));
const Reports = lazy(() => import("../pages/Reports"));
const Analytics = lazy(() => import("../pages/Analytics"));
const Settings = lazy(() => import("../pages/Settings"));

// Portal Driver Layout Pages
const ActiveTrip = lazy(() => import("../pages/driver/ActiveTrip"));
const DriverExpenses = lazy(() => import("../pages/driver/DriverExpenses"));
const DriverDocuments = lazy(() => import("../pages/driver/DriverDocuments"));
const DriverProfile = lazy(() => import("../pages/driver/DriverProfile"));

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Manager/Staff Portal Protected routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.MANAGER, ROLES.SAFETY, ROLES.ANALYST]} />}>
          <Route path="/app" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Fleet, Drivers, Maintenance: Manager and Safety */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.MANAGER, ROLES.SAFETY]} />}>
              <Route path="fleet" element={<Fleet />} />
              <Route path="drivers" element={<Drivers />} />
              <Route path="maintenance" element={<Maintenance />} />
            </Route>

            {/* Dispatch: Manager Only */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.MANAGER]} />}>
              <Route path="dispatch" element={<Dispatch />} />
            </Route>

            {/* Fuel & Expenses / Analytics: Manager, Analyst */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.MANAGER, ROLES.ANALYST]} />}>
              <Route path="expenses" element={<Expenses />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>

            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Driver Portal Protected routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.DRIVER]} />}>
          <Route path="/driver" element={<DriverLayout />}>
            <Route index element={<Navigate to="/driver/active-trip" replace />} />
            <Route path="active-trip" element={<ActiveTrip />} />
            <Route path="expenses" element={<DriverExpenses />} />
            <Route path="documents" element={<DriverDocuments />} />
            <Route path="profile" element={<DriverProfile />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};
