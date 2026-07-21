import { FaDice, FaPlus, FaTimes } from "react-icons/fa";

import { useDataHandler } from "../../context/dataHandlerContext/DataHandlerContext";

const rowGrid = "grid grid-cols-[1fr_72px_72px_88px_44px_36px] items-center gap-2";

// Rola "quantity" dados d20 (quantity = valor da perícia), usa só o MAIOR
// resultado entre eles e soma o bônus. Ex: perícia valor 3, bônus +5 ->
// rola 3d20, pega o maior dos três, soma 5 -> esse é o total da perícia.
function rollPericia(quantity, bonus = 0) {

    const qty = Math.max(1, Number(quantity) || 1);

    const rolls = Array.from(
        { length: qty },
        () => 1 + Math.floor(Math.random() * 20)
    );

    const highestIndex = rolls.reduce(
        (bestIndex, value, index) => (value > rolls[bestIndex] ? index : bestIndex),
        0
    );

    const highest = rolls[highestIndex];
    const numericBonus = Number(bonus) || 0;

    return {
        rolls,
        highestIndex,
        highest,
        bonus: numericBonus,
        total: highest + numericBonus,
    };

}

export default function SkillsSection({

    monster,

    onSkillAdd,
    onSkillRemove,
    onSkillChange,
    onSkillResult,

}) {

    // rollHistory é compartilhado com a CombatSidebar — é lá que o
    // resultado da rolagem de perícia aparece, junto das rolagens livres.
    const { setRollHistory } = useDataHandler();

    function handleRollSkill(skill) {

        const result = rollPericia(skill.value, skill.bonus);

        setRollHistory((prev) => [
            {
                id: crypto.randomUUID(),
                type: "pericia",
                label: skill.name,
                rolls: result.rolls,
                highestIndex: result.highestIndex,
                modifier: result.bonus,
                total: result.total,
            },
            ...(prev || []),
        ]);

        onSkillResult(skill.id, result.total);

    }

    return (

        <div className="space-y-3">

            <div className="flex items-center justify-between">

                <h3 className="text-sm uppercase text-zinc-500">
                    Perícias
                </h3>

                <button
                    onClick={onSkillAdd}
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
                    Adicionar Perícia
                </button>

            </div>

            <div className="overflow-hidden rounded-xl border border-zinc-800">

                <div
                    className={`
                        ${rowGrid}
                        bg-zinc-950/60
                        px-4
                        py-2
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-wide
                        text-zinc-500
                    `}
                >
                    <span>Perícia</span>
                    <span className="text-center">Valor</span>
                    <span className="text-center">Bônus</span>
                    <span className="text-center">Resultado</span>
                    <span></span>
                    <span></span>
                </div>

                {
                    monster.skills.map((skill, index) => (

                        <div
                            key={skill.id}
                            className={`
                                ${rowGrid}
                                px-4
                                py-2.5
                                ${index % 2 === 0 ? "bg-zinc-900" : "bg-zinc-900/50"}
                            `}
                        >

                            <input
                                value={skill.name}
                                onChange={(e) => onSkillChange(skill.id, "name", e.target.value)}
                                className="
                                    w-full
                                    bg-transparent
                                    text-sm
                                    font-medium
                                    text-white
                                    outline-none
                                    focus:text-violet-300
                                "
                            />

                            <input
                                type="number"
                                min={1}
                                value={skill.value}
                                onChange={(e) => onSkillChange(skill.id, "value", Number(e.target.value) || 1)}
                                title="Quantidade de d20 rolados"
                                className="
                                    w-full
                                    rounded-md
                                    border
                                    border-zinc-700
                                    bg-zinc-950
                                    px-1
                                    py-1
                                    text-center
                                    text-sm
                                    text-white
                                    outline-none
                                    focus:border-violet-500
                                "
                            />

                            <input
                                type="number"
                                value={skill.bonus}
                                onChange={(e) => onSkillChange(skill.id, "bonus", Number(e.target.value) || 0)}
                                title="Bônus somado ao maior d20"
                                className="
                                    w-full
                                    rounded-md
                                    border
                                    border-zinc-700
                                    bg-zinc-950
                                    px-1
                                    py-1
                                    text-center
                                    text-sm
                                    text-white
                                    outline-none
                                    focus:border-violet-500
                                "
                            />

                            <span className="text-center text-sm font-bold text-violet-300">
                                {skill.lastResult ?? "—"}
                            </span>

                            <button
                                onClick={() => handleRollSkill(skill)}
                                title="Rolar Perícia"
                                className="
                                    flex
                                    h-8
                                    w-8
                                    items-center
                                    justify-center
                                    rounded-md
                                    bg-violet-700/80
                                    text-white
                                    transition
                                    hover:bg-violet-600
                                "
                            >
                                <FaDice size={13} />
                            </button>

                            <button
                                onClick={() => onSkillRemove(skill.id)}
                                title="Remover Perícia"
                                className="
                                    flex
                                    h-8
                                    w-8
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

                    ))
                }

                {
                    monster.skills.length === 0 && (
                        <p className="p-4 text-center text-xs text-zinc-600">
                            Nenhuma perícia cadastrada.
                        </p>
                    )
                }

            </div>

        </div>

    );

}