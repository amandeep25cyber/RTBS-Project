import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for mocked session
    const storedUser = localStorage.getItem('rtb_mock_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch(e) {}
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const userData = await authService.login(email, password);
    setUser(userData);
    localStorage.setItem('rtb_mock_user', JSON.stringify(userData));
    return userData;
  };

  const signup = async (userData) => {
    const newUser = await authService.signup(userData);
    setUser(newUser);
    localStorage.setItem('rtb_mock_user', JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rtb_mock_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
