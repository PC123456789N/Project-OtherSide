import { openDB } from "idb";


export const dbPromise = openDB("app_web", 1, {
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
    if (!db.objectStoreNames.contains("monsters")) {
      db.createObjectStore("monsters");
    }
    if (!db.objectStoreNames.contains("scripts")) {
      db.createObjectStore("scripts");
    }
    if (!db.objectStoreNames.contains("musics")) {
      db.createObjectStore("musics");
    }
  }
})

export async function verifyUser( userId ) {
  const cache = await dbPromise;
  const cachedUserId = await cache.get("metadata", "cachedUserId")

  if (cachedUserId !== userId) {
    //console.log("web-uid and idb-uid dont match. creating new Table!")//rm on postproduction
    await cache.clear("initiatives");
    await cache.clear("combats");
    await cache.clear("monsters");
    await cache.clear("scripts");
    await cache.clear("musics");
    await cache.clear("metadata");
    await cache.put("metadata", userId, "cachedUserId");
  } else {
    //console.log("web-userId and idb-userId match. pass!") //rm on postproduction
  }
}

export async function getCachedLastSave(){
  const cache = await dbPromise;
  return cache.get("metadata","cachedLastSave")
}

export async function loadFromCache(){
  console.log("loaded from idb")
  const cache = await dbPromise;
  

  //pull data from cache and returns them in a list
  return {
    initiatives: await cache.get("initiatives", "cachedInitiativeList"),
    combats: await cache.get("combats", "cachedUserCombats"),
    monsters: await cache.get("monsters", "cachedMonstersList"),
    script: await cache.get("scripts", "cachedScript"),
    notes: await cache.get("scripts", "cachedNotesList"),
    music: await cache.get("musics", "cachedPlaylist"),
  };
}

export async function saveToCache(
  initiativeList,
  combats,
  monstersList,
  scripts, 
  notesList,
  playlist
){
  console.log("data sent to idb")
  console.log("initiativeList:", initiativeList);
  console.log("combats:", combats);
  const cache = await dbPromise;
  
  await cache.put(
    "metadata",
    Date.now(),
    "cachedLastSave"
  )
  
  await cache.put(
    "initiatives",
    initiativeList,
    "cachedInitiativeList"
  );

  await cache.put(
    "combats",
    combats,
    "cachedUserCombats"
  );
  await cache.put(
    "monsters",
    monstersList,
    "cachedMonstersList"
  );

  await cache.put(
    "scripts",
    scripts,
    "cachedScript"
  );
  await cache.put(
    "scripts",
    notesList,
    "cachedNotesList"
  );

  await cache.put(
    "musics",
    playlist,
    "cachedPlaylist"
  );
}

export async function saveInitiativesToCache(initiativeList) {
  const cache = await dbPromise;

  await cache.put(
    "initiatives",
    initiativeList,
    "cachedInitiativeList"
  );
}

export async function saveCombatsToCache(combats) {
  const cache = await dbPromise;

  await cache.put(
    "combats",
    combats,
    "cachedUserCombats"
  );
}

export async function saveMonstersToCache(monstersList) {
  const cache = await dbPromise;

  await cache.put(
    "monsters",
    monstersList,
    "cachedMonstersList"
  );
}

export async function saveScriptsToCache(scripts) {
  const cache = await dbPromise;

  await cache.put(
    "scripts",
    scripts,
    "cachedScript"
  );
}

export async function saveNotesToCache(notesList) {
  const cache = await dbPromise;

  await cache.put(
    "scripts",
    notesList,
    "cachedNotesList"
  );
}

export async function savePlaylistToCache(playlist) {
  const cache = await dbPromise;

  await cache.put(
    "musics",
    playlist,
    "cachedPlaylist"
  );
}

