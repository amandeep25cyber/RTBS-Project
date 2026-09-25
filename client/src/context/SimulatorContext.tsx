import {  createContext, useContext, useState } from 'react';

const SimulatorContext = createContext<any>(null);

export function SimulatorProvider({ children }) {
  // default to 10 QPS (100ms interval)
  const [isRunning, setIsRunning] = useState(true);
  const [qps, setQps] = useState(10); 

  const value = {
    isRunning,
    setIsRunning,
    qps,
    setQps
  };

  return (
    <SimulatorContext.Provider value={value}>
      {children}
    </SimulatorContext.Provider>
  );
}

export function useSimulator() {
  return useContext(SimulatorContext);
}
