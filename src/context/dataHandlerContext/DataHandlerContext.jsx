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

  const [combats, setCombats] = useState([]);
  const [combatId, setCombatId] = useState(null);

  const [scripts, setScripts] = useState({title: "", body: ""});
  const [notesList, setNotesList] = useState([])

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

  useEffect(() => {
    //if (!unsavedChanges) return;

    const timeout = setTimeout(() => {
      saveToCache( initiativeList, combats , scripts, notesList , playlist);
      
      saveAllToDB(userId, initiativeList, playlist)
      
      setUnsavedChanges(false);
    }, 1000);

    return () => clearTimeout(timeout);

  }, [
    unsavedChanges,
    initiativeList,
    combats,
    scripts,
    notesList,
    playlist,
    videoId
  ]);

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
        console.log(cachedData.combat)

        setInitiativeList(
          cachedData.initiatives
        );

        setCombats(
          cachedData.combat
        )

        setScripts({
          title: cachedData.script.title,
          body: cachedData.script.body,
        })
        setNotesList(
          cachedData.notes
        )

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

      // Iguais WIP
      // console.log("Dados sincronizados");

      // const cachedData = await loadFromCache();

      // setInitiativeList(
      //   cachedData.initiatives
      // );
      // setPlaylist(
      //   {
      //     nome: "wablua1"
      //   }
      // )

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
      initiativeList, setInitiativeList,
      combats, setCombats,
      combatId, setCombatId,
      scripts, setScripts,
      notesList, setNotesList,
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
