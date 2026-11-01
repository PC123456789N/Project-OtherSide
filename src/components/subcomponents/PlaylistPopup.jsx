import { useState, useEffect } from "react";

import { useDataHandler } from "../../context/dataHandlerContext/DataHandlerContext.jsx";
import { useAudioPlayer } from "../../context/audioPlayerContext/AudioPlayerContext.jsx";

import {
    FaTimes,
    FaChevronDown,
    FaChevronRight,
    FaPlay,
    FaVolumeUp,
    FaPause,
    FaRedo,
} from "react-icons/fa";

export default function PlaylistPopup({ onClose }) {
    const { playlist } = useDataHandler();

    const {
        play,
        videoId,
        togglePause,
        restart,
        isPaused,
    } = useAudioPlayer();

    const categorias = [
        "Chefes",
        "Combates",
        "Suspenses",
        "Exploração",
    ];

    const [expandedCategory, setExpandedCategory] = useState(null);

    // Fecha a playlist ao pressionar Escape.
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    // Abre ou fecha uma categoria.
    const toggleCategory = (categoria) => {
        setExpandedCategory((current) =>
            current === categoria ? null : categoria
        );
    };

    return (
        <>
            {/* Fundo clicável para fechar a playlist */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            {/* Janela da playlist */}
            <div
                onClick={(event) => event.stopPropagation()}
                className="
                    absolute right-0 top-full z-50 mt-3
                    w-[420px] max-w-[calc(100vw-2rem)]
                    max-h-[70vh] overflow-y-auto
                    rounded-xl border border-red-900/50
                    bg-zinc-950/95 p-4 text-white
                    shadow-2xl shadow-black/60 backdrop-blur-xl

                    max-md:fixed max-md:left-1/2 max-md:right-auto
                    max-md:top-1/2 max-md:mt-0
                    max-md:-translate-x-1/2 max-md:-translate-y-1/2
                    max-md:w-[calc(100vw-2rem)] max-md:max-h-[80vh]
                "
            >
                {/* Cabeçalho */}
                <div className="
                    mb-4 flex items-center justify-between
                    border-b border-red-900/40 pb-3
                ">
                    <div>
                        <h2 className="text-lg font-bold tracking-wide">
                            Minha Playlist
                        </h2>

                        <p className="text-xs text-zinc-500">
                            {playlist.length} músicas cadastradas
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        title="Fechar playlist"
                        aria-label="Fechar playlist"
                        className="
                            rounded-full p-2 text-zinc-400
                            transition hover:bg-red-900/30
                            hover:text-white
                        "
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Categorias */}
                <div className="space-y-4">
                    {categorias.map((categoria) => {
                        const musicas = playlist.filter(
                            (track) => track.categoria === categoria
                        );

                        const isExpanded = expandedCategory === categoria;

                        return (
                            <section key={categoria}>
                                <button
                                    type="button"
                                    onClick={() => toggleCategory(categoria)}
                                    aria-expanded={isExpanded}
                                    className="
                                        flex w-full items-center
                                        justify-between rounded-lg
                                        px-2 py-2 text-left
                                        transition hover:bg-red-900/20
                                    "
                                >
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-zinc-100">
                                            {categoria}
                                        </h3>

                                        <span className="
                                            rounded-full bg-zinc-800
                                            px-2 py-0.5 text-[10px]
                                            text-zinc-400
                                        ">
                                            {musicas.length}{" "}
                                            {musicas.length === 1 ? "item" : "itens"}
                                        </span>
                                    </div>

                                    {isExpanded ? (
                                        <FaChevronDown className="text-xs text-zinc-400" />
                                    ) : (
                                        <FaChevronRight className="text-xs text-zinc-400" />
                                    )}
                                </button>

                                {/* Músicas da categoria */}
                                {isExpanded && (
                                    <div className="
                                        mt-2 grid grid-cols-2
                                        gap-3 sm:grid-cols-3
                                    ">
                                        {musicas.length > 0 ? (
                                            musicas.map((track, index) => {
                                                const isPlaying = videoId === track.id;

                                                return (
                                                    <button
                                                        type="button"
                                                        key={`${track.id}-${index}`}
                                                        onClick={() => play(track.id)}
                                                        title={`Tocar ${track.nome}`}
                                                        className={`
                                                            group overflow-hidden
                                                            rounded-xl border
                                                            bg-zinc-900 text-left
                                                            transition
                                                            hover:-translate-y-0.5
                                                            hover:border-red-500/70

                                                            ${
                                                                isPlaying
                                                                    ? "border-red-500 shadow-lg shadow-red-950/40"
                                                                    : "border-zinc-800"
                                                            }
                                                        `}
                                                    >
                                                        {/* Capa da música */}
                                                        <div className="
                                                            relative aspect-square
                                                            overflow-hidden bg-zinc-800
                                                        ">
                                                            <img
                                                                src={`https://img.youtube.com/vi/${track.id}/hqdefault.jpg`}
                                                                alt={track.nome}
                                                                loading="lazy"
                                                                className="
                                                                    h-full w-full
                                                                    object-cover
                                                                    transition duration-300
                                                                    group-hover:scale-105
                                                                "
                                                            />

                                                            <div
                                                                className={`
                                                                    absolute inset-0
                                                                    flex items-center
                                                                    justify-center
                                                                    bg-black/40
                                                                    transition

                                                                    ${
                                                                        isPlaying
                                                                            ? "opacity-100"
                                                                            : "opacity-0 group-hover:opacity-100"
                                                                    }
                                                                `}
                                                            >
                                                                {isPlaying ? (
                                                                    <FaVolumeUp className="
                                                                        text-2xl text-red-400
                                                                    " />
                                                                ) : (
                                                                    <FaPlay className="
                                                                        text-2xl text-white
                                                                    " />
                                                                )}
                                                            </div>

                                                            {/* Indicador de reprodução */}
                                                            {isPlaying && (
                                                                <div className="
                                                                    absolute bottom-0
                                                                    left-0 right-0
                                                                    flex items-center
                                                                    justify-center gap-1.5
                                                                    bg-red-950/90
                                                                    px-1 py-1.5
                                                                ">
                                                                    <span className="
                                                                        h-1.5 w-1.5
                                                                        rounded-full
                                                                        animate-pulse
                                                                        bg-violet-400
                                                                    " />

                                                                    <span className="
                                                                        text-[9px]
                                                                        font-bold uppercase
                                                                        tracking-wider
                                                                        text-white
                                                                    ">
                                                                        Tocando agora
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Nome da música */}
                                                        <div className="p-2">
                                                            <p className="
                                                                truncate text-xs
                                                                font-semibold
                                                                text-zinc-200
                                                            ">
                                                                {track.nome}
                                                            </p>
                                                        </div>
                                                    </button>
                                                );
                                            })
                                        ) : (
                                            <p className="
                                                col-span-full py-3
                                                text-center text-xs
                                                text-zinc-500
                                            ">
                                                Nenhuma música nesta categoria.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </section>
                        );
                    })}
                </div>

                {/* Controles de reprodução */}
                {videoId && (
                    <div className="
                        mt-5 flex items-center justify-center
                        gap-3 border-t border-red-900/40 pt-4
                    ">
                        {/* Reiniciar */}
                        <button
                            type="button"
                            onClick={restart}
                            title="Reiniciar música"
                            aria-label="Reiniciar música"
                            className="
                                flex h-10 w-10 items-center
                                justify-center rounded-full
                                border border-zinc-700
                                bg-zinc-900 text-zinc-300
                                transition hover:border-red-500
                                hover:bg-red-900/40 hover:text-white
                            "
                        >
                            <FaRedo />
                        </button>

                        {/* Pausar / continuar */}
                        <button
                            type="button"
                            onClick={togglePause}
                            title={
                                isPaused
                                    ? "Continuar música"
                                    : "Pausar música"
                            }
                            aria-label={
                                isPaused
                                    ? "Continuar música"
                                    : "Pausar música"
                            }
                            className="
                                flex h-11 w-11 items-center
                                justify-center rounded-full
                                border border-red-900/60
                                bg-red-950/60 text-white
                                transition hover:bg-red-800/70
                            "
                        >
                            {isPaused ? <FaPlay /> : <FaPause />}
                        </button>
                    </div>
                )}

                {/* Playlist vazia */}
                {playlist.length === 0 && (
                    <p className="
                        py-6 text-center text-sm text-zinc-500
                    ">
                        Sua playlist ainda está vazia.
                    </p>
                )}
            </div>
        </>
    );
}
