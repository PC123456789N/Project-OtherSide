export default function CombatItem({
    combat,
    onOpen,
    onEdit,
    onDelete
}) {

    const formattedDate = combat.date
    ? new Date(combat.date).toLocaleDateString("pt-BR")
    : "";

    return (

        <article
            className="
            group
            overflow-hidden
            rounded-lg
            border
            border-zinc-800
            bg-zinc-950
            transition-all
            duration-300

            hover:-translate-y-1
            hover:border-violet-600/60
            hover:shadow-[0_0_25px_rgba(124,58,237,.20)]
            "
        >

            {/* Imagem do card "A tal fixa que tu me falou" */}

            <div
                className="
                relative
                h-36
                overflow-hidden
                "
            >
                {
                    combat.image?
                    <img
                        src={combat.image}
                        alt={combat.name}
                        className="
                        h-full
                        w-full
                        object-cover
                        duration-500
                        group-hover:scale-105
                        "
                    />:
                    <div
                        className="
                        flex
                        h-full
                        items-center
                        justify-center
                        bg-zinc-900
                        text-zinc-700
                        "
                    >
                        Sem imagem
                    </div>
                }
            </div>
            {/* Essa parte é de descrição da fixa */}
            <div
                className="
                space-y-2
                p-3
                "
            >
                <h2
                    className="
                    line-clamp-2
                    font-cinzel
                    text-lg
                    font-semibold
                    text-white
                    "
                >

                    {combat.name}

                </h2>
                {
                    combat.location &&
                    <p
                        className="
                        text-xs
                        text-zinc-400
                        "
                    >
                        📍 {combat.location}
                    </p>
                }
                <p
                    className="
                    text-xs
                    text-zinc-500
                    "
                >
                    {formattedDate}
                    {
                        combat.time &&
                        ` • ${combat.time}`
                    }
                </p>
                {/* Botão */}
                <button
                    onClick={() => onOpen(combat)}
                    className="
                    mt-4
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    border
                    border-violet-600
                    py-2.5
                    font-cinzel
                    text-sm
                    text-violet-400
                    transition
                    hover:bg-violet-600/15
                    "
                >
                    Abrir Combate
                    →
                </button>
            </div>
            {/* Rodapé */}
            <div
                className="
                flex
                border-t
                border-zinc-800
                "
            >
                <button
                    onClick={() => onEdit(combat)}
                    className="
                    flex-1
                    py-3
                    text-xs
                    text-zinc-300
                    transition
                    hover:bg-zinc-900
                    "
                >
                    Editar
                </button>
                <button
                    onClick={() => onDelete(combat.id)}
                    className="
                    flex-1
                    border-l
                    border-zinc-800
                    py-3
                    text-sm
                    text-red-400
                    transition
                    hover:bg-red-500/10
                    "
                >
                    Remover
                </button>
            </div>
        </article>
    );
}