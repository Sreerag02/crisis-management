import React, { useState, useEffect } from 'react';
import { AppCtx } from './AppCtx';

export const AppProvider = ({ children }) => {
  const [page, setPage] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setPage('dashboard');
  };

  const loginAs = (role) => {
    // This was for mocking, we keep it but it won't be used by real AuthPage
    const rolesMap = {
      admin: { id: 'admin_1', name: 'Admin Coordinator', role: 'admin', email: 'admin@crisisnet.gov', avatar: 'AC' },
      user: { id: 'user_1', name: 'Citizen John', role: 'user', email: 'john@example.com', avatar: 'CJ' },
      volunteer: { id: 'vol_1', name: 'Volunteer Sam', role: 'volunteer', email: 'sam@volunteers.in', avatar: 'VS' }
    };
    const mockUser = rolesMap[role] || rolesMap.user;
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    setPage('dashboard');
  };

  return (
    <AppCtx.Provider value={{
      page, setPage,
      user, setUser,
      logout, loginAs,
      loading
    }}>
      {children}
    </AppCtx.Provider>
  );
};
