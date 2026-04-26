import { useAuth } from "../authContext";

import { db } from "../../firebase/firebase";
import { onSnapshot, collection, query, where } from "firebase/firestore";


import { createContext, useContext, useState, useEffect } from "react";

const SavedState = createContext();

export function SavedStateProvider({ children }) {
  const [selectedId, setSelectedId] = useState(0);
  
  const [scriptTitle, setScriptTitle] = useState("");
  const [scriptBody, setScriptBody] = useState("");
  
  useEffect(() => {  //remove snapshot later, major security issue (exposes all users)
    onSnapshot(collection(db, "Users"), (snapshot) => {
      console.log(snapshot.docs.map((doc) => ({...doc.data(), id: doc.id}) ));
      console.log(userId)
    });
  }, [])

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