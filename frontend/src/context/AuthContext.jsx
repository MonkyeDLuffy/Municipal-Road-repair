import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authType, setAuthType] = useState(null);

  const loginWorker = useCallback(async (employeeId, password) => {
    setError(null);
    try {
      const data = await authApi.workerLogin(employeeId, password);
      localStorage.setItem('auth_token', data.token);
      localStorage.removeItem('citizen_token');
      localStorage.removeItem('supervisor_token');
      setUser(data.user);
      setAuthType('worker');
      return { success: true };
    } catch (err) {
      const message = err.message || 'Worker login failed.';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const registerWorker = useCallback(async (username, email, mobile, password, confirmPassword) => {
    setError(null);
    try {
      const data = await authApi.workerRegister(username, email, mobile, password, confirmPassword);
      localStorage.setItem('auth_token', data.token);
      localStorage.removeItem('citizen_token');
      localStorage.removeItem('supervisor_token');
      setUser(data.user);
      setAuthType('worker');
      return { success: true, workerId: data.user?.employeeId };
    } catch (err) {
      const message = err.message || 'Worker registration failed.';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const loginCitizen = useCallback(async (email, password) => {
    setError(null);
    try {
      const data = await authApi.citizenLogin(email, password);
      localStorage.setItem('citizen_token', data.token);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('supervisor_token');
      setUser(data.user);
      setAuthType('citizen');
      return { success: true };
    } catch (err) {
      const message = err.message || 'Citizen login failed.';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const registerCitizen = useCallback(async (name, email, password, confirmPassword) => {
    setError(null);
    try {
      const data = await authApi.citizenRegister(name, email, password, confirmPassword);
      localStorage.setItem('citizen_token', data.token);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('supervisor_token');
      setUser(data.user);
      setAuthType('citizen');
      return { success: true };
    } catch (err) {
      const message = err.message || 'Citizen registration failed.';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const loginSupervisor = useCallback(async (supervisorId, password) => {
    setError(null);
    try {
      const data = await authApi.supervisorLogin(supervisorId, password);
      localStorage.setItem('supervisor_token', data.token);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('citizen_token');
      setUser(data.user);
      setAuthType('supervisor');
      return { success: true };
    } catch (err) {
      const message = err.message || 'Supervisor login failed.';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const loginAdmin = useCallback(async (username, password) => {
    setError(null);
    try {
      const data = await authApi.adminLogin(username, password);
      localStorage.setItem('admin_token', data.token);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('citizen_token');
      localStorage.removeItem('supervisor_token');
      setUser(data.user);
      setAuthType('admin');
      return { success: true };
    } catch (err) {
      const message = err.message || 'Admin login failed.';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout API call failed:', err);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('citizen_token');
      localStorage.removeItem('supervisor_token');
      localStorage.removeItem('admin_token');
      setUser(null);
      setAuthType(null);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    const workerToken = localStorage.getItem('auth_token');
    const citizenToken = localStorage.getItem('citizen_token');
    const supervisorToken = localStorage.getItem('supervisor_token');
    const adminToken = localStorage.getItem('admin_token');
    
    if (!workerToken && !citizenToken && !supervisorToken && !adminToken) {
      setLoading(false);
      return;
    }

    try {
      const data = await authApi.me();
      setUser(data.user);
      setAuthType(data.authType);
    } catch (err) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('citizen_token');
      localStorage.removeItem('supervisor_token');
      localStorage.removeItem('admin_token');
      setUser(null);
      setAuthType(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const value = {
    user,
    loading,
    error,
    authType,
    login: loginWorker,
    loginWorker,
    loginSupervisor,
    loginAdmin,
    register: registerWorker,
    registerWorker,
    loginCitizen,
    registerCitizen,
    logout,
    isAuthenticated: !!user,
    isWorker: authType === 'worker',
    isCitizen: authType === 'citizen',
    isSupervisor: authType === 'supervisor',
    isAdmin: authType === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
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