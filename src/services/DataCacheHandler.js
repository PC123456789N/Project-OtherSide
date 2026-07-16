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
    await cache.clear("scripts");
    await cache.clear("musics");
    await cache.clear("metadata");
    await cache.put("metadata", userId, "cachedUserId");
    await cache.put("metadata", Date.now(), "cachedLastSave")
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
    script: await cache.get("scripts", "cachedScript"),
    music: await cache.get("musics", "cachedPlaylist")
  };
}

export async function saveToCache(
  initiativeList,
  scriptTitle ,scriptBody,
  playlist, videoId
){
  console.log("data sent to idb")
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
    "scripts",
    {
      title: scriptTitle,
      body: scriptBody
    },
    "cachedScript"
  );

  await cache.put(
    "musics",
    {
      playlist,
    },
    "cachedPlaylist"
  );
}

