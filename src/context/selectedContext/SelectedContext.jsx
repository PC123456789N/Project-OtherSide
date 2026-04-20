import { createContext, useContext, useState } from "react";

const SelectedContext = createContext();

export function SelectedProvider({ children }) {
  const [selectedId, setSelectedId] = useState(0);

  return (
    <SelectedContext.Provider value={{ selectedId, setSelectedId }}>
      {children};
    </SelectedContext.Provider>
  );
}

export function useSelected() {
  return useContext(SelectedContext);
}