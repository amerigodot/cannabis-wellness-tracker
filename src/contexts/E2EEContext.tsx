import React, { createContext, useContext, ReactNode } from "react";
import { useE2EE } from "@/hooks/useE2EE";

type E2EEContextType = ReturnType<typeof useE2EE>;

const E2EEContext = createContext<E2EEContextType | null>(null);

export const E2EEProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const e2ee = useE2EE();
  return <E2EEContext.Provider value={e2ee}>{children}</E2EEContext.Provider>;
};

export const useE2EEContext = () => {
  const context = useContext(E2EEContext);
  if (!context) {
    throw new Error("useE2EEContext must be used within an E2EEProvider");
  }
  return context;
};
