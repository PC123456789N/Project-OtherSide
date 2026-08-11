import { describe, it, expect, beforeEach } from "vitest";
import {
  dbPromise,
  clearCache,
  verifyUser,
  getCachedLastSave,
  loadFromCache,
  saveToCache,
  saveInitiativesToCache,
  saveCombatsToCache,
} from "./DataCacheHandler.js";

// fake-indexeddb mantém uma única conexão aberta (dbPromise é módulo-singleton,
// igual no app real). Em vez de deletar o banco entre testes (o que trava
// esperando a conexão fechar), limpamos os object stores via clearCache().
beforeEach(async () => {
  await clearCache();
});

describe("DataCacheHandler", () => {
  it("verifyUser: em usuário novo (sem cachedUserId), grava o userId", async () => {
    await verifyUser("user-1");
    const cache = await dbPromise;
    expect(await cache.get("metadata", "cachedUserId")).toBe("user-1");
  });

  it("verifyUser: troca de usuário no mesmo dispositivo limpa todo o cache anterior", async () => {
    await verifyUser("user-1");
    await saveToCache(["init-a"], ["combat-a"], ["monster-a"], ["script-a"], ["music-a"]);

    // Segundo usuário loga no mesmo navegador
    await verifyUser("user-2");

    const cached = await loadFromCache();
    expect(cached.initiatives).toBeUndefined();
    expect(cached.combats).toBeUndefined();
    const cache = await dbPromise;
    expect(await cache.get("metadata", "cachedUserId")).toBe("user-2");
  });

  it("verifyUser: mesmo usuário repetido NÃO limpa o cache existente", async () => {
    await verifyUser("user-1");
    await saveToCache(["init-a"], [], [], [], []);

    await verifyUser("user-1");

    const cached = await loadFromCache();
    expect(cached.initiatives).toEqual(["init-a"]);
  });

  it("getCachedLastSave retorna undefined quando nunca houve save", async () => {
    expect(await getCachedLastSave()).toBeUndefined();
  });

  it("saveToCache grava todos os domínios e atualiza cachedLastSave", async () => {
    const before = Date.now();
    await saveToCache(["i1"], ["c1"], ["m1"], ["s1"], ["p1"]);
    const after = Date.now();

    const cached = await loadFromCache();
    expect(cached).toEqual({
      initiatives: ["i1"],
      combats: ["c1"],
      monsters: ["m1"],
      script: ["s1"],
      music: ["p1"],
    });

    const lastSave = await getCachedLastSave();
    expect(lastSave).toBeGreaterThanOrEqual(before);
    expect(lastSave).toBeLessThanOrEqual(after);
  });

  it("saveInitiativesToCache só altera 'initiatives' e o timestamp, preservando os demais domínios", async () => {
    await saveToCache(["i1"], ["c1"], ["m1"], ["s1"], ["p1"]);

    await saveInitiativesToCache(["i2"]);

    const cached = await loadFromCache();
    expect(cached.initiatives).toEqual(["i2"]);
    expect(cached.combats).toEqual(["c1"]);
    expect(cached.monsters).toEqual(["m1"]);
    expect(cached.script).toEqual(["s1"]);
    expect(cached.music).toEqual(["p1"]);
  });

  it("clearCache remove todos os object stores", async () => {
    await verifyUser("user-1");
    await saveToCache(["i1"], ["c1"], ["m1"], ["s1"], ["p1"]);

    await clearCache();

    const cached = await loadFromCache();
    expect(cached.initiatives).toBeUndefined();
    const cache = await dbPromise;
    expect(await cache.get("metadata", "cachedUserId")).toBeUndefined();
  });

  it("RACE: escritas concorrentes em domínios diferentes (initiatives + combats) não se pisam", async () => {
    await saveToCache([], [], [], [], []);

    // simula os dois debounces de 1000ms do DataHandlerContext disparando
    // quase ao mesmo tempo para domínios diferentes
    await Promise.all([
      saveInitiativesToCache(["init-final"]),
      saveCombatsToCache(["combat-final"]),
    ]);

    const cached = await loadFromCache();
    expect(cached.initiatives).toEqual(["init-final"]);
    expect(cached.combats).toEqual(["combat-final"]);
  });

  it("RACE: escritas concorrentes no MESMO domínio — última a comitar vence (last-write-wins), sem exceção", async () => {
    await saveToCache([], [], [], [], []);

    // Duas chamadas "simultâneas" salvando a mesma lista de iniciativas com
    // conteúdos diferentes — não há nenhum controle de versão/lock no código,
    // então o resultado depende só da ordem de resolução das promises/transações.
    const p1 = saveInitiativesToCache(["from-device-A"]);
    const p2 = saveInitiativesToCache(["from-device-B"]);
    await Promise.all([p1, p2]);

    const cached = await loadFromCache();
    // Não trava nem lança erro — mas o valor final é indeterminado
    // (depende de qual transação do IndexedDB comitou por último).
    expect(["from-device-A", "from-device-B"]).toContain(cached.initiatives[0]);
  });
});
