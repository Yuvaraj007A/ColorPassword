import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

const API_BASE_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [currentView, setCurrentView] = useState('landing');
  
  // Customization settings
  const theme = 'dark';
  const setTheme = () => {};
  const [accessibilityMode, setAccessibilityMode] = useState(localStorage.getItem('accessibilityMode') === 'true');
  const [colorBlindMode, setColorBlindMode] = useState(localStorage.getItem('colorBlindMode') || 'none'); // 'none', 'protanopia', 'deuteranopia', 'tritanopia'

  // Device Fingerprint simulation
  const [deviceFingerprint, setDeviceFingerprint] = useState('');

  useEffect(() => {
    // Generate simple device fingerprint
    const fp = `${navigator.userAgent}-${navigator.language}-${screen.colorDepth}`;
    setDeviceFingerprint(fp);

    if (token) {
      // Decode JWT simple payload
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const expiry = payload.exp * 1000;
          if (expiry > Date.now()) {
            setUser({
              id: payload.id,
              username: payload.username,
              isAdmin: payload.isAdmin
            });
            setCurrentView(payload.isAdmin ? 'admin' : 'dashboard');
          } else {
            logout();
          }
        }
      } catch (e) {
        logout();
      }
    }
  }, [token]);

  // Apply theme class to document element
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('dark');
    root.classList.remove('light');
    localStorage.setItem('theme', 'dark');
  }, []);

  // Apply accessibility / color blind modes
  useEffect(() => {
    localStorage.setItem('accessibilityMode', accessibilityMode);
    localStorage.setItem('colorBlindMode', colorBlindMode);
  }, [accessibilityMode, colorBlindMode]);

  const navigateTo = (view) => {
    setCurrentView(view);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setCurrentView('login');
  };

  const checkUsername = async (username) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-username`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      return { status: response.status, data };
    } catch (error) {
      return { status: 500, data: { error: 'Network connection error' } };
    }
  };

  const registerUser = async (username, email, colors) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, colors }),
      });
      const data = await response.json();
      return { status: response.status, data };
    } catch (error) {
      return { status: 500, data: { error: 'Network connection error' } };
    }
  };

  const loginUser = async (username, colors, captchaSolved = false) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Device-Fingerprint': deviceFingerprint
        },
        body: JSON.stringify({ username, colors, captchaSolved }),
      });

      const data = await response.json();

      if (response.status === 200) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        setCurrentView(data.user.isAdmin ? 'admin' : 'dashboard');
      }

      return { status: response.status, data };
    } catch (error) {
      return { status: 500, data: { error: 'Network connection error' } };
    }
  };

  const fetchWithAuth = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };
    return fetch(`${API_BASE_URL}${url}`, { ...options, headers });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        currentView,
        theme,
        accessibilityMode,
        colorBlindMode,
        setTheme,
        setAccessibilityMode,
        setColorBlindMode,
        navigateTo,
        logout,
        checkUsername,
        registerUser,
        loginUser,
        fetchWithAuth,
        API_BASE_URL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
