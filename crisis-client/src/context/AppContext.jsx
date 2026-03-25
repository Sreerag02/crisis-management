import React, { useState } from 'react';
import { AppCtx } from './AppCtx';

export const AppProvider = ({ children }) => {
  const [page, setPage] = useState('dashboard');
  const [user, setUser] = useState({ name: 'Admin User', role: 'Regional Coordinator', avatar: 'AU' });

  return (
    <AppCtx.Provider value={{
      page, setPage,
      user, setUser
    }}>
      {children}
    </AppCtx.Provider>
  );
};
