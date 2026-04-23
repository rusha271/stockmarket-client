"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface APICounterContextProps {
  count: number;
  increment: () => void;
  reset: () => void;
}

const APICounterContext = createContext<APICounterContextProps | undefined>(undefined);

export const useAPICounter = () => {
  const context = useContext(APICounterContext);
  if (!context) throw new Error('useAPICounter must be used within APICounterProvider');
  return context;
};

export const APICounterProvider = ({ children }: { children: ReactNode }) => {
  const [count, setCount] = useState(0);

  const increment = () => setCount((c) => c + 1);
  const reset = () => setCount(0);

  return (
    <APICounterContext.Provider value={{ count, increment, reset }}>
      {children}
    </APICounterContext.Provider>
  );
}; 