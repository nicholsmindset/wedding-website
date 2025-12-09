import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LandingPage } from "@/components/LandingPage";
import { WeddingDashboard } from "@/components/WeddingDashboard";
import { PublicRSVP } from "@/components/PublicRSVP";
import { PWAInstaller } from "@/components/PWAInstaller";
import { useAuth } from "@/contexts/AuthContext";

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

// Protected route wrapper - redirects to landing if not authenticated
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      {children}
      <PWAInstaller />
    </>
  );
}

// Home route - shows landing or redirects to dashboard
function HomeRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // If authenticated, show the wedding list (no specific wedding selected)
  if (user) {
    return (
      <>
        <WeddingDashboard />
        <PWAInstaller />
      </>
    );
  }

  return <LandingPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Home - wedding list or landing page */}
          <Route path="/" element={<HomeRoute />} />

          {/* Deep link to specific wedding (URL-based state) */}
          <Route
            path="/wedding/:weddingId"
            element={
              <ProtectedRoute>
                <WeddingDashboard />
              </ProtectedRoute>
            }
          />

          {/* Public RSVP page */}
          <Route path="/rsvp/:weddingId" element={<PublicRSVP />} />

          {/* Auth callback */}
          <Route path="/auth/callback" element={<div>Authentication successful! Redirecting...</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
