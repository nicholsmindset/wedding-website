import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PWAInstaller } from "@/components/PWAInstaller";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTE_PATTERNS } from "@/lib/routes";

// Lazy load route components for code splitting
const LandingPage = lazy(() => import("@/components/LandingPage").then(m => ({ default: m.LandingPage })));
const WeddingDashboard = lazy(() => import("@/components/WeddingDashboard").then(m => ({ default: m.WeddingDashboard })));
const PublicRSVP = lazy(() => import("@/components/PublicRSVP").then(m => ({ default: m.PublicRSVP })));
const AuthCallback = lazy(() => import("@/components/AuthCallback").then(m => ({ default: m.AuthCallback })));
const NotFound = lazy(() => import("@/components/NotFound").then(m => ({ default: m.NotFound })));

// Loading spinner component for Suspense fallback
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

// Main content component with auth-based conditional rendering
function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return user ? (
    <>
      <WeddingDashboard />
      <PWAInstaller />
    </>
  ) : <LandingPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Home - conditional landing/dashboard */}
            <Route path={ROUTE_PATTERNS.HOME} element={<AppContent />} />

            {/* Public RSVP route with token authentication */}
            <Route path={ROUTE_PATTERNS.RSVP} element={<PublicRSVP />} />

            {/* Auth callback for magic link */}
            <Route path={ROUTE_PATTERNS.AUTH_CALLBACK} element={<AuthCallback />} />

            {/* 404 catch-all route - must be last */}
            <Route path={ROUTE_PATTERNS.NOT_FOUND} element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}
