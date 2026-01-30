import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";

import { AuthProvider } from "./context/AuthContext";
import { RequireAuth } from "./components/RequireAuth";
import { Layout } from "./components/Layout";

import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { SubmissionsPage } from "./pages/SubmissionsPage";
import { ValidationPage } from "./pages/ValidationPage";
import { ApprovalsPage } from "./pages/ApprovalsPage";
import { PublishPage } from "./pages/PublishPage";
import { AuditPage } from "./pages/AuditPage";
import { EvidencePage } from "./pages/EvidencePage";
import { SettingsPage } from "./pages/SettingsPage";
import { NotFoundPage } from "./pages/NotFoundPage";

// PUBLIC_INTERFACE
function App() {
  /** App entry: routing + auth provider + protected layout. */
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/"
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="submissions" element={<SubmissionsPage />} />
            <Route path="validation" element={<ValidationPage />} />
            <Route path="approvals" element={<ApprovalsPage />} />
            <Route path="publish" element={<PublishPage />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="evidence" element={<EvidencePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
