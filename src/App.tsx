import { useEffect } from "react";
import type { ReactNode } from "react";
import { HashRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AppProvider, useApp } from "./state/AppContext";
import { Ambient, Button, EmptyState, Logo, Toaster } from "./components/ui";
import Shell from "./components/Shell";
import Landing from "./pages/Landing";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import NewProject from "./pages/NewProject";
import ProjectDetail from "./pages/ProjectDetail";
import RoadmapPage from "./pages/RoadmapPage";
import ReportPage from "./pages/ReportPage";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

function Protected() {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  return <Shell />;
}

function GuestOnly({ children }: { children: ReactNode }) {
  const { user } = useApp();
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <Logo size={40} />
        <p className="mt-8 font-mono text-[80px] font-bold leading-none text-transparent" style={{ backgroundImage: "linear-gradient(120deg,#6366f1,#a78bfa)", WebkitBackgroundClip: "text", backgroundClip: "text" }}>
          404
        </p>
        <EmptyState icon="boat" title="You've sailed off the chart" body="The URL doesn't match anything Slipway knows about. Let's get you back to safe harbor.">
          <Button icon="arrow-left" onClick={() => navigate("/dashboard")}>
            Back to dashboard
          </Button>
        </EmptyState>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <Ambient />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/login"
            element={
              <GuestOnly>
                <AuthPage mode="login" />
              </GuestOnly>
            }
          />
          <Route
            path="/register"
            element={
              <GuestOnly>
                <AuthPage mode="register" />
              </GuestOnly>
            }
          />
          <Route element={<Protected />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects/new" element={<NewProject />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/projects/:id/roadmap" element={<RoadmapPage />} />
            <Route path="/projects/:id/report" element={<ReportPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AppProvider>
    </HashRouter>
  );
}
