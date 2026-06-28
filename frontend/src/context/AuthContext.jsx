import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });

  const fetchUsers = async () => {
    if (!token) return;
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users list in context', err);
    }
  };

  // Fetch full user profile details & stats
  const loadProfile = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      if (res.data.stats) {
        setStats(res.data.stats);
      }
      localStorage.setItem('user', JSON.stringify(res.data));
      fetchUsers();
    } catch (err) {
      console.error('Failed to load user profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [token]);

  // Register user
  const register = async (name, email, password, orgMode, orgName, orgId) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password, orgMode, orgName, orgId });
      const { token: userToken, user: userData } = res.data;
      
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(userToken);
      setUser(userData);
      
      toast.success('Registration successful!');
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed.';
      toast.error(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: userToken, user: userData } = res.data;
      
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(userToken);
      setUser(userData);
      
      toast.success('Welcome back!');
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed.';
      toast.error(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setStats({
      totalProjects: 0,
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
    });
    toast.success('Logged out successfully.');
  };

  // Update profile name
  const updateName = async (name) => {
    setLoading(true);
    try {
      const res = await api.put('/auth/me', { name });
      const updatedUserData = { ...user, name: res.data.name };
      
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      setUser(updatedUserData);
      
      toast.success('Name updated successfully!');
      loadProfile();
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Update failed.';
      toast.error(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        users,
        register,
        login,
        logout,
        updateName,
        fetchUsers,
        stats,
        refreshStats: loadProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
