import { useState, useEffect } from "react";
import { onAuthStateChange } from "./firebaseConfig";
import AuthPage from './pages/AuthPage';
import UserDashboard from "./user/components/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import LoadingSpinner from "./components/LoadingSpinner";
import "./styles.css";
import "./analytics/components/chat-styles.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          role: user.email === 'admin@mavericks.com' ? 'admin' : 'user'
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-10 shadow-xl border border-gray-200/60">
            <LoadingSpinner size="xl" text="Loading Mavericks Coding Platform..." />
            <p className="text-gray-600 text-sm mt-4">Initializing your coding journey...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  // Render admin or user dashboard based on role
  if (user.role === 'admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  return <UserDashboard user={user} onLogout={handleLogout} />;
}
