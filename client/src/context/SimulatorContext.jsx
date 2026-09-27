import React, { createContext, useContext, useState } from 'react';

export const SimulatorContext = createContext({ rate: 1000, running: true, setRate: () => {}, setRunning: () => {} });

export const SimulatorProvider = ({ children }) => {
  const [rate, setRate] = useState(1000);     // ms between events (1000 = 1/sec)
  const [running, setRunning] = useState(true);

  return (
    <SimulatorContext.Provider value={{ rate, setRate, running, setRunning }}>
      {children}
    </SimulatorContext.Provider>
  );
};

export const useSimulator = () => useContext(SimulatorContext);
