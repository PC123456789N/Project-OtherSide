import { useAuth } from "../authContext/auth";

import {
  verifyUser,
  getCachedLastSave,
  loadFromCache,
  saveToCache,
  saveInitiativesToCache,
  saveCombatsToCache,
  saveMonstersToCache,
  saveScriptsToCache,
  savePlaylistToCache,
} from "../../services/DataCacheHandler";
import {
  getDBLastSave,
  saveInitiativesToDB,
  loadInitiativesFromDB,
  subscribeToInitiativesDB,
  saveCombatsToDB,
  loadCombatsFromDB,
  subscribeToCombatsDB,
  saveMonstersToDB,
  loadMonstersFromDB,
  subscribeToMonstersDB,
  saveScriptsToDB,
  loadScriptsFromDB,
  saveMusicsToDB,
  loadMusicsFromDB,
  subscribeToMusicsDB,
  saveAllToDB,
  loadAllFromDB,
} from "../../services/DataDBHandler";

import React, { useContext, createContext, useState, useEffect, useRef } from "react";

const DataHandler = React.createContext();

export function DataHandlerProvider({ children }) {
  //Start Standart Data Block Below
  
  //pull userID from AuthContext
  const { userId } = useAuth();
  const { userLoggedIn } = useAuth();

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  //alters when something changes, triggers autosave

  const [selectedPageId, setSelectedPageId] = useState(() => {
    //function to catch the PageId in LocalCache
    const savedPage = localStorage.getItem("selectedPageId");
    //console.log("INIT selectedId:", savedPage);
    return savedPage !== null ? Number(savedPage) : 2;
  });

  const [initiativeList, setInitiativeList] = useState([]);

  const [combats, setCombats] = useState([]);
  const [combatId, setCombatId] = useState(null);

  const [monstersList, setMonstersList] = useState([]);

  const [scriptsList, setScriptsList] = useState([{ id: "",title: "", body: ""}]);

  const [playlist, setPlaylist] = useState([]);
  const [videoId, setVideoId] = useState(null);


  // dirty flags for each data type, to avoid unnecessary saves when only one type changes
  const [unsavedChangesInitiatives, setUnsavedChangesInitiatives] = useState(false);
  const [unsavedChangesCombats, setUnsavedChangesCombats] = useState(false);
  const [unsavedChangesMonsters, setUnsavedChangesMonsters] = useState(false);
  const [unsavedChangesScripts, setUnsavedChangesScripts] = useState(false);
  const [unsavedChangesPlaylist, setUnsavedChangesPlaylist] = useState(false);

  const unsavedChangesInitiativesRef = useRef(false);
  const unsavedChangesCombatsRef = useRef(false);
  const unsavedChangesMonstersRef = useRef(false);
  const unsavedChangesScriptsRef = useRef(false);
  const unsavedChangesPlaylistRef = useRef(false);

  const isApplyingRemoteInitiativesRef = useRef(false);
  const isApplyingRemoteCombatsRef = useRef(false);
  const isApplyingRemoteMonstersRef = useRef(false);
  const isApplyingRemoteScriptsRef = useRef(false);
  const isApplyingRemotePlaylistRef = useRef(false);

  // Histórico de rolagem de dados (compartilhado entre a CombatSidebar e as
  // abas da ficha, ex: rolagem de perícia). É estado de sessão, não é
  // salvo em cache/Firebase junto com o resto — some ao recarregar a página,
  // igual o histórico de rolagem livre já era antes.
  const [rollHistory, setRollHistory] = useState([]);

  //End Standart Data Block

  //reloads pageid from localstorage
  useEffect(() => {
    //Saves the SelectedPageID
    localStorage.setItem("selectedPageId", selectedPageId);
    //console.log("selectedId mudou para:", selectedPageId);
  }, [selectedPageId]);

  //makes sure user is same as before, if not, clears cache and db.
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    (async () => {
      await verifyUser(userId);
      if (cancelled) return; // evita rodar syncData se o efeito foi desmontado/re-executado
      await syncData(userId);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  //syncs data when starting aplication, checks if cache or firestore is more recent and loads it.
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
          cachedData.initiatives ?? [],
          cachedData.combats ?? [],
          cachedData.monsters ?? [],
          cachedData.script ?? [{id: "",title: "", body: ""}],
          cachedData.music ?? [],
        );

        return;
      }

      // Caso C. cache nn existe, firestore sim
      if (!cacheTime && firestoreTime) {
        console.log("Firestore encontrado, cache vazio");

        const firestoreData = await loadAllFromDB(userId);

        setInitiativeList(firestoreData.initiatives);
        setCombats(firestoreData.combat);
        setMonstersList(firestoreData.monster);
        setScriptsList(firestoreData.scripts || []);
        setPlaylist(firestoreData.music);

        //place firestoreData.combat instead of null
        await saveToCache(
          firestoreData.initiatives,
          firestoreData.combat,
          firestoreData.monster,
          firestoreData.scripts,
          firestoreData.music,
        );
        return;
      }

      // Caso D. firestore mais recente, load nele; caso cache mais recente, load nele
      if (firestoreTime > cacheTime) {
        console.log("Firestore mais recente");

        const firestoreData = await loadAllFromDB(userId);

        setInitiativeList(firestoreData.initiatives);
        setCombats(firestoreData.combat);
        setMonstersList(firestoreData.monster);
        setScriptsList(firestoreData.scripts || []);
        setPlaylist(firestoreData.music);

        await saveToCache(
          firestoreData.initiatives,
          firestoreData.combat,
          firestoreData.monster,
          firestoreData.scripts,
          firestoreData.music,
        );

        return;
      }

      if (cacheTime > firestoreTime) {
        console.log("Cache mais recente");

        const cachedData = await loadFromCache();
        // console.log(cachedData.combat)

        setInitiativeList(cachedData.initiatives);
        setCombats(cachedData.combats);
        setMonstersList(cachedData.monsters);
        setScriptsList(cachedData.script);
        setPlaylist(cachedData.music);

        await saveAllToDB(
          userId,
          cachedData.initiatives,
          cachedData.combats,
          cachedData.monsters,
          cachedData.script,
          cachedData.music,
        );

        return;
      }
    } catch (error) {
      console.error("Erro na sincronização:", error);
    }
  }

//--------------------------------------------------------------------------------------
  // INITIATIVES SYNC BLOCK

  //tells that there are changes in InitiativesList, and triggers autosave.
  useEffect(() => {
    if (isApplyingRemoteInitiativesRef.current) {
      isApplyingRemoteInitiativesRef.current = false;
      return;
    }
    console.log("initiatives changed, unsavedChangesInitiatives set to true");
    setUnsavedChangesInitiatives(true);
    unsavedChangesInitiativesRef.current = true;
  } , [initiativeList]);

  //saves data in initiatives docs, from db to db and resets dirtyflag to false.
  useEffect(() => {
    const timeout = setTimeout(async () => {
      await saveInitiativesToDB(userId, initiativeList);
      await saveInitiativesToCache(initiativeList);

      setUnsavedChangesInitiatives(false);
      unsavedChangesInitiativesRef.current = false;
      console.log("saved initiatives to db and cache, unsavedChangesInitiatives set to false");
    }, 1000);
    return () => clearTimeout(timeout);
  }, [initiativeList]);

  // loads synced data in initiatives docs, from db to db.
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToInitiativesDB(userId, (syncData) => {
      const remoteInitiatives = syncData.PlayerArray || [];
      if (unsavedChangesInitiativesRef.current) {
        console.log("unsavedChangesInitiativesRef.current is true, not applying remote initiatives");
        return;
      }
      setInitiativeList(current => {
        if (JSON.stringify(current) === JSON.stringify(remoteInitiatives)) {
          return current;
        }

        isApplyingRemoteInitiativesRef.current = true;
        return remoteInitiatives;
      });
      console.log("syncing initiatives from db to db");
    });

    return () => unsubscribe();
  }, [userId]);

//--------------------------------------------------------------------------------------
  //COMBATS SYNC BLOCK

  //tells there are changes in the combats, and triggers autosave.
  useEffect(() => {
    if (isApplyingRemoteCombatsRef.current) {
      isApplyingRemoteCombatsRef.current = false;
      return;
    }
    console.log("combats changed, unsavedChangesCombats set to true");
    setUnsavedChangesCombats(true);
    unsavedChangesCombatsRef.current = true;
  } , [combats]);

  //saves data in combats docs, from db to db and resets dirtyflag to false.
  useEffect(() => {
    const timeout = setTimeout(async () => {
      await saveCombatsToDB(userId, combats);
      await saveCombatsToCache(combats);

      setUnsavedChangesCombats(false);
      unsavedChangesCombatsRef.current = false;
      console.log("saved combats to db and cache, unsavedChangesCombats set to false");
    }, 1000);
    return () => clearTimeout(timeout);
  }, [combats]);

  //loads synced data in combats docs, from db to db.
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToCombatsDB(userId, (syncData) => {
      const remoteCombats = syncData.CombatsList || [];
      if (unsavedChangesCombatsRef.current) {
        console.log("unsavedChangesCombatsRef.current is true, not applying remote combats");
        return;
      }
      setCombats(current => {
        if (JSON.stringify(current) === JSON.stringify(remoteCombats)) {
          return current;
        }

        isApplyingRemoteCombatsRef.current = true;
        return remoteCombats;
      });
      console.log("syncing combats from db to db");
    });

    return () => unsubscribe();
  }, [userId]);

//--------------------------------------------------------------------------------------
  //MONSTERS SYNC BLOCK

  //tells that there are changes in the playlist, and triggers autosave
  useEffect(() => {
    if (isApplyingRemoteMonstersRef.current) {
      isApplyingRemoteMonstersRef.current = false;
      return;
    }
    console.log("monsterslist changed, unsavedChangesMonsters set to true");
    setUnsavedChangesMonsters(true);
    unsavedChangesMonstersRef.current = true;
  } , [monstersList]);

  //saves data in monster docs, from db to db and resets dirtyflag to false.
  useEffect(() => {
    const timeout = setTimeout(async () => {
      await saveMonstersToDB(userId, monstersList);
      await saveMonstersToCache(monstersList);

      setUnsavedChangesMonsters(false);
      unsavedChangesMonstersRef.current = false;
      console.log("saved monstersList to db and cache, unsavedChangesMonsters set to false");
    }, 1000);
    return () => clearTimeout(timeout);
  }, [monstersList]);

  //loads synced data in combats docs, from db to db.
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToMonstersDB(userId, (syncData) => {
      const remoteMonsters = syncData.MonsterList || [];
      if (unsavedChangesMonstersRef.current) {
        console.log("unsavedChangesMonstersRef.current is true, not applying remote monsters");
        return;
      }
      setMonstersList(current => {
        if (JSON.stringify(current) === JSON.stringify(remoteMonsters)) {
          return current;
        }

        isApplyingRemoteMonstersRef.current = true;
        return remoteMonsters;
      });
      console.log("syncing monsters from db to db");
    });

    return () => unsubscribe();
  }, [userId]);
//--------------------------------------------------------------------------------------
  //SCRIPTS SYNC BLOCK

  //wip, doing with collab

  // atual save system, will be deleted when multi doc sync is fully implemented.
  useEffect(() => {
    //currently only works with script since others were removed for their own save system
    const timeout = setTimeout(() => {
      saveScriptsToCache(scriptsList);

      saveScriptsToDB(userId, scriptsList);

      setUnsavedChanges(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [
    unsavedChanges,
    //initiativeList,
    //combats,
    //monstersList,
    scriptsList,
    //playlist,
  ]);


//--------------------------------------------------------------------------------------
  // PLAYLIST SYNC BLOCK

  //tells that there are changes in the playlist, and triggers autosave
  useEffect(() => {
    if (isApplyingRemotePlaylistRef.current) {
      // essa mudança em `playlist` foi o próprio listener aplicando dado remoto —
      // não é uma edição do usuário, então não marca como "não salvo"
      isApplyingRemotePlaylistRef.current = false;
      return;
    }
    console.log("playlist changed, unsavedChangesPlaylist set to true");
    setUnsavedChangesPlaylist(true);
    unsavedChangesPlaylistRef.current = true;
  }, [playlist]);
  
  //saves data in musics docs, from db to db and resets dirtyflag to false;.
  useEffect(() => {
    const timeout = setTimeout(async () => {
      await saveMusicsToDB(userId, playlist); //later remove deviceId
      
      await savePlaylistToCache(playlist);

      setUnsavedChangesPlaylist(false);
      unsavedChangesPlaylistRef.current = false;
      console.log("saved playlist to db and cache, unsavedChangesPlaylist set to false");
    }, 1000);

    return () => clearTimeout(timeout);
  }, [playlist]);

  // loads synced data in musics docs, from db to db.
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToMusicsDB(userId, (syncData) => {
      const remotePlaylist = syncData.Playlist || [];
      if (unsavedChangesPlaylistRef.current) {
        console.log("unsavedChangesPlaylistRef.current is true, not applying remote playlist");
        return;
      }
      setPlaylist(current => {
        if (JSON.stringify(current) === JSON.stringify(remotePlaylist)) {
          return current;
        }

        isApplyingRemotePlaylistRef.current = true;
        return remotePlaylist;
      });
      console.log("syncing musics from db to db");
    });

    return () => unsubscribe();
  }, [userId]);

//--------------------------------------------------------------------------------------

  return (
    <DataHandler.Provider
      value={{
        unsavedChanges,
        setUnsavedChanges,
        selectedPageId,
        setSelectedPageId,
        initiativeList,
        setInitiativeList,
        combats,
        setCombats,
        combatId,
        setCombatId,
        monstersList,
        setMonstersList,
        scriptsList,
        setScriptsList,
        playlist,
        setPlaylist,
        videoId,
        setVideoId,
        rollHistory,
        setRollHistory,
      }}
    >
      {children}
    </DataHandler.Provider>
  );
}

export function useDataHandler() {
  return useContext(DataHandler);
}
