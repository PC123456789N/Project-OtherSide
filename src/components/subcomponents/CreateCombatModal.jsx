import { useEffect, useState } from "react";
import { useDataHandler } from "../../context/dataHandlerContext/DataHandlerContext";

const TYPES = [
    "Criatura",
    "Boss",
    "Monstro"
];

const ELEMENTS = [
    "Sangue",
    "Morte",
    "Conhecimento",
    "Energia"
];

export default function CreateCombatModal({
    open,
    onClose,
    onSave,
    combat,
}) {

    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [image, setImage] = useState("");
    const [type, setType] = useState("Criatura");
    const [element, setElement] = useState("Sangue");
    const [monsterId, setMonsterId] = useState("");
    const { monstersList ,setMonstersList} = useDataHandler();

    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [imageMode, setImageMode] = useState("upload"); // "upload" | "url"

    useEffect(() => {
        if (combat) {
            setName(combat.name || "");
            setLocation(combat.location || "");
            setImage(combat.image || "");
            setType(combat.type || "Criatura");
            setElement(combat.element || "Sangue");
            setMonsterId(combat.monsterId || "");

            setDate(combat.date || "");
            setTime(combat.time || "");
            setImageMode("upload");
        }

        else {
            setName("");
            setLocation("");
            setImage("");
            setType("Criatura");
            setElement("Sangue");
            setMonsterId("");

            setDate("");
            setTime("");
            setImageMode("upload");
        }

    }, [combat, open]);

    useEffect(() => {
        function handleEscape(e) {
            if (e.key === "Escape")
                onClose();
        }

        window.addEventListener("keydown", handleEscape);
        return () =>
            window.removeEventListener("keydown", handleEscape);
    }, [onClose]);
    if (!open)
        return null;

    function handleImage(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setImage(reader.result);
        };

        reader.readAsDataURL(file);
    }

    function handleSave() {
        if (!name.trim())
            return;

        let finalMonsterId = monsterId;

        if (!combat) {
            const newMonster = {
                id: crypto.randomUUID(),
                name: name, // pode usar o nome do combate como base, ajustável depois no MonsterPanel
                image: image,
                element: element,
                type: type,
                size: "Medium",

                hp: { current: 10, max: 10 },
                combat: {
                    defense: 15,
                    movement: 9,
                    sanityDamage: { value: 15, damage: "1d6" },
                },
                attributes: {
                    agility: 1,
                    strength: 1,
                    intellect: 1,
                    presence: 1,
                    vigor: 1,
                },

                skills: [
                    {id: '1', name: 'Percepção', attribute: 'presence', bonus: 5, lastResult: null},
                    {id: '2', name: 'Iniciativa', attribute: 'agility', bonus: 5, lastResult: null},
                    {id: '3', name: 'Fortitude', attribute: 'vigor', bonus: 5, lastResult: null},
                    {id: '4', name: 'Reflexos', attribute: 'agility', bonus: 5, lastResult: null},
                    {id: '5', name: 'Vontade', attribute: 'presence', bonus: 5, lastResult: null},
                ],
                attacks: [],
                abilities: [],
                // As 15 resistências do sistema agora são um objeto
                // { tipo: valor }, não mais uma lista livre de itens
                // adicionados/removidos um a um. Nasce vazio — cada tipo
                // sem chave aqui é tratado como valor 0 na ficha.
                resistances: {},
                vulnerabilities: [],
                immunities: [],

                fearEnigma: "",
                description: "",
            };

            setMonstersList((prev) => [...prev, newMonster]);
            finalMonsterId = newMonster.id;
        }

        onSave({
        name,
        location,
        image,
        type,
        element,
        monsterId: finalMonsterId,
        date,
        time
        });
        onClose();
    }

    const input = `
    w-full
    rounded-xl
    border
    border-zinc-800
    bg-zinc-950
    px-4
    py-3
    text-sm
    text-white
    outline-none
    transition
    placeholder:text-zinc-600
    focus:border-violet-500
    `;

    const label = `
    mb-2
    block
    font-cinzel
    text-xs
    uppercase
    tracking-widest
    text-zinc-400
    `;

    return (
        <div
            onMouseDown={(e) => {
                if (e.target === e.currentTarget)
                    onClose();
            }}
            className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/80
            backdrop-blur-sm
            p-4"
        >
            <div
                className="
                w-full
                max-w-2xl
                max-h-[92vh]
                overflow-y-auto
                rounded-2xl
                border
                border-zinc-800
                bg-zinc-900
                shadow-2xl"
            >
                {/* Cabeçalho */}
                <div
                    className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-zinc-800
                    px-8
                    py-6"
                >
                    <div>
                        <h2
                            className="
                            font-cinzel
                            text-2xl
                            text-white"
                        >
                            {
                                combat
                                    ? "Editar Combate"
                                    : "Novo Combate"
                            }
                        </h2>
                        <p
                            className="
                            mt-1
                            text-sm
                            text-zinc-500"
                        >
                            Configure as informações do combate.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="
                        text-2xl
                        text-zinc-500
                        transition
                        hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                {/* Conteúdo */}
                <div
                    className="
                    space-y-6
                    p-8"
                >
                    {/* Nome */}
                    <div>
                        <label className={label}>
                            Nome
                        </label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex.: Dragão Ancião"
                            className={input}
                        />
                    </div>
                    {/* Tipo */}
                    <div>
                        <label className={label}>
                            Tipo
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {
                                TYPES.map(item => (
                                    <button
                                        key={item}
                                        onClick={() => setType(item)}
                                        className={`
                                        rounded-xl
                                        border
                                        py-3
                                        font-cinzel
                                        transition
                                        ${type === item
                                                ?
                                                "border-violet-500 bg-violet-500/20 text-violet-400"
                                                :
                                                "border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-white"
                                            }
                                        `}>
                                        {item}
                                    </button>
                                ))
                            }
                        </div>
                    </div>

                    {/* Elemento */}
                    <div>
                        <label className={label}>
                            Elemento
                        </label>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            {
                                ELEMENTS.map(item => (
                                    <button
                                        key={item}
                                        onClick={() => setElement(item)}
                                        className={`
                                        rounded-xl
                                        border
                                        py-3
                                        font-cinzel
                                        transition
                                        ${element === item
                                                ?
                                                "border-violet-500 bg-violet-500/20 text-violet-400"
                                                :
                                                "border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-white"
                                            }
                                        `}>
                                        {item}
                                    </button>
                                ))
                            }
                        </div>
                    </div>

                    {/* Imagem */}
                    <div>
                        <label className={label}>
                            Imagem
                        </label>

                        {/* Alternador Upload / URL */}
                        <div className="mb-3 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setImageMode("upload")}
                                className={`
                                rounded-xl
                                border
                                py-2
                                text-sm
                                font-cinzel
                                transition
                                ${imageMode === "upload"
                                        ?
                                        "border-violet-500 bg-violet-500/20 text-violet-400"
                                        :
                                        "border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-white"
                                    }
                                    `}
                            >
                                Upload
                            </button>

                            <button
                                type="button"
                                onClick={() => setImageMode("url")}
                                className={`
                                rounded-xl
                                border
                                py-2
                                text-sm
                                font-cinzel
                                transition
                                ${imageMode === "url"
                                        ?
                                        "border-violet-500 bg-violet-500/20 text-violet-400"
                                        :
                                        "border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-white"
                                    }
                                `}
                            >
                                URL
                            </button>
                        </div>

                        {imageMode === "upload" ? (
                            <label
                                className="
                                flex
                                cursor-pointer
                                flex-col
                                items-center
                                justify-center
                                gap-3
                                rounded-xl
                                border-2
                                border-dashed
                                 border-zinc-700
                                p-8
                                transition
                                 hover:border-violet-500"
                            >
                                <span className="text-4xl">
                                    📷
                                </span>
                                <span className="text-zinc-400">
                                    Clique para selecionar uma imagem
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImage}
                                    className="hidden"
                                />
                            </label>
                        ) : (
                            <input
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                                placeholder="https://exemplo.com/imagem.png"
                                className={input}
                            />
                        )}

                        {
                            image &&
                            <img
                                src={image}
                                alt="Preview"
                                className="
                                mt-5
                                h-56
                                w-full
                                rounded-xl
                                border
                                 border-zinc-800
                                object-cover"
                            />
                        }
                    </div>
                </div>

                {/* Rodapé */}
                <div
                    className="
                    flex
                    justify-end
                    gap-3
                    border-t
                    border-zinc-800
                    px-8
                    py-6"
                >
                    <button
                        onClick={onClose}
                        className="
                        rounded-xl
                        border
                        border-zinc-800
                        px-6
                        py-3
                        text-zinc-400
                        transition
                        hover:text-white"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="
                        rounded-xl
                        bg-violet-600
                        px-8
                        py-3
                        font-semibold
                        text-white
                        transition
                        hover:bg-violet-700"
                    >
                        {
                            combat
                                ? "Salvar Alterações"
                                : "Criar Combate"
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}