import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [patientId, setPatientId] = useState(null);

  return (
    <AuthContext.Provider value={{ patientId, setPatientId }}>
      {children}
    </AuthContext.Provider>
  );
};
