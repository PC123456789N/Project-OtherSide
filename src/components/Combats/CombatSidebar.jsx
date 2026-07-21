import { useState } from "react";
import { FaPlus, FaTimes, FaDice, FaTrash, FaFlag } from "react-icons/fa";

import { useDataHandler } from "../../context/dataHandlerContext/DataHandlerContext";

const DICE_PRESETS = ["d4", "d6", "d8", "d10", "d12", "d20", "Personalizado"];

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

export default function CombatSidebar({

    entities,

    selectedEntity,

    setSelectedEntity,

}) {

    const { initiativeList, setInitiativeList, rollHistory, setRollHistory } = useDataHandler();

    const lista = initiativeList || [];

    // rollHistory é compartilhado via contexto — rolagem livre, rolagem de
    // perícia e rolagem de ataque (teste e dano) todas escrevem nele, então
    // aparecem juntas aqui, na ordem em que aconteceram.
    const history = rollHistory || [];

    const [collapsed, setCollapsed] = useState(false);

    const [showAddForm, setShowAddForm] = useState(false);
    const [newNome, setNewNome] = useState("");
    const [newIniciativa, setNewIniciativa] = useState("");

    const [diceType, setDiceType] = useState("Personalizado");
    const [notation, setNotation] = useState("2d20+5");

    function findMatchingEntity(nome) {
        return entities.find(
            (entity) => entity.name.toLowerCase() === nome.toLowerCase()
        );
    }

    function handleSelectParticipant(participant) {

        const match = findMatchingEntity(participant.nome);

        if (match) {
            setSelectedEntity(match);
        }

    }

    function handleAddParticipant() {

        if (!newNome || !newIniciativa) return;

        const novaLista = [
            ...lista,
            { nome: newNome, iniciativa: Number(newIniciativa) }
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

        if (
            !window.confirm(
                "Deseja encerrar o combate? Isso vai limpar a lista de iniciativas."
            )
        )
            return;

        setInitiativeList([]);

    }

    function handleDiceTypeChange(type) {

        setDiceType(type);

        if (type !== "Personalizado") {
            setNotation(`1${type}`);
        }

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
            window.alert("Notação inválida. Use o formato: 2d20+5 ou um número inteiro (ex: 15)");
            return;
        }

        const count = Number(match[1]);
        const sides = Number(match[2]);
        const modifier = match[3] ? Number(match[3]) : 0;

        const rolls = Array.from(
            { length: count },
            () => Math.floor(Math.random() * sides) + 1
        );

        const total = rolls.reduce((sum, value) => sum + value, 0) + modifier;

        setRollHistory((prev) => [
            {
                id: crypto.randomUUID(),
                notation,
                rolls,
                modifier,
                total,
            },
            ...(prev || []),
        ]);

    }

    function clearHistory() {
        setRollHistory([]);
    }

    const lastRoll = history[0];

    // Rolagens de perícia e de teste de ataque só somam o MAIOR d20 (os
    // outros são descartados) — reconhecidas pela presença de highestIndex,
    // em vez de checar um "type" específico, assim qualquer rolagem futura
    // que siga essa mesma regra já é exibida corretamente sem precisar
    // mexer aqui de novo.
    const usesHighest = lastRoll?.highestIndex !== undefined && lastRoll?.highestIndex !== null;

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

                {
                    !collapsed && (
                        <h1 className="text-lg font-bold tracking-wide text-white">
                            Combate
                        </h1>
                    )
                }

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

                    {
                        !collapsed && (
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                                Iniciativas
                            </h2>
                        )
                    }

                    {
                        !collapsed && (
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
                                {
                                    showAddForm
                                        ? <FaTimes />
                                        : <FaPlus />
                                }
                                {showAddForm ? "Cancelar" : "Adicionar"}
                            </button>
                        )
                    }

                </div>

                {
                    !collapsed && showAddForm && (

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

                    )
                }

                <div className="flex flex-col gap-2">

                    {
                        lista.length === 0 && !collapsed && (
                            <p className="rounded-lg border border-dashed border-zinc-800 p-4 text-center text-xs text-zinc-600">
                                Nenhum participante na iniciativa.
                            </p>
                        )
                    }

                    {

                        lista.map((participant, index) => (

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

                                    {
                                        !collapsed && (
                                            <span className="flex-1 truncate text-sm text-white">
                                                {participant.nome}
                                            </span>
                                        )
                                    }

                                    {
                                        !collapsed && (
                                            <span className="font-bold text-violet-300">
                                                {participant.iniciativa}
                                            </span>
                                        )
                                    }

                                </button>

                                {
                                    !collapsed && (
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
                                    )
                                }

                            </div>

                        ))

                    }

                </div>

            </section>

            {/* ================= SEÇÃO ROLAGEM DE DADOS ================= */}

            {
                !collapsed && (

                    <section className="mt-8 flex flex-col gap-3 border-t border-zinc-800 pt-6">

                        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                            Rolagem de Dados
                        </h2>

                        <div>

                            <label className="mb-1 block text-xs text-zinc-500">
                                Tipo de rolagem
                            </label>

                            <select
                                value={diceType}
                                onChange={(e) => handleDiceTypeChange(e.target.value)}
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
                                "
                            >
                                {
                                    DICE_PRESETS.map((preset) => (
                                        <option key={preset} value={preset}>
                                            {preset}
                                        </option>
                                    ))
                                }
                            </select>

                        </div>

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

                        {
                            lastRoll && (

                                <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-3">

                                    <p className="mb-1 text-xs text-zinc-500">
                                        {lastRoll.label ? "Rolagem" : "Resultado"}
                                    </p>

                                    <p className="mb-2 flex items-center gap-2 text-xs text-zinc-400">
                                        {lastRoll.label || lastRoll.notation}

                                        {
                                            lastRoll.isCritical && (
                                                <span className="rounded bg-red-700/80 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                                                    Crítico!
                                                </span>
                                            )
                                        }
                                    </p>

                                    <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-300">

                                        {
                                            lastRoll.rolls.map((roll, index) => {

                                                // Rolagens "pega o maior" (perícia, teste de
                                                // ataque) destacam o maior dado e apagam/riscam
                                                // os outros, já que não entram na soma.
                                                const isHighest = usesHighest && index === lastRoll.highestIndex;
                                                const isDiscarded = usesHighest && index !== lastRoll.highestIndex;

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
                                                            {roll}
                                                        </span>
                                                    </span>
                                                );

                                            })
                                        }

                                        {
                                            lastRoll.modifier !== 0 && (
                                                <span>+ {lastRoll.modifier}</span>
                                            )
                                        }

                                        <span>=</span>

                                        <span className="text-2xl font-bold text-violet-400">
                                            {lastRoll.total}
                                        </span>

                                    </div>

                                </div>

                            )
                        }

                        <button
                            onClick={clearHistory}
                            className={`${buttonBase} w-full border border-zinc-700 text-zinc-400 hover:border-red-700 hover:text-red-400`}
                        >
                            <FaTrash size={12} />
                            Limpar Histórico
                        </button>

                    </section>

                )
            }

            {/*ENCERRAR COMBATE*/}

            {
                !collapsed && (

                    <button
                        onClick={handleEndCombat}
                        className={`${buttonBase} mt-8 w-full border border-red-700 text-red-500 hover:bg-red-900/30`}
                    >
                        <FaFlag size={13} />
                        Encerrar Combate
                    </button>

                )
            }

        </aside>

    );

}