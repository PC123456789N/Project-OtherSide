import { useAuth } from "../authContext/auth";

import { getDeviceId } from "../../services/DeviceIdHandler";

import {
  verifyUser,
  getCachedLastSave,
  loadFromCache,
  saveToCache,
  saveInitiativesToCache,
  savePlaylistToCache,
} from "../../services/DataCacheHandler";
import {
  getDBLastSave,
  saveInitiativesToDB,
  loadInitiativesFromDB,
  subscribeToInitiativesDB,
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

  const [scripts, setScripts] = useState({ title: "", body: "" });

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

  //makes sure user is same as before, if not, clears cache and db
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

  // atual save system, will be deleted when multi doc sync is fully implemented
  useEffect(() => {

    const timeout = setTimeout(() => {
      saveToCache(initiativeList, combats, monstersList, scripts, playlist);

      saveAllToDB(userId, initiativeList, combats, monstersList, scripts, playlist);

      setUnsavedChanges(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [
    unsavedChanges,
    //initiativeList,
    combats,
    monstersList,
    scripts,
    //playlist,
  ]);

  //syncs data when starting aplication, checks if cache or firestore is more recent and loads it
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
          cachedData.script ?? {Title: "", Body: ""},
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
        setScripts({
          title: firestoreData.scripts?.Title || "",
          body: firestoreData.scripts?.Body || "",
        });
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
        setScripts({
          title: firestoreData.scripts?.Title || "",
          body: firestoreData.scripts?.Body || "",
        });
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
        setScripts({
          title: cachedData.script.title,
          body: cachedData.script.body,
        });
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

  //tells that there are changes in InitiativesList, and triggers autosave
  useEffect(() => {
    if (isApplyingRemoteInitiativesRef.current) {
      isApplyingRemoteInitiativesRef.current = false;
      return;
    }
    console.log("initiatives changed, unsavedChangesInitiatives set to true");
    setUnsavedChangesInitiatives(true);
    unsavedChangesInitiativesRef.current = true;
  } , [initiativeList]);

  //saves data in initiatives docs, from db to db and resets dirtyflag to false;.
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
  //wip
//--------------------------------------------------------------------------------------
  //SCRIPTS SYNC BLOCK
  //wip
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
      await saveMusicsToDB(userId, deviceId, playlist); //later remove deviceId
      //await savePlaylistToCache(playlist) put in comment, due to last save not being setted
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
        scripts,
        setScripts,
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
