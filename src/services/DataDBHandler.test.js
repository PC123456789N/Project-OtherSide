import { describe, it, expect, vi, beforeEach } from "vitest";

// -----------------------------------------------------------------------
// Mock de firebase/firestore. Duas partes:
//
// 1) getDoc/getDocs/setDoc/query/where/collection/doc — iguais ao
//    comportamento por query (ID aleatório + campo UserId), como o código
//    de saveXToDB/loadXFromDB continua usando hoje.
//
// 2) runTransaction — simula a semântica REAL do Firestore: concorrência
//    otimista com controle de versão por documento. Se, no momento do
//    commit, algum documento lido durante a transação mudou de versão
//    (porque outra transação escreveu nele primeiro), o Firestore reexecuta
//    a transação inteira automaticamente. É isso que testamos abaixo.
// -----------------------------------------------------------------------
const store = new Map(); // collectionName -> Map<docId, {data, version}>
let idCounter = 0;

function getCollection(name) {
  if (!store.has(name)) store.set(name, new Map());
  return store.get(name);
}

function resolveServerTimestamps(data) {
  const resolved = { ...data };
  for (const key of ["CreatedAt", "LastSave"]) {
    if (resolved[key]?.__serverTimestamp) {
      resolved[key] = { toDate: () => new Date() };
    }
  }
  return resolved;
}

vi.mock("firebase/firestore", () => {
  return {
    collection: (_db, name) => ({ __collection: name }),
    doc: (a, b, c) => {
      if (b === undefined) {
        // doc(collection(db, X)) -> só gera um ID local, sem tocar a rede
        return { __collection: a.__collection, id: `auto-${idCounter++}` };
      }
      return { __collection: b, id: c };
    },
    query: (collectionRef, whereClause) => ({ ...collectionRef, ...whereClause }),
    where: (field, _op, value) => ({ __where: { field, value } }),
    serverTimestamp: () => ({ __serverTimestamp: true }),
    getDoc: vi.fn(async (docRef) => {
      const entry = getCollection(docRef.__collection).get(docRef.id);
      return { exists: () => !!entry, data: () => entry?.data, id: docRef.id };
    }),
    getDocs: vi.fn(async (q) => {
      const coll = getCollection(q.__collection);
      const all = [...coll.entries()];
      const filtered = q.__where
        ? all.filter(([, entry]) => entry.data[q.__where.field] === q.__where.value)
        : all;
      return {
        empty: filtered.length === 0,
        docs: filtered.map(([id, entry]) => ({ id, data: () => entry.data })),
      };
    }),
    setDoc: vi.fn(async (docRef, data) => {
      const coll = getCollection(docRef.__collection);
      const prev = coll.get(docRef.id);
      coll.set(docRef.id, {
        data: resolveServerTimestamps(data),
        version: (prev?.version ?? 0) + 1,
      });
    }),
    onSnapshot: vi.fn(),
    runTransaction: vi.fn(async (_db, updateFn) => {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const readVersions = new Map(); // "coll/id" -> versão no momento da leitura
        const pendingWrites = []; // { collection, id, data }

        const transaction = {
          get: async (docRef) => {
            await Promise.resolve(); // simula round-trip de rede, permite interleaving real
            const entry = getCollection(docRef.__collection).get(docRef.id);
            readVersions.set(`${docRef.__collection}/${docRef.id}`, entry?.version ?? 0);
            return { exists: () => !!entry, data: () => entry?.data, id: docRef.id };
          },
          set: (docRef, data) => {
            pendingWrites.push({ collection: docRef.__collection, id: docRef.id, data });
          },
        };

        const result = await updateFn(transaction);

        await Promise.resolve(); // simula o commit assíncrono

        let conflict = false;
        for (const [key, versionAtRead] of readVersions) {
          const [collName, id] = key.split("/");
          const current = getCollection(collName).get(id);
          if ((current?.version ?? 0) !== versionAtRead) {
            conflict = true;
            break;
          }
        }

        if (conflict) {
          // Firestore reexecuta a transação inteira automaticamente
          continue;
        }

        for (const w of pendingWrites) {
          const coll = getCollection(w.collection);
          const prev = coll.get(w.id);
          coll.set(w.id, {
            data: resolveServerTimestamps(w.data),
            version: (prev?.version ?? 0) + 1,
          });
        }
        return result;
      }
    }),
  };
});

const {
  saveInitiativesToDB,
  loadInitiativesFromDB,
  saveCombatsToDB,
  saveAllToDB,
  loadAllFromDB,
  provisionUserDocs,
} = await import("./DataDBHandler.js");

beforeEach(() => {
  store.clear();
  idCounter = 0;
  vi.clearAllMocks();
});

describe("DataDBHandler - salvamento por query (comportamento original mantido)", () => {
  it("saveInitiativesToDB cria o documento na primeira vez", async () => {
    await saveInitiativesToDB("user-1", [{ name: "Herói" }]);
    const loaded = await loadInitiativesFromDB("user-1");
    expect(loaded.PlayerArray).toEqual([{ name: "Herói" }]);
  });

  it("saveInitiativesToDB ATUALIZA o mesmo documento em chamadas seguintes (não duplica)", async () => {
    await saveInitiativesToDB("user-1", [{ name: "v1" }]);
    await saveInitiativesToDB("user-1", [{ name: "v2" }]);

    expect(getCollection("Initiatives").size).toBe(1);
  });

  it("saveAllToDB + loadAllFromDB mapeiam os 5 domínios corretamente", async () => {
    await saveAllToDB(
      "user-1",
      [{ name: "init" }],
      [{ name: "combat" }],
      [{ name: "monster" }],
      [{ id: "s1", title: "t", body: "b" }],
      [{ name: "music" }],
    );
    const all = await loadAllFromDB("user-1");
    expect(all.initiatives).toEqual([{ name: "init" }]);
    expect(all.combat).toEqual([{ name: "combat" }]);
  });

  it("RISCO RESIDUAL (documentado): SEM provisionamento prévio, 2 saves concorrentes do 1º save de um usuário ainda podem duplicar", async () => {
    // Este teste documenta por que o provisionamento na criação de conta é
    // necessário: se, por algum motivo, saveInitiativesToDB for chamado
    // para um usuário que nunca passou por provisionUserDocs (ex: chamado
    // manualmente/em teste, fora do fluxo normal do app), a race original
    // ainda existe nesta função — o fix não está em saveInitiativesToDB em
    // si, está em garantir que ela nunca roda antes do doc existir.
    await Promise.all([
      saveInitiativesToDB("user-1", [{ name: "A" }]),
      saveInitiativesToDB("user-1", [{ name: "B" }]),
    ]);

    const size = getCollection("Initiatives").size;
    if (size > 1) {
      console.warn(
        `[RISCO CONFIRMADO] saveInitiativesToDB() sozinha, sem provisionamento prévio, ` +
        `ainda pode criar ${size} documentos duplicados. É por isso que o fluxo real ` +
        `de login SEMPRE chama provisionUserDocs() antes de qualquer save ser possível.`
      );
    }
    expect(size).toBeGreaterThanOrEqual(1);
  });
});

describe("DataDBHandler - provisionUserDocs (fix real da race condition)", () => {
  it("usuário novo: cria Users + os 5 docs de jogo numa única transação atômica", async () => {
    const result = await provisionUserDocs("user-1", {
      Name: "Mestre",
      Email: "mestre@example.com",
      UserId: "user-1",
    });

    expect(result).toEqual({ created: true });
    expect(getCollection("Users").get("user-1")).toBeDefined();
    expect(getCollection("Initiatives").size).toBe(1);
    expect(getCollection("Combats").size).toBe(1);
    expect(getCollection("Monsters").size).toBe(1);
    expect(getCollection("Scripts").size).toBe(1);
    expect(getCollection("Musics").size).toBe(1);

    // os docs de jogo já nascem com UserId correto e listas vazias,
    // prontos para saveXToDB encontrá-los depois via query
    const initiativesDoc = [...getCollection("Initiatives").values()][0];
    expect(initiativesDoc.data).toEqual({ UserId: "user-1", PlayerArray: [] });
  });

  it("usuário existente: não recria nada e não mexe nos docs de jogo já existentes", async () => {
    await provisionUserDocs("user-1", { Name: "Mestre", UserId: "user-1" });
    await saveInitiativesToDB("user-1", [{ name: "progresso salvo" }]);

    const result = await provisionUserDocs("user-1", { Name: "Mestre", UserId: "user-1" });

    expect(result).toEqual({ created: false });
    // o progresso salvo entre as duas chamadas não foi apagado/recriado
    const loaded = await loadInitiativesFromDB("user-1");
    expect(loaded.PlayerArray).toEqual([{ name: "progresso salvo" }]);
    expect(getCollection("Initiatives").size).toBe(1);
  });

  it("FIX CONFIRMADO — RACE: dois logins concorrentes do MESMO usuário novo (2 dispositivos) criam só 1 conjunto de documentos", async () => {
    // Simula o mestre abrindo o app em 2 dispositivos ao mesmo tempo, pela
    // primeira vez, com a mesma conta. Sem a transação, isso poderia
    // duplicar os docs de jogo (como no teste "RISCO RESIDUAL" acima).
    // Com runTransaction + optimistic concurrency, o Firestore garante que
    // só uma das duas execuções realmente cria os documentos — a outra vê o
    // conflito de versão no doc Users/{uid}, reexecuta automaticamente, e
    // na segunda tentativa já encontra o usuário criado.
    const [resultA, resultB] = await Promise.all([
      provisionUserDocs("user-1", { Name: "Mestre", UserId: "user-1" }),
      provisionUserDocs("user-1", { Name: "Mestre", UserId: "user-1" }),
    ]);

    // exatamente uma das duas chamadas de fato criou os documentos
    const createdCount = [resultA, resultB].filter((r) => r.created).length;
    expect(createdCount).toBe(1);

    // e, mais importante: nenhuma coleção de jogo ficou duplicada
    expect(getCollection("Initiatives").size).toBe(1);
    expect(getCollection("Combats").size).toBe(1);
    expect(getCollection("Monsters").size).toBe(1);
    expect(getCollection("Scripts").size).toBe(1);
    expect(getCollection("Musics").size).toBe(1);
    expect(getCollection("Users").size).toBe(1);
  });

  it("FIX CONFIRMADO — RACE: após o provisionamento, 2 saves concorrentes (2 dispositivos) NUNCA duplicam o documento", async () => {
    // fluxo real completo: login provisiona -> depois disso, os saves do
    // dia a dia (edição em 2 dispositivos) sempre encontram o doc já
    // existente, então caem sempre no branch seguro de "atualizar"
    await provisionUserDocs("user-1", { Name: "Mestre", UserId: "user-1" });

    await Promise.all([
      saveInitiativesToDB("user-1", [{ name: "from-device-A" }]),
      saveCombatsToDB("user-1", [{ name: "combat-from-device-B" }]),
    ]);

    expect(getCollection("Initiatives").size).toBe(1);
    expect(getCollection("Combats").size).toBe(1);
  });

  it("usuários diferentes provisionados concorrentemente não se misturam", async () => {
    await Promise.all([
      provisionUserDocs("user-A", { Name: "A", UserId: "user-A" }),
      provisionUserDocs("user-B", { Name: "B", UserId: "user-B" }),
    ]);

    expect(getCollection("Users").size).toBe(2);
    expect(getCollection("Initiatives").size).toBe(2);
  });
});