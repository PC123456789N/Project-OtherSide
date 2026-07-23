import { db } from "../firebase/firebase";
import { onSnapshot, collection, query, where, serverTimestamp } from "firebase/firestore";
import { doc ,getDoc, getDocs, setDoc } from "firebase/firestore";

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
          lastSave: serverTimestamp(),
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
        lastSave: serverTimestamp(),
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

export async function saveCombatsToDB(userId, combats, monsterList) {
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
          lastSave: serverTimestamp(),
          UserId: userId,
          CombatsList: combats,
          MonsterList: monsterList
        }
      );
      console.log("doc firestore/Combats Criado")
      return;
    }

    await setDoc( //ja havia um docs la
      doc(db, "Combats", snapshot.docs[0].id), //primeiro docs
      {
        lastSave: serverTimestamp(),
        UserId: userId,
        CombatsList: combats,
        MonsterList: monsterList
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

export async function saveScriptsToDB(userId, scripts, notesList){
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
          lastSave: serverTimestamp(),
          UserId: userId,
          NotesList: notesList || [{title: "Exemplo de nota", content: "1Esta é uma nota de exemplo. Você pode adicionar, editar e excluir notas conforme necessário."}],
          ScriptDoc: {Title: scripts?.title || "", Body: scripts?.body || ""},
        }
      );
      console.log("doc firestore/Scripts Criado")
      return;
    }

    await setDoc( //ja havia um docs la
      doc(db, "Scripts", snapshot.docs[0].id), //primeiro docs
      {
        lastSave: serverTimestamp(),
        UserId: userId,
        NotesList: notesList || [{title: "Exemplo de nota", content: "2Esta é uma nota de exemplo. Você pode adicionar, editar e excluir notas conforme necessário."}],
        ScriptDoc: {Title: scripts?.title || "fuck me", Body: scripts?.body || "fuck me 2"},
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
          lastSave: serverTimestamp(),
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
        lastSave: serverTimestamp(),
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

export async function saveAllToDB(userId, initiativeList, combats, monsterList, scripts, notesList, playlist) {
  
  await saveInitiativesToDB(userId, initiativeList);
  await saveCombatsToDB(userId, combats, monsterList);
  await saveScriptsToDB(userId, scripts, notesList);
  await saveMusicsToDB(userId, playlist);
}

export async function loadAllFromDB(userId) {
  const initiativesData = await loadInitiativesFromDB(userId);
  const combatsData = await loadCombatsFromDB(userId);
  const musicsData = await loadMusicsFromDB(userId);
  const scriptsData = await loadScriptsFromDB(userId);

  return {
    initiatives: initiativesData?.PlayerArray ?? [],
    combat: combatsData?.CombatsList ?? [],
    monster: combatsData?.MonsterList ?? [],
    music: musicsData.Playlist ?? [],
    scripts: scriptsData?.ScriptDoc ?? {Title: "", Body: ""},
    notes: scriptsData?.NotesList ?? []
  };
}
