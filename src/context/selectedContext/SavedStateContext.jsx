import { createContext, useContext, useState } from "react";

const SavedState = createContext();

export function SavedStateProvider({ children }) {
  const [selectedId, setSelectedId] = useState(0);

  const [scriptTitle, setScriptTitle] = useState("");
  const [scriptBody, setScriptBody] = useState("");

  return (
    <SavedState.Provider value={{ 
      selectedId, setSelectedId, 
      scriptTitle, setScriptTitle,
      scriptBody, setScriptBody,
    }}>
      {children};
    </SavedState.Provider>
  );
}

export function useSavedState() {
  return useContext(SavedState);
}