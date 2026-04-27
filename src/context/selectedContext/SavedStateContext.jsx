import { useAuth } from "../authContext";

import { db } from "../../firebase/firebase";
import { onSnapshot, collection, query, where } from "firebase/firestore";


import { createContext, useContext, useState, useEffect } from "react";

const SavedState = createContext();

export function SavedStateProvider({ children }) {
  
  //insert all these states in local storage as cache
  const { userId } = useAuth();
  const [selectedId, setSelectedId] = useState(0);
  
  const [initiativeList, setInitiativeList] = useState([]);

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
      initiativeList, setInitiativeList
    }}>
      {children};
    </SavedState.Provider>
  );
}

export function useSavedState() {
  return useContext(SavedState);
}