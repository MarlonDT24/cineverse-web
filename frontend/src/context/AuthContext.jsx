import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al montar: restaurar sesión desde localStorage
  useEffect(() => {
    const token = localStorage.getItem('cineverse_token');
    const savedUser = localStorage.getItem('cineverse_user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('cineverse_token');
        localStorage.removeItem('cineverse_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const data = response.data;

      // api.js interceptor convierte camelCase → snake_case
      const token = data.token;
      const userData = {
        id: data.id,
        username: data.username,
        email: data.email,
        name: `${data.first_name} ${data.last_name}`,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role?.toLowerCase(),
      };

      localStorage.setItem('cineverse_token', token);
      localStorage.setItem('cineverse_user', JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.error || 'Error de conexión con el servidor';
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('cineverse_token');
    localStorage.removeItem('cineverse_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
