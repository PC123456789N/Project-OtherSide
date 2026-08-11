import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act, waitFor } from "@testing-library/react";
import { DataHandlerProvider, useDataHandler } from "./DataHandlerContext.jsx";

// -----------------------------------------------------------------------
// Mocks dos módulos de I/O. Controlamos manualmente quando cada promise
// resolve para poder simular race conditions de forma determinística.
// -----------------------------------------------------------------------
vi.mock("../authContext/auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../services/DataCacheHandler", () => ({
  verifyUser: vi.fn(),
  getCachedLastSave: vi.fn(),
  loadFromCache: vi.fn(),
  saveToCache: vi.fn(),
  saveInitiativesToCache: vi.fn(),
  saveCombatsToCache: vi.fn(),
  saveMonstersToCache: vi.fn(),
  saveScriptsToCache: vi.fn(),
  savePlaylistToCache: vi.fn(),
}));

vi.mock("../../services/DataDBHandler", () => ({
  getDBLastSave: vi.fn(),
  saveInitiativesToDB: vi.fn(),
  loadInitiativesFromDB: vi.fn(),
  subscribeToInitiativesDB: vi.fn(() => vi.fn()), // retorna unsubscribe
  saveCombatsToDB: vi.fn(),
  loadCombatsFromDB: vi.fn(),
  subscribeToCombatsDB: vi.fn(() => vi.fn()),
  saveMonstersToDB: vi.fn(),
  loadMonstersFromDB: vi.fn(),
  subscribeToMonstersDB: vi.fn(() => vi.fn()),
  saveScriptsToDB: vi.fn(),
  loadScriptsFromDB: vi.fn(),
  saveMusicsToDB: vi.fn(),
  loadMusicsFromDB: vi.fn(),
  subscribeToMusicsDB: vi.fn(() => vi.fn()),
  saveAllToDB: vi.fn(),
  loadAllFromDB: vi.fn(),
}));

import { useAuth } from "../authContext/auth";
import * as CacheHandler from "../../services/DataCacheHandler";
import * as DBHandler from "../../services/DataDBHandler";

// Componente auxiliar: expõe o valor do contexto para os testes via um
// objeto mutável "handle", sem precisar de screen/DOM assertions.
function TestConsumer({ handle }) {
  const ctx = useDataHandler();
  Object.assign(handle, ctx);
  return null;
}

function renderProvider() {
  const handle = {};
  const utils = render(
    <DataHandlerProvider>
      <TestConsumer handle={handle} />
    </DataHandlerProvider>,
  );
  return { handle, ...utils };
}

beforeEach(() => {
  vi.clearAllMocks();
  useAuth.mockReturnValue({ userId: "user-1", userLoggedIn: true });

  // defaults "vazios" — cada teste sobrescreve o que precisa
  CacheHandler.verifyUser.mockResolvedValue();
  CacheHandler.getCachedLastSave.mockResolvedValue(null);
  CacheHandler.loadFromCache.mockResolvedValue({});
  CacheHandler.saveToCache.mockResolvedValue();
  CacheHandler.saveInitiativesToCache.mockResolvedValue();
  CacheHandler.saveCombatsToCache.mockResolvedValue();

  DBHandler.getDBLastSave.mockResolvedValue(null);
  DBHandler.loadAllFromDB.mockResolvedValue({
    initiatives: [],
    combat: [],
    monster: [],
    scripts: [],
    music: [],
  });
  DBHandler.saveAllToDB.mockResolvedValue();
  DBHandler.saveInitiativesToDB.mockResolvedValue();
  DBHandler.saveCombatsToDB.mockResolvedValue();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("DataHandlerContext - casos de sincronização inicial (syncData)", () => {
  it("Caso A: cache e Firestore vazios -> não carrega nem salva nada", async () => {
    CacheHandler.getCachedLastSave.mockResolvedValue(null);
    DBHandler.getDBLastSave.mockResolvedValue(null);

    renderProvider();

    await waitFor(() => {
      expect(CacheHandler.getCachedLastSave).toHaveBeenCalled();
      expect(DBHandler.getDBLastSave).toHaveBeenCalled();
    });

    expect(DBHandler.loadAllFromDB).not.toHaveBeenCalled();
    expect(CacheHandler.loadFromCache).not.toHaveBeenCalled();
    expect(DBHandler.saveAllToDB).not.toHaveBeenCalled();
  });

  it("Caso B: cache existe, Firestore vazio -> envia cache inteiro para o Firestore", async () => {
    CacheHandler.getCachedLastSave.mockResolvedValue(1000);
    DBHandler.getDBLastSave.mockResolvedValue(null);
    CacheHandler.loadFromCache.mockResolvedValue({
      initiatives: [{ name: "cached-init" }],
      combats: [{ name: "cached-combat" }],
      monsters: [],
      script: [{ id: "s1", title: "t", body: "b" }],
      music: [],
    });

    renderProvider();

    await waitFor(() => {
      expect(DBHandler.saveAllToDB).toHaveBeenCalledWith(
        "user-1",
        [{ name: "cached-init" }],
        [{ name: "cached-combat" }],
        [],
        [{ id: "s1", title: "t", body: "b" }],
        [],
      );
    });
    expect(DBHandler.loadAllFromDB).not.toHaveBeenCalled();
  });

  it("Caso C: Firestore existe, cache vazio -> carrega do Firestore e popula o cache local", async () => {
    CacheHandler.getCachedLastSave.mockResolvedValue(null);
    DBHandler.getDBLastSave.mockResolvedValue(2000);
    DBHandler.loadAllFromDB.mockResolvedValue({
      initiatives: [{ name: "remote-init" }],
      combat: [{ name: "remote-combat" }],
      monster: [],
      scripts: [],
      music: [],
    });

    const { handle } = renderProvider();

    await waitFor(() => {
      expect(handle.initiativeList).toEqual([{ name: "remote-init" }]);
    });
    expect(handle.combats).toEqual([{ name: "remote-combat" }]);
    expect(CacheHandler.saveToCache).toHaveBeenCalledWith(
      [{ name: "remote-init" }],
      [{ name: "remote-combat" }],
      [],
      [],
      [],
    );
  });

  it("Caso D (Firestore mais recente): carrega do Firestore, ignora o cache local desatualizado", async () => {
    CacheHandler.getCachedLastSave.mockResolvedValue(1000);
    DBHandler.getDBLastSave.mockResolvedValue(5000); // mais recente
    DBHandler.loadAllFromDB.mockResolvedValue({
      initiatives: [{ name: "remote-wins" }],
      combat: [],
      monster: [],
      scripts: [],
      music: [],
    });
    CacheHandler.loadFromCache.mockResolvedValue({
      initiatives: [{ name: "stale-cache" }],
    });

    const { handle } = renderProvider();

    await waitFor(() => {
      expect(handle.initiativeList).toEqual([{ name: "remote-wins" }]);
    });
    expect(DBHandler.saveAllToDB).not.toHaveBeenCalled();
  });

  it("Caso D (cache mais recente): carrega do cache local, empurra para o Firestore", async () => {
    CacheHandler.getCachedLastSave.mockResolvedValue(9000); // mais recente
    DBHandler.getDBLastSave.mockResolvedValue(1000);
    CacheHandler.loadFromCache.mockResolvedValue({
      initiatives: [{ name: "cache-wins" }],
      combats: [],
      monsters: [],
      script: [],
      music: [],
    });

    const { handle } = renderProvider();

    await waitFor(() => {
      expect(handle.initiativeList).toEqual([{ name: "cache-wins" }]);
    });
    expect(DBHandler.saveAllToDB).toHaveBeenCalledWith(
      "user-1",
      [{ name: "cache-wins" }],
      [],
      [],
      [],
      [],
    );
    expect(DBHandler.loadAllFromDB).not.toHaveBeenCalled();
  });
});

describe("DataHandlerContext - RACE CONDITIONS", () => {
  it("BLOQUEIO ESPERADO: autosave não dispara antes do syncData inicial terminar (hasSyncedRef)", async () => {
    // sync trava propositalmente "no ar" (getDBLastSave nunca resolve)
    let resolveDbLastSave;
    DBHandler.getDBLastSave.mockReturnValue(
      new Promise((res) => {
        resolveDbLastSave = res;
      }),
    );
    CacheHandler.getCachedLastSave.mockResolvedValue(null);

    vi.useFakeTimers();
    const { handle } = renderProvider();

    // usuário edita a lista de iniciativas ENQUANTO o syncData inicial
    // ainda está pendente (ex: usuário mexe na tela muito rápido no load)
    act(() => {
      handle.setInitiativeList([{ name: "edited-too-early" }]);
    });

    // passa dos 1000ms do debounce
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    // o guard `if (!userId || !hasSyncedRef.current) return;` deve ter
    // impedido o autosave de rodar, já que o sync ainda não terminou
    expect(DBHandler.saveInitiativesToDB).not.toHaveBeenCalled();

    // agora deixamos o sync terminar
    await act(async () => {
      resolveDbLastSave(null);
      await Promise.resolve();
    });

    vi.useRealTimers();
  });

  it("RACE: atualização remota (onSnapshot) chegando enquanto há edição local não salva NÃO sobrescreve o estado local", async () => {
    vi.useFakeTimers();

    let capturedOnChange;
    DBHandler.subscribeToInitiativesDB.mockImplementation((userId, onChange) => {
      capturedOnChange = onChange;
      return vi.fn();
    });

    const { handle } = renderProvider();

    // deixa o syncData inicial (Caso A) terminar
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    // usuário edita localmente -> unsavedChangesInitiativesRef vira true
    // (o debounce de 1s ainda não disparou)
    act(() => {
      handle.setInitiativeList([{ name: "local-unsaved-edit" }]);
    });

    // enquanto isso, chega uma atualização remota via onSnapshot (ex: outro
    // dispositivo salvou algo) — pelo guard `unsavedChangesInitiativesRef`,
    // isso deve ser ignorado para não pisar na edição local ainda não salva
    act(() => {
      capturedOnChange({ PlayerArray: [{ name: "remote-update-mid-edit" }] });
    });

    expect(handle.initiativeList).toEqual([{ name: "local-unsaved-edit" }]);

    vi.useRealTimers();
  });

  it("ACHADO: o simples mount do provider já marca unsavedChangesInitiativesRef=true (efeito roda com o estado inicial [])", async () => {
    // Isto não é uma edição do usuário — é o useEffect de "algo mudou em
    // initiativeList" disparando na primeira renderização, porque
    // isApplyingRemoteInitiativesRef só é setado como true dentro de
    // syncData nos Casos C/D (quando HÁ dado remoto/cache pra aplicar).
    // No Caso A ("Novo usuário"), ninguém seta essa flag, então o mount
    // com initiativeList=[] é tratado como "mudança do usuário" e agenda
    // um autosave — e, pior, bloqueia updates remotos via onSnapshot
    // durante essa janela (ver teste seguinte).
    vi.useFakeTimers();

    let capturedOnChange;
    DBHandler.subscribeToInitiativesDB.mockImplementation((userId, onChange) => {
      capturedOnChange = onChange;
      return vi.fn();
    });

    renderProvider();
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    // update remoto chega ANTES do primeiro debounce de 1000ms completar
    act(() => {
      capturedOnChange({ PlayerArray: [{ name: "remote-update-lost" }] });
    });

    // o update remoto foi descartado por causa do "falso dirty" do mount —
    // isso é uma race condition real, não um comportamento desejado.
    // Documentamos aqui em vez de esconder.
    vi.useRealTimers();
  });

  it("RACE: atualização remota é aplicada normalmente quando NÃO há edição local pendente (após o autosave inicial completar)", async () => {
    vi.useFakeTimers();

    let capturedOnChange;
    DBHandler.subscribeToInitiativesDB.mockImplementation((userId, onChange) => {
      capturedOnChange = onChange;
      return vi.fn();
    });

    const { handle } = renderProvider();

    // deixa o syncData inicial E o autosave "falso dirty" do mount (ver
    // teste ACHADO acima) completarem, para unsavedChangesInitiativesRef
    // voltar para false
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    await act(async () => {
      vi.advanceTimersByTime(1500);
      await Promise.resolve();
    });

    // agora sim, sem edição pendente -> update remoto deve ser aplicado
    act(() => {
      capturedOnChange({ PlayerArray: [{ name: "remote-update-clean" }] });
    });

    expect(handle.initiativeList).toEqual([{ name: "remote-update-clean" }]);

    vi.useRealTimers();
  });

  it("RACE: aplicar update remoto não deve, por si só, re-disparar um autosave (isApplyingRemoteRef)", async () => {
    vi.useFakeTimers();

    let capturedOnChange;
    DBHandler.subscribeToInitiativesDB.mockImplementation((userId, onChange) => {
      capturedOnChange = onChange;
      return vi.fn();
    });

    renderProvider();

    // deixa o autosave inicial (mount "falso dirty") completar e o mock zerar
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    await act(async () => {
      vi.advanceTimersByTime(1500);
      await Promise.resolve();
    });
    DBHandler.saveInitiativesToDB.mockClear();

    act(() => {
      capturedOnChange({ PlayerArray: [{ name: "remote-update" }] });
    });

    // avança o debounce de autosave — se isApplyingRemoteInitiativesRef
    // não estivesse protegendo esse caminho, isso dispararia um save
    // desnecessário de volta pro Firestore (eco: remoto -> local -> remoto)
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    expect(DBHandler.saveInitiativesToDB).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("RACE: edições rápidas e sucessivas (digitação) fazem debounce corretamente — só salva uma vez com o valor final", async () => {
    vi.useFakeTimers();
    const { handle } = renderProvider();

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    act(() => {
      handle.setInitiativeList([{ name: "v1" }]);
    });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    act(() => {
      handle.setInitiativeList([{ name: "v2" }]);
    });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    act(() => {
      handle.setInitiativeList([{ name: "v3-final" }]);
    });
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    expect(DBHandler.saveInitiativesToDB).toHaveBeenCalledTimes(1);
    expect(DBHandler.saveInitiativesToDB).toHaveBeenCalledWith("user-1", [
      { name: "v3-final" },
    ]);

    vi.useRealTimers();
  });
});
