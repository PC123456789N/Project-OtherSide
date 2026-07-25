import { useState } from "react";
import { FaPlus, FaTimes, FaDice, FaTrash, FaFlag } from "react-icons/fa";

import { useDataHandler } from "../../context/dataHandlerContext/DataHandlerContext";

const buttonBase = `
  flex
  h-10
  items-center
  justify-center
  gap-2
  rounded-lg
  text-sm
  font-semibold
  transition
`;

// Um bloco de resultado isolado (usado tanto pra rolagem livre/perícia
// quanto para cada metade do par Teste + Dano de ataque).
function RollResultBlock({ roll }) {
  const usesHighest =
    roll?.highestIndex !== undefined && roll?.highestIndex !== null;

  function criticalBadgeLabel() {
    if (roll.type === "ataque-teste") return "Teste Crítico!";
    if (roll.type === "ataque-dano-critico") return "Dano Crítico!";
    return "Crítico!";
  }

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-3">
      <p className="mb-1 text-xs text-zinc-500">
        {roll.label ? "Rolagem" : "Resultado"}
      </p>

      <p className="mb-2 flex items-center gap-2 text-xs text-zinc-400">
        {roll.label || roll.notation}

        {roll.isCritical && (
          <span className="rounded bg-green-700/80 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
            {criticalBadgeLabel()}
          </span>
        )}
      </p>

      {/* Info da Margem/Bônus/Teste Crítico — só aparece nas rolagens
          de Teste de ataque */}
      {roll.critTestThreshold != null && (
        <div className="mb-2 space-y-0.5 text-[11px] text-zinc-500">
          <p>Margem de ameaça = {roll.threatMargin}</p>
          <p>
            Bônus ={" "}
            {roll.testBonus >= 0 ? `+${roll.testBonus}` : roll.testBonus}
          </p>
          <p>Teste Crítico = {roll.critTestThreshold}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-300">
        {roll.rolls.map((value, index) => {
          // Rolagens "pega o maior" (perícia, teste de ataque) destacam
          // o maior dado e apagam/riscam os outros, já que não entram
          // na soma.
          const isHighest = usesHighest && index === roll.highestIndex;
          const isDiscarded = usesHighest && index !== roll.highestIndex;

          return (
            <span key={index}>
              {!usesHighest && index > 0 && "+ "}
              <span
                className={`
                  rounded-md
                  px-2
                  py-1
                  font-bold
                  ${
                    isHighest
                      ? "bg-violet-600 text-white"
                      : isDiscarded
                        ? "bg-zinc-800 text-zinc-600 line-through"
                        : "bg-zinc-700 text-violet-300"
                  }
                `}
              >
                {value}
              </span>
            </span>
          );
        })}

        {roll.modifier !== 0 && <span>+ {roll.modifier}</span>}

        <span>=</span>

        {/* Destaque de crítico: sublinhado + verde-claro brilhante */}
        <span
          className={`text-2xl font-bold ${
            roll.isCritical
              ? "text-green-400 underline decoration-2 decoration-green-400 [text-shadow:0_0_10px_rgba(74,222,128,0.6)]"
              : "text-violet-400"
          }`}
        >
          {roll.total}
        </span>
      </div>
    </div>
  );
}

export default function CombatSidebar({
  entities,
  selectedEntityId,
  onSelectEntity,
}) {
    const {
    initiativeList,
    setInitiativeList,
    rollHistory,
    setRollHistory,
    setSelectedPageId,
  } = useDataHandler();

  const lista = initiativeList || [];

  // rollHistory é compartilhado via contexto — rolagem livre, rolagem de
  // perícia e rolagem de ataque (teste + dano/dano crítico) todas
  // escrevem nele, então aparecem juntas aqui, na ordem em que
  // aconteceram.
  const history = rollHistory || [];

  const [collapsed, setCollapsed] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newNome, setNewNome] = useState("");
  const [newIniciativa, setNewIniciativa] = useState("");

  const [notation, setNotation] = useState("2d20+5");

  function findMatchingEntity(nome) {
    return entities.find(
      (entity) => entity.name.toLowerCase() === nome.toLowerCase()
    );
  }

  function handleSelectParticipant(participant) {
    const match = findMatchingEntity(participant.nome);

    if (match) {
      onSelectEntity(match.id);
    }
  }

  function handleAddParticipant() {
    if (!newNome || !newIniciativa) return;

    const novaLista = [
      ...lista,
      { nome: newNome, iniciativa: Number(newIniciativa) },
    ];

    novaLista.sort((a, b) => b.iniciativa - a.iniciativa);

    setInitiativeList(novaLista);

    setNewNome("");
    setNewIniciativa("");
    setShowAddForm(false);
  }

  function handleRemoveParticipant(index) {
    const novaLista = lista.filter((_, i) => i !== index);

    setInitiativeList(novaLista);
  }

  function handleEndCombat() {
    if (!window.confirm("Deseja encerrar o combate e sair para a página inicial?"))
      return;

    setSelectedPageId("2");
  }

  function rollDice() {
    const cleaned = notation.replace(/\s/g, "");

    // número inteiro puro (ex: "15") -> retorna o próprio número
    const integerMatch = cleaned.match(/^(\d+)$/);

    if (integerMatch) {
      const value = Number(integerMatch[1]);

      setRollHistory((prev) => [
        {
          id: crypto.randomUUID(),
          notation: cleaned,
          rolls: [value],
          modifier: 0,
          total: value,
        },
        ...(prev || []),
      ]);

      return;
    }

    const match = cleaned.match(/^(\d+)d(\d+)([+-]\d+)?$/i);

    if (!match) {
      window.alert(
        "Notação inválida. Use o formato: 2d20+5 ou um número inteiro (ex: 15)"
      );
      return;
    }

    const count = Number(match[1]);
    const sides = Number(match[2]);
    const modifier = match[3] ? Number(match[3]) : 0;

    const rolls = Array.from(
      { length: count },
      () => Math.floor(Math.random() * sides) + 1
    );

    // Pega o maior dado tirado (em vez de somar todos) e soma o bônus,
    // se houver. Sem bônus, o total é só o maior valor.
    const highestIndex = rolls.reduce(
      (bestIndex, value, index) => (value > rolls[bestIndex] ? index : bestIndex),
      0
    );

    const total = rolls[highestIndex] + modifier;

    setRollHistory((prev) => [
      {
        id: crypto.randomUUID(),
        notation,
        rolls,
        modifier,
        total,
        highestIndex,
      },
      ...(prev || []),
    ]);
  }

  function clearHistory() {
    setRollHistory([]);
  }

  const lastRoll = history[0];

  // Uma rolagem de ataque gera 2 entradas seguidas no histórico (Teste,
  // depois Dano ou Dano Crítico). Quando a mais recente é uma das duas
  // de dano, a entrada logo atrás dela (history[1]) é o Teste da mesma
  // rolagem — mostramos as duas juntas em vez de só a última.
  const isDamageEntry =
    lastRoll?.type === "ataque-dano" || lastRoll?.type === "ataque-dano-critico";
  const pairedTestRoll = isDamageEntry ? history[1] : null;

  return (
    <aside
      className={`
        flex
        shrink-0
        flex-col
        overflow-y-auto
        border-r
        border-zinc-800
        bg-zinc-900
        transition-all
        ${collapsed ? "w-16 p-3" : "w-80 p-5"}
      `}
    >
      {/* ================= TOPO / MINIMIZAR ================= */}

      <div className="mb-6 flex items-center justify-between">
        {!collapsed && (
          <h1 className="text-lg font-bold tracking-wide text-white">
            Combate
          </h1>
        )}

        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-lg
            bg-zinc-800
            text-zinc-400
            transition
            hover:bg-zinc-700
            hover:text-white
          "
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>

      {/* ================= SEÇÃO INICIATIVAS ================= */}

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Iniciativas
            </h2>
          )}

          {!collapsed && (
            <button
              onClick={() => setShowAddForm((prev) => !prev)}
              className="
                flex
                items-center
                gap-1.5
                text-xs
                font-semibold
                text-violet-400
                transition
                hover:text-violet-300
              "
            >
              {showAddForm ? <FaTimes /> : <FaPlus />}
              {showAddForm ? "Cancelar" : "Adicionar"}
            </button>
          )}
        </div>

        {!collapsed && showAddForm && (
          <div className="flex flex-col gap-2 rounded-lg border border-zinc-700 bg-zinc-800 p-3">
            <input
              value={newNome}
              onChange={(e) => setNewNome(e.target.value)}
              placeholder="Nome"
              className="
                h-10
                rounded-md
                border
                border-zinc-700
                bg-zinc-900
                px-3
                text-sm
                text-white
                outline-none
                focus:border-violet-500
              "
            />

            <input
              value={newIniciativa}
              onChange={(e) => setNewIniciativa(e.target.value)}
              placeholder="Iniciativa"
              type="number"
              className="
                h-10
                rounded-md
                border
                border-zinc-700
                bg-zinc-900
                px-3
                text-sm
                text-white
                outline-none
                focus:border-violet-500
              "
            />

            <button
              onClick={handleAddParticipant}
              className={`${buttonBase} bg-violet-600 text-white hover:bg-violet-700`}
            >
              <FaPlus size={12} />
              Confirmar
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {lista.length === 0 && !collapsed && (
            <p className="rounded-lg border border-dashed border-zinc-800 p-4 text-center text-xs text-zinc-600">
              Nenhum participante na iniciativa.
            </p>
          )}

          {lista.map((participant, index) => (
            <div
              key={`${participant.nome}-${index}`}
              className="
                flex
                items-center
                gap-2
                rounded-lg
                border
                border-transparent
                bg-zinc-800
                p-3
                transition
              "
            >
              <button
                onClick={() => handleSelectParticipant(participant)}
                title={participant.nome}
                className="flex flex-1 items-center gap-3 text-left"
              >
                <span
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-zinc-700
                    text-xs
                    font-bold
                    uppercase
                    text-white
                  "
                >
                  {participant.nome.slice(0, 2)}
                </span>

                {!collapsed && (
                  <span className="flex-1 truncate text-sm text-white">
                    {participant.nome}
                  </span>
                )}

                {!collapsed && (
                  <span className="font-bold text-violet-300">
                    {participant.iniciativa}
                  </span>
                )}
              </button>

              {!collapsed && (
                <button
                  onClick={() => handleRemoveParticipant(index)}
                  title="Remover"
                  className="
                    flex
                    h-7
                    w-7
                    shrink-0
                    items-center
                    justify-center
                    rounded-md
                    text-zinc-500
                    transition
                    hover:bg-red-900/30
                    hover:text-red-400
                  "
                >
                  <FaTimes size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ================= SEÇÃO ROLAGEM DE DADOS / RESULTADOS ================= */}

      {!collapsed && (
        <section className="mt-8 flex flex-col gap-3 border-t border-zinc-800 pt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Rolagem de Dados
          </h2>

          <input
            value={notation}
            onChange={(e) => setNotation(e.target.value)}
            placeholder="2d20 + 5 ou 15"
            className="
              h-10
              w-full
              rounded-lg
              border
              border-zinc-700
              bg-zinc-800
              px-3
              text-sm
              text-white
              outline-none
              focus:border-violet-500
            "
          />

          <button
            onClick={rollDice}
            className={`${buttonBase} w-full bg-violet-600 text-white hover:bg-violet-700`}
          >
            <FaDice size={14} />
            Rolar Dados
          </button>

          {/* Rolagem de ataque: mostra Teste + Dano/Dano Crítico juntos.
              Qualquer outra rolagem (livre ou perícia): mostra só 1. */}
          {pairedTestRoll && (
            <div className="space-y-2">
              <RollResultBlock roll={pairedTestRoll} />
              <RollResultBlock roll={lastRoll} />
            </div>
          )}

          {!pairedTestRoll && lastRoll && <RollResultBlock roll={lastRoll} />}

          <button
            onClick={clearHistory}
            className={`${buttonBase} w-full border border-zinc-700 text-zinc-400 hover:border-red-700 hover:text-red-400`}
          >
            <FaTrash size={12} />
            Limpar Histórico
          </button>
        </section>
      )}

      {/* ENCERRAR COMBATE */}

      {!collapsed && (
        <button
          onClick={handleEndCombat}
          className={`${buttonBase} mt-8 w-full border border-red-700 text-red-500 hover:bg-red-900/30`}
        >
          <FaFlag size={13} />
          Encerrar Combate
        </button>
      )}
    </aside>
  );
}