import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { FollowingPage } from './pages/FollowingPage';
import { BrowsePage } from './pages/BrowsePage';
import { SearchPage } from './pages/SearchPage';
import { HistoryPage } from './pages/HistoryPage';
import { AdminPage } from './pages/AdminPage';
import { IssuesPage } from './pages/IssuesPage';
import { WatchPage } from './pages/WatchPage';
import { CategoryPage } from './pages/CategoryPage';

import { Toaster } from 'react-hot-toast';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#18181b] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#1f1f23',
          color: '#efeff1',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      }} />
      <Layout>{children}</Layout>
    </>
  );
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  console.log('AdminRoute check:', { user, role: user?.role, loading });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#18181b] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    console.log('AdminRoute: Redirecting to / because user is not admin');
    return <Navigate to="/" replace />;
  }

  console.log('AdminRoute: Access granted');

  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><FollowingPage /></ProtectedRoute>} />
        <Route path="/browse" element={<ProtectedRoute><BrowsePage /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        <Route path="/issues" element={<ProtectedRoute><IssuesPage /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/watch/:channel" element={<ProtectedRoute><WatchPage /></ProtectedRoute>} />
        <Route path="/category/:id" element={<ProtectedRoute><CategoryPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
