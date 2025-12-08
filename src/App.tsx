import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LandingPage } from "@/components/LandingPage";
import { WeddingDashboard } from "@/components/WeddingDashboard";
import { PublicRSVP } from "@/components/PublicRSVP";
import { PWAInstaller } from "@/components/PWAInstaller";
import { useAuth } from "@/contexts/AuthContext";

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
        <Routes>
          <Route path="/" element={<AppContent />} />
          <Route path="/rsvp/:weddingId" element={<PublicRSVP />} />
          <Route path="/auth/callback" element={<div>Authentication successful! Redirecting...</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
