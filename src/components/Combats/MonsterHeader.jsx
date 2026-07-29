import { useState, useMemo, useEffect } from "react";
import { BsShield } from "react-icons/bs";
import { GiBroadsword } from "react-icons/gi";
import { FaHeart, FaHeartbeat, FaRunning, FaBrain, FaDice } from "react-icons/fa";
import { MdOutlineEdit } from "react-icons/md";
import CreateCombatModal from "../subcomponents/CreateCombatModal";

import { useDataHandler } from "../../context/dataHandlerContext/DataHandlerContext";

const ELEMENT_COLORS = {
  Sangue: "text-red-500",
  Morte: "text-zinc-300",
  Conhecimento: "text-blue-400",
  Energia: "text-yellow-400",
};

// Nomes completos dos atributos, usados no label da rolagem (histórico da
// Sidebar) e no title do botão de dado de cada hexágono.
const ATTRIBUTE_LABELS = {
  agility: "Agilidade",
  strength: "Força",
  intellect: "Intelecto",
  presence: "Presença",
  vigor: "Vigor",
};

// Teste de Atributo: rola "quantity" d20 (quantity = valor do atributo) e
// usa só o MAIOR resultado — sem bônus, sem soma.
function rollAttributeTest(quantity) {
  const qty = Math.max(1, Number(quantity) || 1);

  const rolls = Array.from(
    { length: qty },
    () => 1 + Math.floor(Math.random() * 20)
  );

  const highestIndex = rolls.reduce(
    (bestIndex, value, index) => (value > rolls[bestIndex] ? index : bestIndex),
    0
  );

  return { rolls, highestIndex, total: rolls[highestIndex] };
}

function EditableNumber({ value, onChange, className, placeholder = "0" }) {
  const [text, setText] = useState(value ? String(value) : "");
  useEffect(() => {
    setText(value ? String(value) : "");
  }, [value]);

  function handleChange(e) {
    const raw = e.target.value;
    if (raw !== "" && !/^-?\d*$/.test(raw)) return;
    setText(raw);
    onChange(raw === "" ? 0 : Number(raw));
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      value={text}
      onChange={handleChange}
      placeholder={placeholder}
      className={`shrink-0 ${className}`}
    />
  );
}

function EditableText({ value, onChange, className, placeholder }) {
  const [text, setText] = useState(value || "");

  function handleChange(e) {
    setText(e.target.value);
    onChange(e.target.value);
  }

  return (
    <input
      type="text"
      value={text}
      onChange={handleChange}
      placeholder={placeholder}
      className={`shrink-0 ${className}`}
    />
  );
}

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

// Dano de Sanidade: soma TODOS os dados rolados (não pega o maior, não usa
// bônus externo — o campo "value" ao lado é só visual, não entra na conta).
function rollDamageNotation(notation) {
  const parsed = parseDiceNotation(notation);

  if (!parsed) return null;

  const rolls = Array.from(
    { length: parsed.count },
    () => 1 + Math.floor(Math.random() * parsed.sides)
  );

  const total = rolls.reduce((sum, value) => sum + value, 0);

  return { rolls, total };
}

const numberInput = `
  w-full
  h-full
  bg-transparent
  text-center
  font-bold
  text-white
  outline-none
`;

function Hexagon({ value, onChange }) {
  return (
    <div
      className="
        flex
        h-14
        w-14
        shrink-0
        items-center
        justify-center
        bg-violet-700/80
        text-lg
        transition
        hover:bg-violet-600
      "
      style={{
        clipPath:
          "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
      }}
    >
      <EditableNumber value={value} onChange={onChange} className={numberInput} />
    </div>
  );
}

function Shield({ value, onChange }) {
  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: 110, height: 110 }}
    >
      <BsShield
        size={110}
        className="
          absolute
          inset-0
          text-violet-400
          drop-shadow-[0_0_14px_rgba(139,92,246,0.55)]
        "
      />

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-0.5">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-300">
          Defesa
        </span>

        <EditableNumber
          value={value}
          onChange={onChange}
          className="w-14 bg-transparent text-center text-2xl font-bold text-white outline-none"
        />
      </div>
    </div>
  );
}

export default function MonsterHeader({
  monster,

  onDamage,
  onHeal,
  onAttributeChange,
  onDefenseChange,
  onMovementChange,
  onSanityDamageChange,
  onSanityValueChange,
  onSanityDamageRoll,
  onHpCurrentChange,
  onHpMaxChange,
  onMonsterInfoChange,
}) {
  const [amount, setAmount] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const { setRollHistory } = useDataHandler();
  // Guard: sem monstro selecionado, não renderiza nada em vez de quebrar
  // tentando ler monster.hp / monster.combat / monster.attributes.
  if (!monster) return null;

  function handleRollSanityDamage() {
    const result = rollDamageNotation(monster.combat.sanityDamage.damage);

    if (!result) {
      window.alert(
        `Dano de sanidade inválido: "${monster.combat.sanityDamage.damage}". Use o formato ex: 2d10`
      );
      return;
    }

    setRollHistory((prev) => [
      {
        id: crypto.randomUUID(),
        type: "dano-sanidade",
        label: "Dano de Sanidade",
        rolls: result.rolls,
        modifier: 0,
        total: result.total,
      },
      ...(prev || []),
    ]);

    onSanityDamageRoll?.(result);
  }

  function handleRollAttribute(key, value) {
    const result = rollAttributeTest(value);

    setRollHistory((prev) => [
      {
        id: crypto.randomUUID(),
        type: "atributo",
        label: `Teste de ${ATTRIBUTE_LABELS[key] || key}`,
        rolls: result.rolls,
        highestIndex: result.highestIndex,
        modifier: 0,
        total: result.total,
      },
      ...(prev || []),
    ]);
  }

  function handleEditSave(data) {
    onMonsterInfoChange?.({
      name: data.name,
      image: data.image,
      type: data.type,
      element: data.element,
    });
  }

  const hpMax = monster.hp.max || 0;

  const hpPercent =
    hpMax > 0
      ? Math.max(0, Math.min(100, (monster.hp.current / hpMax) * 100))
      : 0;

  const squares = monster.combat.movement
    ? Math.round(monster.combat.movement / 1.5)
    : 0;

  function applyAmount(direction) {
    const value = Number(amount);

    if (!value) return;

    if (direction === "damage") onDamage(value);
    else onHeal(value);

    setAmount("");
  }

  const editModalCombat = useMemo(
    () => ({
      name: monster.name,
      image: monster.image,
      type: monster.type,
      element: monster.element,
    }),
    [monster.name, monster.image, monster.type, monster.element]
  );

  return (
    <>
    <section
      className="
        rounded-xl
        border
        border-zinc-800
        bg-zinc-900/70
        p-6
        backdrop-blur
      "
    >
      {/* ================= LINHA 1: FOTO / NOME / ELEMENTO ... ESCUDO + GRID (DESLOCAMENTO / SANIDADE) =================
          flex-nowrap: o bloco da direita (escudo + grid) nunca deve quebrar linha, mesmo com a sidebar aberta.
          O bloco da esquerda (foto + nome) é o único que pode encolher (min-w-0 flex-1) caso falte espaço. */}

      <div className="flex flex-nowrap items-start justify-between gap-4 overflow-x-auto">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div
            className="
              h-28
              w-28
              shrink-0
              overflow-hidden
              rounded-lg
              border
              border-zinc-700
              bg-zinc-800
            "
          >
            {monster.image ? (
              <img
                src={monster.image}
                alt={monster.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-2 text-center text-xs text-zinc-500">
                Sem imagem
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="truncate text-3xl font-bold text-white">
                {monster.name}
              </h1>

              <button
                onClick={() => setEditOpen(true)}
                title="Editar Nome/Imagem/Tipo/Elemento"
                className="
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  text-zinc-500
                  transition
                  hover:bg-violet-900/40
                  hover:text-violet-300
                "
              >
                <MdOutlineEdit size={15} />
              </button>

              {monster.type && (
                <span
                  className="
                    shrink-0
                    rounded-md
                    bg-red-700/80
                    px-2
                    py-1
                    text-xs
                    font-semibold
                    uppercase
                    text-white
                  "
                >
                  {monster.type}
                </span>
              )}
            </div>

            {monster.element && (
              <p className="mt-2 truncate text-zinc-400">
                Elemento
                <span
                  className={`ml-2 font-semibold ${ELEMENT_COLORS[monster.element] || "text-zinc-300"}`}
                >
                  {monster.element}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Escudo separado + grid de 2 colunas (Deslocamento / Sanidade) — shrink-0 garante que fica fixo à direita, no mesmo tamanho, nunca cai pra baixo */}

        <div className="flex shrink-0 flex-nowrap items-center gap-5">
          <Shield value={monster.combat.defense} onChange={onDefenseChange} />

          <div
            className="
              grid
              grid-cols-2
              divide-x
              divide-zinc-800
              overflow-hidden
              rounded-xl
              border
              border-zinc-800
              bg-zinc-950/40
            "
          >
            <div className="flex flex-col items-center gap-1 px-5 py-3">
              <div className="flex items-center gap-1">
                <EditableNumber
                  value={monster.combat.movement}
                  onChange={onMovementChange}
                  className="w-10 bg-transparent text-center text-lg font-bold text-white outline-none"
                />
                <span className="text-xs text-zinc-400">m</span>
              </div>

              <span className="text-[10px] text-zinc-500">
                {squares} quadrados
              </span>

              <span className="flex items-center gap-1 text-[10px] uppercase text-zinc-500">
                <FaRunning />
                Deslocamento
              </span>
            </div>

            <div className="flex flex-col items-center gap-1 px-5 py-3">
              <div className="flex items-center gap-1">
                <EditableText
                  value={monster.combat.sanityDamage.damage}
                  onChange={onSanityDamageChange}
                  placeholder="2d10"
                  className="w-12 bg-transparent text-center text-lg font-bold text-white outline-none"
                />
                <span className="text-zinc-600">/</span>
                <EditableNumber
                  value={monster.combat.sanityDamage.value}
                  onChange={onSanityValueChange}
                  className="w-8 bg-transparent text-center text-lg font-bold text-violet-400 outline-none"
                />

                <button
                  onClick={handleRollSanityDamage}
                  title="Rolar Dano de Sanidade"
                  className="
                    flex
                    h-6
                    w-6
                    shrink-0
                    items-center
                    justify-center
                    rounded-md
                    bg-violet-700/80
                    text-white
                    transition
                    hover:bg-violet-600
                  "
                >
                  <FaDice size={11} />
                </button>
              </div>

              <span className="flex items-center gap-1 text-[10px] uppercase text-zinc-500">
                <FaBrain />
                Presença Perturbadora
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= LINHA 2: HP ... ATRIBUTOS =================
          mt-6 -> mt-3 e p-4 -> p-3: aproxima esse bloco da Linha 1, "subindo" o HP/atributos. */}

      <div
        className="
          mt-3
          flex
          flex-wrap
          items-center
          justify-between
          gap-6
          rounded-xl
          border
          border-zinc-800
          bg-zinc-950/40
          p-3
        "
      >
        <div className="min-w-[220px] flex-1">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-red-300">
              <FaHeartbeat />
              HP
            </span>

            <div className="flex items-center gap-1 font-semibold text-white">
              <EditableNumber
                value={monster.hp.current}
                onChange={onHpCurrentChange}
                className="
                  w-14
                  rounded-md
                  border
                  border-zinc-700
                  bg-zinc-950
                  px-2
                  py-1
                  text-center
                  text-sm
                  outline-none
                  focus:border-violet-500
                "
              />

              <span className="text-zinc-500">/</span>

              <EditableNumber
                value={monster.hp.max}
                onChange={onHpMaxChange}
                className="
                  w-14
                  rounded-md
                  border
                  border-zinc-700
                  bg-zinc-950
                  px-2
                  py-1
                  text-center
                  text-sm
                  outline-none
                  focus:border-violet-500
                "
              />
            </div>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-red-600 transition-all"
              style={{ width: `${hpPercent}%` }}
            />
          </div>

          {/* Dano à esquerda, valor centralizado embaixo, cura à direita */}
          <div className="mt-3 flex items-center justify-between gap-3">
            <button
              onClick={() => applyAmount("damage")}
              title="Aplicar dano"
              className="
                group
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-red-800/70
                bg-red-950/50
                text-red-400
                shadow-[0_0_14px_rgba(220,38,38,0.3)]
                transition
                hover:scale-105
                hover:border-red-600
                hover:bg-red-900/70
                hover:text-red-300
                hover:shadow-[0_0_18px_rgba(220,38,38,0.55)]
                active:scale-95
              "
            >
              <GiBroadsword size={17} className="transition group-hover:-rotate-12" />
            </button>

            <div className="flex flex-1 flex-col items-center gap-1">
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="
                  w-16
                  rounded-lg
                  border
                  border-zinc-700
                  bg-zinc-950
                  py-1.5
                  text-center
                  text-base
                  font-bold
                  text-white
                  outline-none
                  transition
                  focus:border-violet-500
                  focus:shadow-[0_0_0_3px_rgba(139,92,246,0.25)]
                "
              />
              <span className="text-[9px] font-semibold uppercase tracking-widest text-zinc-500">
                Valor
              </span>
            </div>

            <button
              onClick={() => applyAmount("heal")}
              title="Curar"
              className="
                group
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-emerald-800/70
                bg-emerald-950/50
                text-emerald-400
                shadow-[0_0_14px_rgba(16,185,129,0.3)]
                transition
                hover:scale-105
                hover:border-emerald-500
                hover:bg-emerald-900/70
                hover:text-emerald-300
                hover:shadow-[0_0_18px_rgba(16,185,129,0.55)]
                active:scale-95
              "
            >
              <FaHeart size={16} className="transition group-hover:scale-110" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {Object.entries(monster.attributes).map(([key, value]) => (
            <div key={key} className="flex flex-col items-center gap-1">
              <Hexagon
                value={value}
                onChange={(newValue) => onAttributeChange(key, newValue)}
              />

              <p className="text-[10px] uppercase text-zinc-500">
                {key.slice(0, 3)}
              </p>

              <button
                onClick={() => handleRollAttribute(key, value)}
                title={`Testar ${ATTRIBUTE_LABELS[key] || key} (${Math.max(1, Number(value) || 1)}d20)`}
                className="
                  flex
                  h-6
                  w-6
                  items-center
                  justify-center
                  rounded-md
                  bg-violet-700/80
                  text-white
                  transition
                  hover:bg-violet-600
                "
              >
                <FaDice size={11} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>

    <CreateCombatModal
      open={editOpen}
      onClose={() => setEditOpen(false)}
      onSave={handleEditSave}
      combat={editModalCombat}
    />
    </>
  );
}