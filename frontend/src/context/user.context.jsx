import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [passError, setPassError ] = useState(null);
  const [openChat, setOpenChat] = useState(false);

  return (
    <UserContext.Provider value={{ user, setUser, passError, setPassError, openChat, setOpenChat }}>
      {children}
    </UserContext.Provider>
  );
};
