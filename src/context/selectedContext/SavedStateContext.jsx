import { useAuth } from "../authContext/auth.jsx";

import { db } from "../../firebase/firebase";
import { onSnapshot, collection, query, where } from "firebase/firestore";
import { openDB } from "idb";


import { createContext, useContext, useState, useEffect } from "react";

//creates the IndexedDB and their respective tables block, not the firebase one
const dbPromise = openDB("app_web", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("metadata")) {
      db.createObjectStore("metadata");
    }
    if (!db.objectStoreNames.contains("initiatives")) {
      db.createObjectStore("initiatives");
    }
    if (!db.objectStoreNames.contains("combats")) {
      db.createObjectStore("combats");
    }
    if (!db.objectStoreNames.contains("scripts")) {
      db.createObjectStore("scripts");
    }
    if (!db.objectStoreNames.contains("musics")) {
      db.createObjectStore("musics");
    }
  }
})

//creates the context itself
const SavedState = createContext();

export function SavedStateProvider({ children }) {
  //all these states will go into local storage as cache, but it also control the whole app

  const { userId } = useAuth();

  const [unsavedChanges, setUnsavedChanges] = useState(false)

  const [selectedId, setSelectedId] = useState(() => {
    const saved = localStorage.getItem("selectedId");

    console.log("INIT selectedId:", saved);

    return saved !== null
      ? Number(saved)
      : 2;
  });
  
  const [initiativeList, setInitiativeList] = useState([]);

  const [scriptTitle, setScriptTitle] = useState("");
  const [scriptBody, setScriptBody] = useState("");

  const [playlist, setPlaylist] = useState([]);
  const [videoId, setVideoId] = useState(null);

  //This function saves the data of the other things on the Cache, making it easier later into the useEffect.
  async function saveToCache() {
    const cache = await dbPromise;

    await cache.put(
      "initiatives",
      initiativeList,
      "current"
    );
    await cache.put(
      "scripts",
      {
        title: scriptTitle,
        body: scriptBody
      },
      "current"
    );

    await cache.put(
      "musics",
      {
        playlist,
        videoId
      },
      "current"
    );

    console.log("saved State into IndexDB")
  }

  
  useEffect(() => {  //remove snapshot later, major security issue (exposes all users)
    onSnapshot(collection(db, "Users"), (snapshot) => {
      //console.log(snapshot.docs.map((doc) => ({...doc.data(), id: doc.id}) ));
      //console.log(userId)
    });
  }, [])

  //verifies User and clears DB block, when user is the same, it pulls data from the IndexDB
  useEffect(() => {
    async function verifyUser(){
      const cache = await dbPromise;

      const cachedUserId = await cache.get("metadata", "currentUserId")

      if(cachedUserId !== userId){
        console.log("not SameUser Data, creating new Table")
        await cache.clear("initiatives");
        await cache.clear("combats");
        await cache.clear("scripts");
        await cache.clear("musics");

        await cache.put("metadata",userId,"currentUserId");
      } 
      
      else{
        console.log("sameUser Data, pulling data from IndexDB");

        const initiatives = await cache.get(
          "initiatives",
          "current"
        );
        const script = await cache.get(
          "scripts",
          "current"
        );
        const music = await cache.get(
          "musics",
          "current"
        );
        if (initiatives) {
          setInitiativeList(initiatives);
        }
        if (script) {
          setScriptTitle(script.title || "");
          setScriptBody(script.body || "");
        }
        if (music) {
          setPlaylist(music.playlist || []);
          setVideoId(music.videoId || null);
        }
      }
    };

    if(userId){
      verifyUser();
    }
  }, [userId])

  //this use effect saves the data into the cache each time the data changes, but it only does so after 5 seconds
  useEffect(() => {
    if (!unsavedChanges) return;

    const timeout = setTimeout(() => {
      saveToCache();
      setUnsavedChanges(false);
    }, 1000);

    return () => clearTimeout(timeout);

  }, [
    unsavedChanges,
    scriptBody,
    scriptTitle,
    initiativeList,
    playlist,
    videoId
  ]);

  useEffect(() => {
    localStorage.setItem(
      "selectedId",
      selectedId
    );
    console.log("selectedId mudou para:", selectedId);
  }, [selectedId]);


  return (
    <SavedState.Provider value={{
      unsavedChanges, setUnsavedChanges, 
      selectedId, setSelectedId, 
      scriptTitle, setScriptTitle,
      scriptBody, setScriptBody,
      initiativeList, setInitiativeList,
      playlist, setPlaylist,
      videoId, setVideoId
    }}>
      {children};
    </SavedState.Provider>
  );
}

export function useSavedState() {
  return useContext(SavedState);
}