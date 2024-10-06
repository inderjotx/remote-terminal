"use client";

import { createContext, useContext, useState } from "react";

interface ContainerContextType {
  containerName: string;
  setContainerName: (id: string) => void;
}

const ContainerContext = createContext<ContainerContextType>({
  containerName: "",
  setContainerName: () => {},
});

export function ContainerProvider({ children }: { children: React.ReactNode }) {
  const [containerName, setContainerName] = useState<string>("");

  return (
    <ContainerContext.Provider value={{ containerName, setContainerName }}>
      {children}
    </ContainerContext.Provider>
  );
}

export function useContainer() {
  const context = useContext(ContainerContext);
  if (!context) {
    throw new Error("useContainer must be used within a ContainerProvider");
  }
  return context;
}
