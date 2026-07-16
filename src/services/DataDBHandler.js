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
    console.log("doc firestore atualizado")
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


export async function saveMusicsToDB(userId, playlist) {
  //console.log("userId:", userId);
  //console.log("initiativeList:", initiativeList);
  // console.log("SALVANDO PLAYLIST:", playlist);
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
      console.log("doc firestore/musics Criado")
      return;
    }

    await setDoc( //ja havia um docs la
      doc(db, "Musics", snapshot.docs[0].id), //primeiro docs
      {
        lastSave: serverTimestamp(),
        UserId: userId,
        Playlist: playlist,
      }
    );
    console.log("doc firestore/musics atualizado")
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
    console.log("wablua", snapshot.docs[0].data())
    return null;
  }

  console.log(snapshot.docs[0].data())
  return snapshot.docs[0].data();
}

export async function saveAllToDB(userId, initiativeList, playlist,) {
  
  await saveInitiativesToDB(userId, initiativeList);
  await saveMusicsToDB(userId, playlist);

}

export async function loadAllFromDB(userId) {
  const initiativesData = await loadInitiativesFromDB(userId);
  const musicsData = await loadMusicsFromDB(userId);

  return {
    initiatives: initiativesData?.PlayerArray ?? [],
    music: musicsData?.Playlist ?? [],
  };
}
