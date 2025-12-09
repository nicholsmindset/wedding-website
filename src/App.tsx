import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LandingPage } from "@/components/LandingPage";
import { WeddingDashboard } from "@/components/WeddingDashboard";
import { PublicRSVP } from "@/components/PublicRSVP";
import { PWAInstaller } from "@/components/PWAInstaller";
import { useAuth } from "@/contexts/AuthContext";
import { Toaster } from "sonner";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? (
    <ErrorBoundary>
      <WeddingDashboard />
      <PWAInstaller />
    </ErrorBoundary>
  ) : <LandingPage />;
}

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home after a short delay
    const timer = setTimeout(() => navigate('/'), 1000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600">Authentication successful! Redirecting...</p>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <Router>
          <Routes>
            <Route path="/" element={<AppContent />} />
            <Route
              path="/rsvp/:weddingId"
              element={
                <ErrorBoundary>
                  <PublicRSVP />
                </ErrorBoundary>
              }
            />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
