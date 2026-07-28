import { useState, useEffect, useRef } from "react";
import { FaPlus, FaTimes, FaDice } from "react-icons/fa";

import { useDataHandler } from "../../context/dataHandlerContext/DataHandlerContext";

const ATTACK_TYPES = [
  "Balístico",
  "Corte",
  "Eletricidade",
  "Fogo",
  "Frio",
  "Impacto",
  "Mental",
  "Conhecimento",
  "Energia",
  "Medo",
  "Morte",
  "Sangue",
  "Perfuração",
  "Químico",
  "Dano",
];

// As 15 resistências fixas do sistema. O objeto monster.resistances usa
// essas strings como chave -> valor numérico. Nenhum tipo é
// adicionado/removido pelo usuário, só o valor de cada um muda.
const RESISTANCE_TYPES = [
  "Dano",
  "Balístico",
  "Corte",
  "Eletricidade",
  "Fogo",
  "Frio",
  "Impacto",
  "Mental",
  "Conhecimento",
  "Energia",
  "Medo",
  "Morte",
  "Sangue",
  "Perfuração",
  "Químico",
];

const inputClass = `
  w-full
  rounded-md
  border
  border-zinc-700
  bg-zinc-950
  px-2
  py-1.5
  text-sm
  text-white
  outline-none
  focus:border-violet-500
`;

// Layout compacto: campos em grid 2 colunas, rótulo estreito à esquerda
// do próprio input, sem divisores entre linhas — menos altura, menos
// espaço em branco.
const fieldRow = "flex items-center gap-2 py-1";
const fieldLabel =
  "text-[11px] uppercase tracking-wide text-zinc-500 w-24 shrink-0";

const fieldInputClass = `
  w-full
  rounded-md
  border
  border-zinc-700
  bg-zinc-950
  px-2
  py-1
  text-sm
  text-white
  text-left
  outline-none
  focus:border-violet-500
`;

// Destaque de crítico: sublinhado + verde-claro brilhante.
const critValueClass =
  "text-green-400 underline decoration-2 decoration-green-400 [text-shadow:0_0_8px_rgba(74,222,128,0.55)]";

// Campo numérico sem as setinhas de incrementar/decrementar do type="number".
// Mantém um texto local pra permitir digitar "-" no meio da edição sem
// o campo ser resetado a cada tecla, e não sobrescreve o campo enquanto
// o usuário está com foco nele (senão o valor volta pra "0" sozinho
// assim que você apaga o campo pra digitar de novo).
function NumericField({ value, onChange, className, placeholder = "0" }) {
  const [text, setText] = useState(
    value || value === 0 ? String(value) : ""
  );
  const isFocused = useRef(false);

  useEffect(() => {
    if (isFocused.current) return; // não sobrescreve enquanto o usuário está digitando
    setText(value || value === 0 ? String(value) : "");
  }, [value]);

  function handleChange(e) {
    const raw = e.target.value;
    if (raw !== "" && !/^-?\d*$/.test(raw)) return;
    setText(raw);
    if (raw !== "" && raw !== "-") {
      onChange(Number(raw));
    }
  }

  function handleBlur() {
    isFocused.current = false;
    if (text === "" || text === "-") {
      onChange(0);
      setText("0");
    }
  }

  function handleFocus() {
    isFocused.current = true;
    // Se o campo estiver mostrando "0", limpa ao focar — assim o usuário
    // digita o valor direto, sem precisar apagar o zero antes.
    if (text === "0") {
      setText("");
    }
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      value={text}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
    />
  );
}

// Textarea de descrição com altura automática (cresce conforme o usuário
// digita, tipo Notion/Google Docs) — nunca precisa de scroll interno.
function AutoResizeTextarea({ value, onChange, placeholder }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = `${ref.current.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      className={`${inputClass} resize-none overflow-hidden leading-relaxed`}
    />
  );
}

// ---------- Regras de dado ----------

function parseDiceNotation(notation) {
  const cleaned = (notation || "").replace(/\s/g, "");
  const match = cleaned.match(/^(\d+)d(\d+)([+-]\d+)?$/i);

  if (!match) return null;

  return {
    count: Number(match[1]),
    sides: Number(match[2]),
    mod: match[3] ? Number(match[3]) : 0,
  };
}

function rollDamageNotation(notation) {
  const parsed = parseDiceNotation(notation);

  if (!parsed) return null;

  const rolls = Array.from(
    { length: parsed.count },
    () => 1 + Math.floor(Math.random() * parsed.sides)
  );

  const total = rolls.reduce((sum, value) => sum + value, 0) + parsed.mod;

  return { rolls, mod: parsed.mod, total };
}

// Multiplica só a quantidade de dados pelo multiplicador de crítico — o
// bônus fixo não multiplica. Ex: "2d8+5" x2 -> "4d8+5".
function multiplyDamageDice(notation, multiplier) {
  const parsed = parseDiceNotation(notation);

  if (!parsed) return notation;

  const newCount = parsed.count * (Number(multiplier) || 1);
  const modStr = parsed.mod
    ? parsed.mod > 0
      ? `+${parsed.mod}`
      : `${parsed.mod}`
    : "";

  return `${newCount}d${parsed.sides}${modStr}`;
}

// Teste de ataque, baseado numa notação digitada (ex: "1d20+5"). Rola a
// quantidade de dados indicada e calcula DOIS resultados de crítico
// independentes:
//
// - Teste Crítico: total (maior dado + bônus) >= (Margem de Ameaça + bônus)
// - Dano Crítico: maior dado BRUTO (sem bônus) >= Margem de Ameaça
function rollAttackTest(notation, threatMargin) {
  const parsed = parseDiceNotation(notation);

  if (!parsed) return null;

  const rolls = Array.from(
    { length: parsed.count },
    () => 1 + Math.floor(Math.random() * parsed.sides)
  );

  const highestIndex = rolls.reduce(
    (bestIndex, value, index) => (value > rolls[bestIndex] ? index : bestIndex),
    0
  );
  const highest = rolls[highestIndex];

  const margin = Number(threatMargin) || 20;
  const mod = parsed.mod;
  const total = highest + mod;

  const critTestThreshold = margin + mod;
  const isCriticalTest = total >= critTestThreshold;
  const isCriticalDamage = highest >= margin;

  return {
    rolls,
    highest,
    highestIndex,
    mod,
    total,
    threatMargin: margin,
    critTestThreshold,
    isCriticalTest,
    isCriticalDamage,
  };
}

function AttacksList({
  attacks,

  onAdd,
  onRemove,
  onChange,
  onTestResult,
  onDamageResult,
  onCritDamageResult,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm uppercase text-zinc-500">Ataques</h3>

        <button
          onClick={onAdd}
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
          <FaPlus size={11} />
          Adicionar Ataque
        </button>
      </div>

      <div className="space-y-2">
        {attacks.map((attack) => (
          <AttackCard
            key={attack.id}
            attack={attack}
            onChange={onChange}
            onRemove={onRemove}
            onTestResult={onTestResult}
            onDamageResult={onDamageResult}
            onCritDamageResult={onCritDamageResult}
          />
        ))}

        {attacks.length === 0 && (
          <p className="rounded-lg border border-dashed border-zinc-800 p-4 text-center text-xs text-zinc-600">
            Nenhum ataque cadastrado.
          </p>
        )}
      </div>
    </div>
  );
}

// ---------- Ataques (card: campos | caixas de resultado | descrição no fim) ----------

function AttackCard({
  attack,

  onChange,
  onRemove,
  onTestResult,
  onDamageResult,
  onCritDamageResult,
}) {
  const { setRollHistory } = useDataHandler();

  // Botão único: rola o Teste primeiro (sempre). Calcula Teste Crítico
  // (margem + bônus) e Dano Crítico (maior dado bruto >= margem) como
  // resultados independentes. Se o Dano Crítico for verdadeiro, rola e
  // mostra só o Dano Crítico; senão, rola e mostra só o Dano normal.
  // Os dois resultados (Teste + Dano/Dano Crítico) ficam salvos no
  // próprio ataque (pras caixas do card) E vão pro histórico da Sidebar.
  function handleRoll() {
    const testResult = rollAttackTest(attack.testNotation, attack.threatMargin);

    if (!testResult) {
      window.alert(
        `Teste inválido: "${attack.testNotation}". Use o formato ex: 1d20+5`
      );
      return;
    }

    setRollHistory((prev) => [
      {
        id: crypto.randomUUID(),
        type: "ataque-teste",
        label: `${attack.name} (Teste)`,
        rolls: testResult.rolls,
        highestIndex: testResult.highestIndex,
        modifier: testResult.mod,
        total: testResult.total,
        isCritical: testResult.isCriticalTest,
        threatMargin: testResult.threatMargin,
        testBonus: testResult.mod,
        critTestThreshold: testResult.critTestThreshold,
      },
      ...(prev || []),
    ]);

    onTestResult(attack.id, {
      total: testResult.total,
      isCritical: testResult.isCriticalDamage,
      isTestCritical: testResult.isCriticalTest,
    });

    if (testResult.isCriticalDamage) {
      const critDamage = multiplyDamageDice(attack.damage, attack.critMultiplier);
      const critResult = rollDamageNotation(critDamage);

      if (!critResult) {
        window.alert(`Dano crítico inválido: "${critDamage}".`);
        return;
      }

      setRollHistory((prev) => [
        {
          id: crypto.randomUUID(),
          type: "ataque-dano-critico",
          label: `${attack.name} (Dano Crítico)`,
          rolls: critResult.rolls,
          modifier: critResult.mod,
          total: critResult.total,
          isCritical: true,
        },
        ...(prev || []),
      ]);

      onCritDamageResult(attack.id, critResult);
    } else {
      const damageResult = rollDamageNotation(attack.damage);

      if (!damageResult) {
        window.alert(
          `Dano inválido: "${attack.damage}". Use o formato ex: 2d8+5`
        );
        return;
      }

      setRollHistory((prev) => [
        {
          id: crypto.randomUUID(),
          type: "ataque-dano",
          label: `${attack.name} (Dano)`,
          rolls: damageResult.rolls,
          modifier: damageResult.mod,
          total: damageResult.total,
          isCritical: false,
        },
        ...(prev || []),
      ]);

      onDamageResult(attack.id, damageResult);
    }
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-800/60 p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <input
          value={attack.name}
          onChange={(e) => onChange(attack.id, "name", e.target.value)}
          placeholder="Nome do ataque"
          className="flex-1 bg-transparent text-sm font-bold text-white outline-none focus:text-violet-300"
        />

        <button
          onClick={handleRoll}
          title="Rolar Ataque (Teste + Dano)"
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-violet-700/80
            text-white
            shadow-[0_0_10px_rgba(139,92,246,0.35)]
            transition
            hover:scale-105
            hover:bg-violet-600
            active:scale-95
          "
        >
          <FaDice size={14} />
        </button>

        <button
          onClick={() => onRemove(attack.id)}
          title="Remover Ataque"
          className="
            flex
            h-8
            w-8
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
          <FaTimes size={11} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <div className={fieldRow}>
          <span className={fieldLabel}>Tipo</span>
          <select
            value={attack.type}
            onChange={(e) => onChange(attack.id, "type", e.target.value)}
            className={fieldInputClass}
          >
            {ATTACK_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className={fieldRow}>
          <span className={fieldLabel}>Alcance</span>
          <input
            value={attack.range}
            onChange={(e) => onChange(attack.id, "range", e.target.value)}
            placeholder="3m"
            className={fieldInputClass}
          />
        </div>

        <div className={fieldRow}>
          <span className={fieldLabel}>Teste</span>
          <input
            value={attack.testNotation || ""}
            onChange={(e) =>
              onChange(attack.id, "testNotation", e.target.value)
            }
            placeholder="1d20+5"
            className={fieldInputClass}
          />
        </div>

        <div className={fieldRow}>
          <span className={fieldLabel}>Margem Ameaça</span>
          <NumericField
            value={attack.threatMargin}
            onChange={(value) =>
              onChange(attack.id, "threatMargin", value || 20)
            }
            className={fieldInputClass}
          />
        </div>

        <div className={fieldRow}>
          <span className={fieldLabel}>Dano</span>
          <input
            value={attack.damage}
            onChange={(e) => onChange(attack.id, "damage", e.target.value)}
            placeholder="2d8+5"
            className={fieldInputClass}
          />
        </div>

        <div className={fieldRow}>
          <span className={fieldLabel}>Mult. Crítico</span>
          <NumericField
            value={attack.critMultiplier}
            onChange={(value) =>
              onChange(attack.id, "critMultiplier", value || 2)
            }
            className={fieldInputClass}
          />
        </div>
      </div>

      {/* Caixas de resultado: Teste + Dano/Dano Crítico (nunca os dois de
          dano juntos — só um aparece, dependendo do último resultado). */}
      <div className="grid grid-cols-2 gap-3 border-t border-zinc-800/60 pt-2">
        <div className="rounded-md border border-zinc-700 bg-zinc-950/60 p-2 text-center">
          <p className="text-[10px] uppercase text-zinc-500">Teste</p>
          <p
            className={`text-base font-bold ${
              attack.lastTestCritical ? critValueClass : "text-violet-300"
            }`}
          >
            {attack.lastTestResult ?? "—"}
          </p>
        </div>

        <div className="rounded-md border border-zinc-700 bg-zinc-950/60 p-2 text-center">
          <p className="text-[10px] uppercase text-zinc-500">
            {attack.lastCritical ? "Dano Crítico" : "Dano"}
          </p>
          <p
            className={`text-base font-bold ${
              attack.lastCritical ? critValueClass : "text-red-300"
            }`}
          >
            {(attack.lastCritical
              ? attack.lastCritDamageResult
              : attack.lastDamageResult) ?? "—"}
          </p>
        </div>
      </div>

      <div className="border-t border-zinc-800/60 pt-2">
        <span className="mb-1 block text-[11px] uppercase tracking-wide text-zinc-500">
          Descrição
        </span>
        <AutoResizeTextarea
          value={attack.description || ""}
          onChange={(value) => onChange(attack.id, "description", value)}
          placeholder="Descreva o ataque..."
        />
      </div>
    </div>
  );
}

// ---------- Habilidades (nome + descrição) ----------

function AbilityCard({ ability, onChange, onRemove }) {
  return (
    <div className="relative space-y-2 rounded-lg border border-zinc-800 bg-zinc-800/60 p-3">
      <button
        onClick={() => onRemove(ability.id)}
        title="Remover Habilidade"
        className="
          absolute
          right-2
          top-2
          flex
          h-7
          w-7
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

      <input
        value={ability.name}
        onChange={(e) => onChange(ability.id, "name", e.target.value)}
        placeholder="Nome da habilidade"
        className="
          w-48
          bg-transparent
          text-sm
          font-medium
          text-zinc-100
          outline-none
          focus:text-violet-300
        "
      />

      <textarea
        value={ability.description}
        onChange={(e) => onChange(ability.id, "description", e.target.value)}
        placeholder="Descreva a habilidade..."
        rows={3}
        className={`${inputClass} resize-y leading-relaxed`}
      />
    </div>
  );
}

// ---------- Resistências (2 modos: edição com os 15 tipos fixos em grid,
// visualização em lista só com os valores >= 1) ----------

function ResistancesPanel({ resistances, onChange }) {
  const [editing, setEditing] = useState(false);

  // Defesa contra o formato antigo (array de {id,name,description}) em
  // monstros criados antes dessa mudança — trata como vazio.
  const values = resistances && !Array.isArray(resistances) ? resistances : {};

  const activeEntries = RESISTANCE_TYPES.map((type) => ({
    type,
    value: Number(values[type]) || 0,
  })).filter((entry) => entry.value >= 1);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm uppercase text-zinc-500">Resistências</h3>

        <div className="flex items-center gap-3">
          {activeEntries.length > 0 && (
            <button
              onClick={() =>
                RESISTANCE_TYPES.forEach((type) => onChange(type, 0))
              }
              title="Zerar todas as resistências"
              className="
                flex
                h-7
                w-7
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

          <button
            onClick={() => setEditing((prev) => !prev)}
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
            {editing ? (
              "Concluir"
            ) : activeEntries.length > 0 ? (
              "Editar"
            ) : (
              <>
                <FaPlus size={11} />
                Adicionar Resistências
              </>
            )}
          </button>
        </div>
      </div>

      {editing && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {RESISTANCE_TYPES.map((type) => (
            <div
              key={type}
              className="relative rounded-lg border border-zinc-800 bg-zinc-800/60 p-2 text-center"
            >
              <button
                onClick={() => onChange(type, 0)}
                title="Zerar"
                className="
                  absolute
                  right-1
                  top-1
                  flex
                  h-4
                  w-4
                  items-center
                  justify-center
                  rounded
                  text-zinc-500
                  transition
                  hover:bg-red-900/30
                  hover:text-red-400
                "
              >
                <FaTimes size={9} />
              </button>

              <p className="mb-1.5 truncate text-[11px] uppercase tracking-wide text-zinc-400">
                {type}
              </p>
              <NumericField
                value={values[type] ?? 0}
                onChange={(value) => onChange(type, value)}
                className={`${fieldInputClass} text-center`}
              />
            </div>
          ))}
        </div>
      )}

      {!editing &&
        (activeEntries.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-800 p-4 text-center text-xs text-zinc-600">
            Nenhuma resistência cadastrada.
          </p>
        ) : (
          <div
            className="
              grid
              grid-flow-col
              grid-rows-5
              gap-x-6
              gap-y-1
              rounded-lg
              border
              border-zinc-800
              bg-zinc-800/60
              p-3
            "
          >
            {activeEntries.map(({ type, value }) => (
              <span key={type} className="whitespace-nowrap text-sm">
                <span className="text-zinc-400">{type}:</span>{" "}
                <span className="font-semibold text-violet-300">{value}</span>
              </span>
            ))}
          </div>
        ))}
    </div>
  );
}

// ---------- Vulnerabilidades / Imunidades (inalteradas) ----------

function TagList({ title, items, onAdd, onRemove, onChange, placeholder }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase text-zinc-500">
          {title}
        </span>

        <button
          onClick={onAdd}
          className="
            flex
            items-center
            gap-1
            text-xs
            font-semibold
            text-violet-400
            transition
            hover:text-violet-300
          "
        >
          <FaPlus size={10} />
          Adicionar
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-2">
            <div className="w-128">
              <AutoResizeTextarea
                value={item.value}
                onChange={(value) => onChange(item.id, value)}
                placeholder={placeholder}
              />
            </div>

            <button
              onClick={() => onRemove(item.id)}
              title="Remover"
              className="
                mt-1.5
                flex
                h-6
                w-6
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
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-xs text-zinc-600">Nenhum registro.</p>
        )}
      </div>
    </div>
  );
}

// ---------- Componente principal ----------

export default function CombatSection({
  monster,

  onAttackAdd,
  onAttackRemove,
  onAttackChange,
  onAttackTestResult,
  onAttackDamageResult,
  onAttackCritDamageResult,

  onAbilityAdd,
  onAbilityRemove,
  onAbilityChange,

  onResistanceChange,

  onVulnerabilityAdd,
  onVulnerabilityRemove,
  onVulnerabilityChange,

  onImmunityAdd,
  onImmunityRemove,
  onImmunityChange,
}) {
  return (
    <div className="space-y-8">
      {/* ===== ATAQUES ===== */}

      <AttacksList
        attacks={monster.attacks}
        onAdd={onAttackAdd}
        onRemove={onAttackRemove}
        onChange={onAttackChange}
        onTestResult={onAttackTestResult}
        onDamageResult={onAttackDamageResult}
        onCritDamageResult={onAttackCritDamageResult}
      />

      {/* ===== HABILIDADES ===== */}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm uppercase text-zinc-500">Habilidades</h3>

          <button
            onClick={onAbilityAdd}
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
            <FaPlus size={11} />
            Adicionar Habilidade
          </button>
        </div>

        <div className="space-y-3">
          {monster.abilities.map((ability) => (
            <AbilityCard
              key={ability.id}
              ability={ability}
              onChange={onAbilityChange}
              onRemove={onAbilityRemove}
            />
          ))}

          {monster.abilities.length === 0 && (
            <p className="rounded-lg border border-dashed border-zinc-800 p-4 text-center text-xs text-zinc-600">
              Nenhuma habilidade cadastrada.
            </p>
          )}
        </div>
      </div>

      {/* ===== RESISTÊNCIAS / VULNERABILIDADES / IMUNIDADES ===== */}

      <div className="space-y-5">
        <ResistancesPanel
          resistances={monster.resistances}
          onChange={onResistanceChange}
        />

        <TagList
          title="Vulnerabilidades"
          items={monster.vulnerabilities}
          onAdd={onVulnerabilityAdd}
          onRemove={onVulnerabilityRemove}
          onChange={onVulnerabilityChange}
          placeholder="Elemento"
        />

        <TagList
          title="Imunidades"
          items={monster.immunities}
          onAdd={onImmunityAdd}
          onRemove={onImmunityRemove}
          onChange={onImmunityChange}
          placeholder="Efeito"
        />
      </div>
    </div>
  );
}