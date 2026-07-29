import { db } from "../firebase/firebase";
import { onSnapshot, collection, query, where, serverTimestamp } from "firebase/firestore";
import { doc ,getDoc, getDocs, setDoc } from "firebase/firestore";

//make any individual change update central lastSave

export async function getDBLastSave(userId) {
  const docRef = doc(db, "Users", userId,);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()){
    const serverData = docSnap.data()

    const firestoreLastSave = serverData.LastSave;

    if (firestoreLastSave) {
      const LastSave = firestoreLastSave.toDate().getTime();
      return LastSave;
    }
    console.log("no LastSaved timestamp here!") 
    return null;
      
  } else {
    console.log("Documento não encontrado!");
  }
}

export async function setDBLastSave(userId) {
  if (!userId){
    console.error("userId is undefined or null. Cannot set LastSave in Firestore.");
    return;
  };

  console.log("doc firestore/Users atualizado")
  await setDoc( //ja havia um docs la
    doc(db, "Users", userId), //primeiro docs
    {
      LastSave: serverTimestamp(),
    }, { merge: true }
  );
}

//--------------------------------------------------------------------------------------
//INITIATIVES BLOCK

export async function saveInitiativesToDB(userId, initiativeList) {
  //console.log("userId:", userId);
  //console.log("initiativeList:", initiativeList);
  
  try{
    const q = query(
    collection(db, "Initiatives"),
    where("UserId", "==", userId)
  );
  
  const snapshot = await getDocs(q);
  
    if (snapshot.empty) { //nn havia docs la
      await setDoc(
        doc(collection(db, "Initiatives")), 
        {
          UserId: userId,
          PlayerArray: initiativeList,
        }
      );
      console.log("doc firestore Criado")
      return;
    }

    await setDoc( //ja havia um docs la
      doc(db, "Initiatives", snapshot.docs[0].id), //primeiro docs
      {
        UserId: userId,
        PlayerArray: initiativeList,
      }
    );
    console.log("doc firestore/initiatives atualizado")
    return;
  } 
  
  catch(error){
    console.error("Erro ao salvar:", error);
  }
}

export async function loadInitiativesFromDB(userId) {
  console.log("loaded initiatives from firestore")
  const q = query(
    collection(db, "Initiatives"),
    where("UserId", "==", userId)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data();
}

export function subscribeToInitiativesDB(userId, onChange) {

  const q = query(
    collection(db, "Initiatives"),
    where("UserId", "==", userId)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    if (snapshot.empty){
      console.log("snapshot/Initiatives nn existe")
      return;
    };
    
    const InitiativesDoc = snapshot.docs[0];
    console.log("snapshot data Initiatives pulled:", InitiativesDoc.data());
    onChange(InitiativesDoc.data()); // repassa o dado cru, sem decidir nada
  });

  return unsubscribe;
}

//--------------------------------------------------------------------------------------
//COMBATS BLOCK
export async function saveCombatsToDB(userId, combats) {
  try{
    const q = query(
    collection(db, "Combats"),
    where("UserId", "==", userId)
  );
  
  const snapshot = await getDocs(q);
  
    if (snapshot.empty) { //nn havia docs la
      await setDoc(
        doc(collection(db, "Combats")), 
        {
          UserId: userId,
          CombatsList: combats,
        }
      );
      console.log("doc firestore/Combats Criado")
      return;
    }

    await setDoc( //ja havia um docs la
      doc(db, "Combats", snapshot.docs[0].id), //primeiro docs
      {
        UserId: userId,
        CombatsList: combats,
      }
    );
    console.log("doc firestore/Combats atualizado")
    return;
  } 
  
  catch(error){
    console.error("Erro ao salvar:", error);
  }
}

export async function loadCombatsFromDB(userId) {
  console.log("loaded combats from firestore")
  const q = query(
    collection(db, "Combats"),
    where("UserId", "==", userId)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data();
}

export function subscribeToCombatsDB(userId, onChange) {

  const q = query(
    collection(db, "Combats"),
    where("UserId", "==", userId)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    if (snapshot.empty){
      console.log("snapshot/Combats nn existe")
      return;
    };
    
    const CombatsDoc = snapshot.docs[0];
    console.log("snapshot data Combats pulled:", CombatsDoc.data());
    onChange(CombatsDoc.data()); // repassa o dado cru, sem decidir nada
  });

  return unsubscribe;
}

//--------------------------------------------------------------------------------------
//MONSTERS BLOCK
export async function saveMonstersToDB(userId, monsterList) {
  try{
    const q = query(
    collection(db, "Monsters"),
    where("UserId", "==", userId)
  );
  
  const snapshot = await getDocs(q);
  
    if (snapshot.empty) { //nn havia docs la
      await setDoc(
        doc(collection(db, "Monsters")), 
        {
          UserId: userId,
          MonsterList: monsterList
        }
      );
      console.log("doc firestore/Monsters Criado")
      return;
    }

    await setDoc( //ja havia um docs la
      doc(db, "Monsters", snapshot.docs[0].id), //primeiro docs
      {
        UserId: userId,
        MonsterList: monsterList
      }
    );
    console.log("doc firestore/Monsters atualizado")
    return;
  } 
  
  catch(error){
    console.error("Erro ao salvar:", error);
  }
}

export async function loadMonstersFromDB(userId) {
  console.log("loaded monsters from firestore")
  const q = query(
    collection(db, "Monsters"),
    where("UserId", "==", userId)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data();
}

export function subscribeToMonstersDB(userId, onChange) {

  const q = query(
    collection(db, "Monsters"),
    where("UserId", "==", userId)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    if (snapshot.empty){
      console.log("snapshot/Monsters nn existe")
      return;
    };
    
    const MonstersDoc = snapshot.docs[0];
    console.log("snapshot data Monsters pulled:", MonstersDoc.data());
    onChange(MonstersDoc.data()); // repassa o dado cru, sem decidir nada
  });

  return unsubscribe;
}

//--------------------------------------------------------------------------------------
//SCRIPTS BLOCK
export async function saveScriptsToDB(userId, scripts){
  try{
    const q = query(
    collection(db, "Scripts"),
    where("UserId", "==", userId)
  );
  
  const snapshot = await getDocs(q);
  
    if (snapshot.empty) { //nn havia docs la
      await setDoc(
        doc(collection(db, "Scripts")), 
        {
          UserId: userId,
          ScriptDocs: scripts
        }
      );
      console.log("doc firestore/Scripts Criado")
      return;
    }

    await setDoc( //ja havia um docs la
      doc(db, "Scripts", snapshot.docs[0].id), //primeiro docs
      {
        UserId: userId,
        ScriptDocs: scripts,
      }
    );
    console.log("doc firestore/Scripts atualizado")
    return;
  } 
  
  catch(error){
    console.error("Erro ao salvar:", error);
  }
}

export async function loadScriptsFromDB(userId){
  console.log("loaded scripts from firestore")
  const q = query(
    collection(db, "Scripts"),
    where("UserId", "==", userId)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data();
}

//collab with tip tap

//--------------------------------------------------------------------------------------
//MUSICS BLOCK
export async function saveMusicsToDB(userId, playlist) {
  //console.trace("saveMusicsToDB chamado com:", playlist);
  //console.log("userId:", userId);
  //console.log("initiativeList:", initiativeList);
  //console.log("SALVANDO PLAYLIST:", playlist);
  // console.log("PLAYLIST DEBUG:", playlist);
  // console.log(JSON.stringify(playlist, null, 2));
  try{
    const q = query(
    collection(db, "Musics"),
    where("UserId", "==", userId)
  );
  
  const snapshot = await getDocs(q);
  
    if (snapshot.empty) { //nn havia docs la
      await setDoc(
        doc(collection(db, "Musics")), 
        {
          UserId: userId,
          Playlist: playlist,
        }
      );
      console.log("doc firestore/Musics Criado")
      return;
    }

    console.log(playlist)
    await setDoc( //ja havia um docs la
      doc(db, "Musics", snapshot.docs[0].id), //primeiro docs
      {
        UserId: userId,
        Playlist: playlist,
      }
    );
    console.log("doc firestore/Musics atualizado")
    return;
  } 
  
  catch(error){
    console.error("Erro ao salvar:", error);
  }
}

export async function loadMusicsFromDB(userId) {
  console.log("loaded musics from firestore")
  const q = query(
    collection(db, "Musics"),
    where("UserId", "==", userId)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.log("nenhum documento de músicas encontrado para esse usuário");
    return null;
  }

  console.log(snapshot.docs[0].data())
  return snapshot.docs[0].data();
}

export function subscribeToMusicsDB(userId, onChange) {

  const q = query(
    collection(db, "Musics"),
    where("UserId", "==", userId)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    if (snapshot.empty){
      console.log("snapshot/musics nn existe")
      return;
    };
    
    const musicDoc = snapshot.docs[0];
    console.log("snapshot data musics pulled:", musicDoc.data());
    onChange(musicDoc.data()); // repassa o dado cru, sem decidir nada
  });

  return unsubscribe;
}

//--------------------------------------------------------------------------------------
//GENERAL BLOCK
export async function saveAllToDB(userId, initiativeList, combats, monsterList, scripts, playlist) {
  
  await saveInitiativesToDB(userId, initiativeList);
  await saveCombatsToDB(userId, combats);
  await saveMonstersToDB(userId, monsterList)
  await saveScriptsToDB(userId, scripts);
  await saveMusicsToDB(userId, playlist);

  await setDBLastSave(userId);
}

export async function loadAllFromDB(userId) {
  const initiativesData = await loadInitiativesFromDB(userId);
  const combatsData = await loadCombatsFromDB(userId);
  const monstersData = await loadMonstersFromDB(userId)
  const musicsData = await loadMusicsFromDB(userId);
  const scriptsData = await loadScriptsFromDB(userId);

  return {
    initiatives: initiativesData?.PlayerArray ?? [],
    combat: combatsData?.CombatsList ?? [],
    monster: monstersData?.MonsterList ?? [],
    scripts: scriptsData?.ScriptDocs ?? [],
    music: musicsData.Playlist ?? [],
  };
}
