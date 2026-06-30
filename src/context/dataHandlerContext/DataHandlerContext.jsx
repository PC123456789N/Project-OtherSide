import { useAuth } from "../authContext/auth";

import { verifyUser, getCachedLastSave, loadFromCache, saveToCache } from "../../services/DataCacheHandler";
import { getDBLastSave, saveInitiativesToDB, loadInitiativesFromDB, saveMusicsToDB, loadMusicsFromDB, saveAllToDB, loadAllFromDB } from "../../services/DataDBHandler";

import React, { useContext, createContext, useState, useEffect } from "react";

const DataHandler = React.createContext();

export function DataHandlerProvider({ children }) {

  //Start Standart Data Block Below
  const { userId } = useAuth();
  const {userLoggedIn} = useAuth();


  //pull userID from AuthContext
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  //alters when something changes, triggers autosave
 

  const [selectedPageId, setSelectedPageId] = useState(() => { 
    //function to catch the PageId in LocalCache
    const savedPage = localStorage.getItem("selectedPageId");
    //console.log("INIT selectedId:", savedPage);
    return savedPage !== null
      ? Number(savedPage)
      : 2;
  });

  const [initiativeList, setInitiativeList] = useState([]);

  const [scriptTitle, setScriptTitle] = useState("");
  const [scriptBody, setScriptBody] = useState("");

  const [playlist, setPlaylist] = useState([]);
  const [videoId, setVideoId] = useState(null);
  
  //End Standart Data Block

  useEffect(() => { //Saves the SelectedPageID
    localStorage.setItem(
      "selectedPageId",
      selectedPageId
    );
    //console.log("selectedId mudou para:", selectedPageId);
  }, [selectedPageId]);

  useEffect(() => { //verifica se o usuario tem o id registrado no IDB, se nn limpa o cache
    if (!userId) return;
    verifyUser(userId);
  }, [userId]);

  // useEffect(() => {
  //   async function loadData() {
  //     const data = await loadFromCache();

  //     if (data.initiatives) {
  //       setInitiativeList(data.initiatives);
  //     }

  //     if (data.script) {
  //       setScriptTitle(data.script.title || "");
  //       setScriptBody(data.script.body || "");
  //     }

  //     if (data.music) {
  //       setPlaylist(data.music.playlist || []);
  //       setVideoId(data.music.videoId || null);
  //     }
  //   }

  //   loadData();
  // },[])

  useEffect(() => {
    //if (!unsavedChanges) return;

    const timeout = setTimeout(() => {
      saveToCache( initiativeList, scriptTitle, scriptBody, playlist, videoId);
      
      saveAllToDB(userId, initiativeList, playlist)
      
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

  // useEffect(() => {
  //   //if (!unsavedChanges) return;

  //   const timeout = setTimeout(async () => {
  //     await saveInitiativesToDB(userId, initiativeList);
  //     setUnsavedChanges(false);
  //   }, 3000);

  //   return () => clearTimeout(timeout);

  // }, [unsavedChanges, userId, initiativeList]);

  async function syncData(userId) {
    try {
      const cacheTime = await getCachedLastSave();
      const firestoreTime = await getDBLastSave(userId);

      // Caso A, nenhum existe
      if (!cacheTime && !firestoreTime) {
        console.log("Novo usuário");
        return;
      }

      // Caso B. cache existe, firestore nn
      if (cacheTime && !firestoreTime) {
        console.log("Cache encontrado, Firestore vazio");

        const cachedData = await loadFromCache();

        await saveAllToDB(
          userId,
          cachedData.initiatives,
          cachedData.music
        );

        return;
      }

      // Caso C. cache nn existe, firestore sim 
      if (!cacheTime && firestoreTime) {
        console.log("Firestore encontrado, cache vazio");

        const firestoreData = await loadAllFromDB(userId, initiativeList, playlist);

        setInitiativeList(
          firestoreData.initiatives
        );
        setPlaylist(
          firestoreData.music
        )

        await saveToCache(firestoreData);

        return;
      }

      // Caso D. firestore mais recente, load nele; caso cache mais recente, load nele
      if (firestoreTime > cacheTime) {
        console.log("Firestore mais recente");

        const firestoreData = await loadAllFromDB(userId, initiativeList, playlist);

        setInitiativeList(
          firestoreData.initiatives
        );
        setPlaylist(
          firestoreData.music
        )

        await saveToCache(firestoreData);

        return;
      }

      if (cacheTime > firestoreTime) {
        console.log("Cache mais recente");

        const cachedData = await loadFromCache();

        setInitiativeList(
          cachedData.initiatives
        );
        setPlaylist(
          cachedData.music.playlist
        )

        await saveAllToDB(
          userId,
          cachedData.initiatives,
          cachedData.music
        );

        return;
      }

      // Iguais
      console.log("Dados sincronizados");

      const cachedData = await loadFromCache();

      setInitiativeList(
        cachedData.initiatives
      );
      setPlaylist(
        {
          nome: "wablua1"
        }
      )

    } catch (error) {
      console.error(
        "Erro na sincronização:",
        error
      );
    }
  }

  useEffect(() => {
    if(userId){
      syncData(userId);
    }
  }, [])

  return (
    <DataHandler.Provider value={{
      unsavedChanges, setUnsavedChanges, 
      selectedPageId, setSelectedPageId,
      scriptTitle, setScriptTitle,
      scriptBody, setScriptBody,
      initiativeList, setInitiativeList,
      playlist, setPlaylist,
      videoId, setVideoId
    }}>
      {children}
    </DataHandler.Provider>
  );
}

export function useDataHandler() {
  return useContext(DataHandler);
}
