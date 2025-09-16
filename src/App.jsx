// src/App.jsx
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { restoreSession } from "./redux/slices/authSlice";
import { Routes, Route, Navigate } from "react-router-dom";

import LoginBox from "./components/auth/LoginBox";
import Dashboard from "./components/features/dashboard/MainDashboard/3.0 DashboardMain";
import Network from "./components/features/network/NetworkPage/4.0 NetworkMain";
import Administration from "./components/features/administration/AdministrationPage/5.0 AdministrationMain";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import "./App.css";
import WorkingMeasurementMap from "./components/WorkingMeasurementMap";
import QuickMapAccess from "./components/common/QuickMapAccess";
import GISProfessionalDashboard from "./components/gis/GISProfessionalDashboard";
import GISDashboard from "./components/gis/dashboard/GISDashboard";

export default function App() {
  const dispatch = useDispatch();

  // Removed automatic session restoration - users must login every time
  // useEffect(() => {
  //   dispatch(restoreSession());
  // }, [dispatch]);

  return (
    <>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<LoginBox />} />

        {/* Protected routes inside Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/network"
          element={
            <ProtectedRoute>
              <Layout>
                <Network />
              </Layout>
            </ProtectedRoute>
          }
        />

     

        <Route
          path="/administration"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Layout>
                <Administration />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/workingMap"
          element={
            <ProtectedRoute>
              <WorkingMeasurementMap />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gisProfessionalDashboard"
          element={
            <ProtectedRoute>
              <GISProfessionalDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gis-dashboard"
          element={
            <ProtectedRoute>
              <GISDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all → redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating Quick Access to Map Tools */}
      <QuickMapAccess />
    </>
  );
}
