import { useAuth } from "../authContext/auth";

import {
  verifyUser,
  getCachedLastSave,
  loadFromCache,
  saveToCache,
} from "../../services/DataCacheHandler";
import {
  getDBLastSave,
  saveInitiativesToDB,
  loadInitiativesFromDB,
  saveMusicsToDB,
  loadMusicsFromDB,
  saveAllToDB,
  loadAllFromDB,
} from "../../services/DataDBHandler";

import React, { useContext, createContext, useState, useEffect } from "react";

const DataHandler = React.createContext();

export function DataHandlerProvider({ children }) {
  //Start Standart Data Block Below
  const { userId } = useAuth();
  const { userLoggedIn } = useAuth();

  //pull userID from AuthContext
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

  const [monstersList, setMonstersList] = useState([
    {
      id: "blood_zombie",
      name: "Blood Zombie",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZPj2MX7yEFpT3bqJR0ImNDrt9z61_lSBRvst4pdi7PA&s=10",
      element: "Blood",
      type: "Boss",
      size: "Medium",

      hp: {
        current: 60,
        max: 60,
      },
      combat: {
        defense: 15,
        movement: 9,
        sanityDamage: {
          value: 15,
          damage: "2d10",
        },
      },
      attributes: {
        agility: 1,
        strength: 3,
        intellect: 0,
        presence: 0,
        vigor: 3,
      },

      skills: [
        {
          id: "skill-fortitude",
          name: "Fortitude",
          value: 3,
          bonus: 5,
          lastResult: null,
        },
        {
          id: "skill-luta",
          name: "Luta",
          value: 3,
          bonus: 6,
          lastResult: null,
        },
        {
          id: "skill-iniciativa",
          name: "Iniciativa",
          value: 2,
          bonus: 3,
          lastResult: null,
        },
        {
          id: "skill-pontaria",
          name: "Pontaria",
          value: 1,
          bonus: 0,
          lastResult: null,
        },
        {
          id: "skill-vontade",
          name: "Vontade",
          value: 2,
          bonus: 2,
          lastResult: null,
        },
      ],

      attacks: [
        {
          id: "attack-claws",
          name: "Claws",
          type: "Corpo a Corpo",
          range: "3m",
          testBonus: 8,
          damage: "2d8+5",
          threatMargin: 20,
          critMultiplier: 2,
          lastTestResult: null,
          lastCritical: false,
          lastDamageResult: null,
          lastCritDamageResult: null,
        },
      ],
      abilities: [
        {
          id: "ability-fury",
          name: "Uncontrolled Fury",
          attributeName: "Fúria Descontrolada",
          attributeDescription: "When below 50% HP, gains +2 on attack rolls.",
        },
      ],
      resistances: [
        {
          id: "resistance-blood",
          name: "Sangue",
          description: "Reduz em 10 o dano recebido do elemento Sangue.",
        },
      ],
      vulnerabilities: [{ id: "vuln-death", value: "Death" }],

      immunities: [
        { id: "immunity-fear", value: "Fear" },
        { id: "immunity-bleeding", value: "Bleeding" },
        { id: "immunity-blindness", value: "Blindness" },
      ],

      fearEnigma: "",

      description: "A creature twisted by the Blood element, driven only by violence.",
    },
  ]);

  const [scripts, setScripts] = useState({ title: "", body: "" });
  const [notesList, setNotesList] = useState([]);

  const [playlist, setPlaylist] = useState([]);
  const [videoId, setVideoId] = useState(null);

  // Histórico de rolagem de dados (compartilhado entre a CombatSidebar e as
  // abas da ficha, ex: rolagem de perícia). É estado de sessão, não é
  // salvo em cache/Firebase junto com o resto — some ao recarregar a página,
  // igual o histórico de rolagem livre já era antes.
  const [rollHistory, setRollHistory] = useState([]);

  //End Standart Data Block

  useEffect(() => {
    //Saves the SelectedPageID
    localStorage.setItem("selectedPageId", selectedPageId);
    //console.log("selectedId mudou para:", selectedPageId);
  }, [selectedPageId]);

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

  useEffect(() => {
    //if (!unsavedChanges) return;

    const timeout = setTimeout(() => {
      saveToCache(initiativeList, combats, monstersList, scripts, notesList, playlist);

      saveAllToDB(userId, initiativeList, combats, scripts, notesList, playlist);

      setUnsavedChanges(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [
    unsavedChanges,
    initiativeList,
    combats,
    monstersList,
    scripts,
    notesList,
    playlist,
    videoId,
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
          cachedData.combats,
          cachedData.script,
          cachedData.notes,
          cachedData.music,
        );

        return;
      }

      // Caso C. cache nn existe, firestore sim
      if (!cacheTime && firestoreTime) {
        console.log("Firestore encontrado, cache vazio");

        const firestoreData = await loadAllFromDB(
          userId,
          initiativeList,
          playlist,
        );

        setInitiativeList(firestoreData.initiatives);
        setScripts({
          title: firestoreData.scripts?.Title || "",
          body: firestoreData.scripts?.Body || "",
        });
        setNotesList(firestoreData.notes);
        setPlaylist(firestoreData.music);

        //place firestoreData.combats instead of null
        await saveToCache(
          firestoreData.initiatives,
          firestoreData.combat,
          firestoreData.scripts,
          firestoreData.notes,
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
        setScripts({
          title: firestoreData.scripts?.Title || "",
          body: firestoreData.scripts?.Body || "",
        });
        setNotesList(firestoreData.notes);
        setPlaylist(firestoreData.music);

        await saveToCache(firestoreData);

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
        setNotesList(cachedData.notes);

        setPlaylist(cachedData.music);

        await saveAllToDB(
          userId,
          cachedData.initiatives,
          cachedData.combats,
          cachedData.script,
          cachedData.notes,
          cachedData.music,
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
      console.error("Erro na sincronização:", error);
    }
  }

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
        notesList,
        setNotesList,
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
