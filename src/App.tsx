import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Onboard } from './pages/Onboard';
import { Home } from './pages/Home';
import { Progress } from './pages/Progress';
import { Capsules } from './pages/Capsules';
import { RecapPage } from './pages/RecapPage';
import { Pulse } from './pages/Pulse';
import { Profile } from './pages/Profile';
import { SsoCallback } from './pages/SsoCallback';
import { getProfile } from './api/profile';
import { useAuth, AuthProvider } from './hooks/useAuth';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { hasActiveSession, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-[#0f0a15] dark:via-[#160c25] dark:to-[#1a0f20] flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!hasActiveSession) {
    return <Navigate to="/onboard" replace />;
  }

  return <>{children}</>;
}

function ThemePreferenceBootstrap() {
  const { user, hasActiveSession, isLoading } = useAuth();
  const { setThemePreference } = useTheme();

  useEffect(() => {
    if (isLoading || !hasActiveSession || !user) {
      return;
    }

    let isCancelled = false;

    void getProfile()
      .then((profile) => {
        if (!isCancelled) {
          setThemePreference(profile.themePreference);
        }
      })
      .catch(() => {
        // Profile page still allows manual sync/retry if this background sync fails.
      });

    return () => {
      isCancelled = true;
    };
  }, [hasActiveSession, isLoading, user, setThemePreference]);

  return null;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemePreferenceBootstrap />
        <Routes>
          <Route path="/onboard" element={<Onboard />} />
          <Route path="/sso-callback" element={<SsoCallback />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <Progress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/capsules"
            element={
              <ProtectedRoute>
                <Capsules />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recap"
            element={
              <ProtectedRoute>
                <RecapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pulse"
            element={
              <ProtectedRoute>
                <Pulse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
