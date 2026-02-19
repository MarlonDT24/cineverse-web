import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import RoleRoute from './components/layout/RoleRoute';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MoviesPage from './pages/MoviesPage';
import CinemasPage from './pages/CinemasPage';
import SessionsPage from './pages/SessionsPage';
import ChatPage from './pages/ChatPage';
import ClientMoviesPage from './pages/ClientMoviesPage';
import ClientCinemasPage from './pages/ClientCinemasPage';
import ClientSessionsPage from './pages/ClientSessionsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                {/* Shared routes */}
                <Route index element={<DashboardPage />} />
                <Route path="chat" element={<ChatPage />} />

                {/* Staff-only routes (admin & employee) */}
                <Route element={<RoleRoute allowedRoles={['admin', 'employee']} />}>
                  <Route path="peliculas" element={<MoviesPage />} />
                  <Route path="salas" element={<CinemasPage />} />
                  <Route path="sesiones" element={<SessionsPage />} />
                </Route>

                {/* Client-only routes */}
                <Route element={<RoleRoute allowedRoles={['client']} />}>
                  <Route path="cartelera" element={<ClientMoviesPage />} />
                  <Route path="nuestras-salas" element={<ClientCinemasPage />} />
                  <Route path="sesiones-disponibles" element={<ClientSessionsPage />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
