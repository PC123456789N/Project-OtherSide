import { FaPlus, FaTimes, FaDice } from "react-icons/fa";
import { GiBroadsword, GiCrossedSwords } from "react-icons/gi";

import { useDataHandler } from "../../context/dataHandlerContext/DataHandlerContext";

const ATTACK_TYPES = ["Corpo a Corpo", "Distância", "Ritual"];

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

const fieldRow = "grid grid-cols-2 items-center gap-3 border-b border-zinc-800/60 py-2 last:border-b-0";
const fieldLabel = "text-xs uppercase tracking-wide text-zinc-500";

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
        ? (parsed.mod > 0 ? `+${parsed.mod}` : `${parsed.mod}`)
        : "";

    return `${newCount}d${parsed.sides}${modStr}`;

}

// Teste de ataque: rola 1d20 + bônus digitado à mão pelo usuário (sem
// puxar nada de Atributo/Perícia). Crítico se o d20 puro bater a Margem
// de Ameaça.
function rollAttackTest(testBonus, threatMargin) {

    const roll = 1 + Math.floor(Math.random() * 20);
    const bonus = Number(testBonus) || 0;
    const isCritical = roll >= (Number(threatMargin) || 20);

    return { rolls: [roll], modifier: bonus, total: roll + bonus, isCritical };

}

// ---------- Ataques (cards, lista de duas colunas) ----------

function AttackCard({

    attack,

    onChange,
    onRemove,
    onTestResult,
    onDamageResult,
    onCritDamageResult,

}) {

    const { setRollHistory } = useDataHandler();

    const critDamage = multiplyDamageDice(attack.damage, attack.critMultiplier);

    function handleTest() {

        const result = rollAttackTest(attack.testBonus, attack.threatMargin);

        setRollHistory((prev) => [
            {
                id: crypto.randomUUID(),
                type: "ataque-teste",
                label: `${attack.name} (Teste)`,
                rolls: result.rolls,
                modifier: result.modifier,
                total: result.total,
                isCritical: result.isCritical,
            },
            ...(prev || []),
        ]);

        onTestResult(attack.id, result);

    }

    function handleDamage() {

        const result = rollDamageNotation(attack.damage);

        if (!result) {
            window.alert(`Dano inválido: "${attack.damage}". Use o formato ex: 2d8+5`);
            return;
        }

        setRollHistory((prev) => [
            {
                id: crypto.randomUUID(),
                type: "ataque-dano",
                label: `${attack.name} (Ataque)`,
                rolls: result.rolls,
                modifier: result.mod,
                total: result.total,
            },
            ...(prev || []),
        ]);

        onDamageResult(attack.id, result);

    }

    function handleCritDamage() {

        const result = rollDamageNotation(critDamage);

        if (!result) {
            window.alert(`Dano crítico inválido: "${critDamage}".`);
            return;
        }

        setRollHistory((prev) => [
            {
                id: crypto.randomUUID(),
                type: "ataque-dano-critico",
                label: `${attack.name} (Ataque Crítico)`,
                rolls: result.rolls,
                modifier: result.mod,
                total: result.total,
                isCritical: true,
            },
            ...(prev || []),
        ]);

        onCritDamageResult(attack.id, result);

    }

    return (

        <div className="rounded-lg border border-zinc-800 bg-zinc-800/60 p-4 space-y-3">

            <div className="flex items-start justify-between gap-3">

                <input
                    value={attack.name}
                    onChange={(e) => onChange(attack.id, "name", e.target.value)}
                    placeholder="Nome do ataque"
                    className="flex-1 bg-transparent text-lg font-bold text-white outline-none focus:text-violet-300"
                />

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
                    <FaTimes size={12} />
                </button>

            </div>

            {/* Lista simples de duas colunas: rótulo à esquerda, campo à direita */}
            <div>

                <div className={fieldRow}>
                    <span className={fieldLabel}>Tipo</span>
                    <select
                        value={attack.type}
                        onChange={(e) => onChange(attack.id, "type", e.target.value)}
                        className={inputClass}
                    >
                        {ATTACK_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <div className={fieldRow}>
                    <span className={fieldLabel}>Alcance</span>
                    <input
                        value={attack.range}
                        onChange={(e) => onChange(attack.id, "range", e.target.value)}
                        placeholder="3m"
                        className={inputClass}
                    />
                </div>

                <div className={fieldRow}>
                    <span className={fieldLabel}>Bônus de Teste</span>
                    <input
                        type="number"
                        value={attack.testBonus}
                        onChange={(e) => onChange(attack.id, "testBonus", Number(e.target.value) || 0)}
                        title="Somado ao d20 no botão Teste"
                        className={inputClass}
                    />
                </div>

                <div className={fieldRow}>
                    <span className={fieldLabel}>Margem de Ameaça</span>
                    <input
                        type="number"
                        min={1}
                        max={20}
                        value={attack.threatMargin}
                        onChange={(e) => onChange(attack.id, "threatMargin", Number(e.target.value) || 20)}
                        title="A partir de qual número no d20 é crítico"
                        className={inputClass}
                    />
                </div>

                <div className={fieldRow}>
                    <span className={fieldLabel}>Dano</span>
                    <input
                        value={attack.damage}
                        onChange={(e) => onChange(attack.id, "damage", e.target.value)}
                        placeholder="2d8+5"
                        className={inputClass}
                    />
                </div>

                <div className={fieldRow}>
                    <span className={fieldLabel}>Multiplicador Crítico</span>
                    <input
                        type="number"
                        min={1}
                        value={attack.critMultiplier}
                        onChange={(e) => onChange(attack.id, "critMultiplier", Number(e.target.value) || 2)}
                        className={inputClass}
                    />
                </div>

                <div className={fieldRow}>
                    <span className={fieldLabel}>Dano Crítico (calc.)</span>
                    <span className="text-sm font-semibold text-violet-300">
                        {critDamage}
                    </span>
                </div>

            </div>

            {/* Três botões pedidos */}
            <div className="flex flex-wrap gap-2 pt-1">

                <button
                    onClick={handleTest}
                    className="
                        flex
                        items-center
                        gap-1.5
                        rounded-md
                        bg-violet-700/80
                        px-3
                        py-1.5
                        text-xs
                        font-semibold
                        text-white
                        transition
                        hover:bg-violet-600
                    "
                >
                    <FaDice size={12} />
                    Teste
                </button>

                <button
                    onClick={handleDamage}
                    className="
                        flex
                        items-center
                        gap-1.5
                        rounded-md
                        bg-red-700/80
                        px-3
                        py-1.5
                        text-xs
                        font-semibold
                        text-white
                        transition
                        hover:bg-red-700
                    "
                >
                    <GiBroadsword size={12} />
                    Ataque
                </button>

                <button
                    onClick={handleCritDamage}
                    className="
                        flex
                        items-center
                        gap-1.5
                        rounded-md
                        bg-orange-700/80
                        px-3
                        py-1.5
                        text-xs
                        font-semibold
                        text-white
                        transition
                        hover:bg-orange-600
                    "
                >
                    <GiCrossedSwords size={12} />
                    Ataque Crítico
                </button>

            </div>

            {/* Pequenos grids de resultado, embaixo da tabela/cards */}
            <div className="grid grid-cols-3 gap-2 pt-1">

                <div className="rounded-md border border-zinc-700 bg-zinc-950/60 p-2 text-center">
                    <p className="text-[10px] uppercase text-zinc-500">Teste</p>
                    <p className="text-lg font-bold text-violet-300">
                        {attack.lastTestResult ?? "—"}
                    </p>
                    {
                        attack.lastCritical && (
                            <span className="rounded bg-red-700/80 px-1 text-[9px] font-bold uppercase text-white">
                                Crít.
                            </span>
                        )
                    }
                </div>

                <div className="rounded-md border border-zinc-700 bg-zinc-950/60 p-2 text-center">
                    <p className="text-[10px] uppercase text-zinc-500">Ataque</p>
                    <p className="text-lg font-bold text-red-300">
                        {attack.lastDamageResult ?? "—"}
                    </p>
                </div>

                <div className="rounded-md border border-zinc-700 bg-zinc-950/60 p-2 text-center">
                    <p className="text-[10px] uppercase text-zinc-500">Atq. Crítico</p>
                    <p className="text-lg font-bold text-orange-300">
                        {attack.lastCritDamageResult ?? "—"}
                    </p>
                </div>

            </div>

        </div>

    );

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

                <h3 className="text-sm uppercase text-zinc-500">
                    Ataques
                </h3>

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

            <div className="space-y-3">

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

// ---------- Habilidades ----------

function AbilityCard({ ability, onChange, onRemove }) {

    return (

        <div className="rounded-lg border border-zinc-800 bg-zinc-800/60 p-4 space-y-3">

            <div className="flex items-start justify-between gap-3">

                <input
                    value={ability.name}
                    onChange={(e) => onChange(ability.id, "name", e.target.value)}
                    placeholder="Nome da habilidade"
                    className="flex-1 bg-transparent text-lg font-bold text-white outline-none focus:text-violet-300"
                />

                <button
                    onClick={() => onRemove(ability.id)}
                    title="Remover Habilidade"
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
                    <FaTimes size={12} />
                </button>

            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[220px_1fr]">

                <div>
                    <span className="mb-1 block text-[10px] uppercase tracking-wide text-zinc-500">
                        Nome do Atributo
                    </span>
                    <input
                        value={ability.attributeName}
                        onChange={(e) => onChange(ability.id, "attributeName", e.target.value)}
                        placeholder="Ex: Fúria Descontrolada"
                        className={inputClass}
                    />
                </div>

                <div>
                    <span className="mb-1 block text-[10px] uppercase tracking-wide text-zinc-500">
                        Descrição do Atributo
                    </span>
                    <textarea
                        value={ability.attributeDescription}
                        onChange={(e) => onChange(ability.id, "attributeDescription", e.target.value)}
                        placeholder="Descreva o que esse atributo faz..."
                        rows={2}
                        className={`${inputClass} resize-y leading-relaxed`}
                    />
                </div>

            </div>

        </div>

    );

}

// ---------- Resistências (simples: nome + descrição) ----------

function ResistanceCard({ resistance, onChange, onRemove }) {

    return (

        <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-800/60 p-3">

            <div className="flex items-center gap-2">

                <input
                    value={resistance.name}
                    onChange={(e) => onChange(resistance.id, "name", e.target.value)}
                    placeholder="Nome da resistência"
                    className={`${inputClass} flex-1 font-medium`}
                />

                <button
                    onClick={() => onRemove(resistance.id)}
                    title="Remover Resistência"
                    className="
                        flex
                        h-9
                        w-9
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

            <textarea
                value={resistance.description}
                onChange={(e) => onChange(resistance.id, "description", e.target.value)}
                placeholder="Descreva a resistência..."
                rows={3}
                className={`${inputClass} resize-y leading-relaxed`}
            />

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

            <div className="flex flex-wrap gap-2">

                {items.map((item) => (

                    <div
                        key={item.id}
                        className="
                            flex
                            items-center
                            gap-2
                            rounded-md
                            border
                            border-zinc-700
                            bg-zinc-800/60
                            px-2
                            py-1
                        "
                    >

                        <input
                            value={item.value}
                            onChange={(e) => onChange(item.id, e.target.value)}
                            placeholder={placeholder}
                            className="w-28 bg-transparent text-sm text-white outline-none"
                        />

                        <button
                            onClick={() => onRemove(item.id)}
                            title="Remover"
                            className="text-zinc-500 transition hover:text-red-400"
                        >
                            <FaTimes size={10} />
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

    onResistanceAdd,
    onResistanceRemove,
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

                    <h3 className="text-sm uppercase text-zinc-500">
                        Habilidades
                    </h3>

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

                <div className="space-y-3">

                    <div className="flex items-center justify-between">

                        <h3 className="text-sm uppercase text-zinc-500">
                            Resistências
                        </h3>

                        <button
                            onClick={onResistanceAdd}
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
                            Adicionar Resistência
                        </button>

                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                        {monster.resistances.map((resistance) => (
                            <ResistanceCard
                                key={resistance.id}
                                resistance={resistance}
                                onChange={onResistanceChange}
                                onRemove={onResistanceRemove}
                            />
                        ))}

                        {monster.resistances.length === 0 && (
                            <p className="rounded-lg border border-dashed border-zinc-800 p-4 text-center text-xs text-zinc-600 sm:col-span-2">
                                Nenhuma resistência cadastrada.
                            </p>
                        )}

                    </div>

                </div>

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