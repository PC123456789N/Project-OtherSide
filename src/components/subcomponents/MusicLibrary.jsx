import { useDataHandler } from "../../context/dataHandlerContext/DataHandlerContext";
import { useAudioPlayer } from "../../context/audioPlayerContext/AudioPlayerContext";

import { FaPlay } from "react-icons/fa";
import { TbLibraryPlusFilled } from "react-icons/tb";
import { IoMdClose } from "react-icons/io";

const MusicCard = ({ track, onPlay, onPin }) => (
  <div
    className="
      group
      relative
      overflow-hidden
      rounded-xl
      border
      border-zinc-800
      bg-zinc-900/60
      p-2
      transition
      hover:border-violet-700/60
      hover:bg-zinc-900
      hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]
    "
  >
    {/* Ações: sempre visíveis no mobile, aparecem no hover no PC */}
    <div className="absolute top-2 right-2 z-10 flex gap-1.5 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPin();
        }}
        title="Adicionar à playlist"
        className="
          flex
          h-7
          w-7
          items-center
          justify-center
          rounded-full
          bg-black/70
          text-zinc-300
          shadow-lg
          transition
          hover:bg-violet-700
          hover:text-white
        "
      >
        <TbLibraryPlusFilled size={14} />
      </button>
    </div>

    <button onClick={onPlay} className="block w-full text-left">
      <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-black">
        <img
          src={`https://img.youtube.com/vi/${track.id}/mqdefault.jpg`}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          alt=""
        />

        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-violet-700/90
              shadow-[0_0_18px_rgba(139,92,246,0.6)]
              transition
              group-hover:scale-105
            "
          >
            <FaPlay size={16} className="translate-x-0.5 text-white" />
          </div>
        </div>
      </div>

      <p className="truncate text-xs font-semibold text-zinc-200 transition group-hover:text-violet-300 md:text-sm">
        {track.nome}
      </p>
    </button>
  </div>
);

export default function MusicLibrary({ setIsOpenLib }) {
  const { playlist, setPlaylist } = useDataHandler();
  const { play } = useAudioPlayer();

  const categorias = ["Chefes", "Combates", "Suspenses", "Exploração"];

  const handlePin = (track) => {
    if (playlist.some((item) => item.id === track.id)) return;

    setPlaylist([
      ...playlist,
      {
        id: track.id,
        categoria: track.categoria,
        nome: track.nome,
      },
    ]);
  };

  const lib = {
    playlist: [
      { categoria: "Exploração", id: "m-kkRfQYofg", nome: "Dúvidas" },
      { categoria: "Exploração", id: "ZU98XAKpRf4", nome: "OSNF OST - Tampala - Extended" },
      { categoria: "Exploração", id: "JRejREK9eTY", nome: "Esperanto" },
      { categoria: "Exploração", id: "tNElSdS5y4", nome: "Novo Lar" },
      { categoria: "Suspenses", id: "m-kkRfQYofg", nome: "Duvidas" },
      { categoria: "Suspenses", id: "fZKBG0a-fzg", nome: "Veríssimo" },
      { categoria: "Suspenses", id: "ZVCd0fLrUb0", nome: "Ela não ta respondendo" },
      { categoria: "Suspenses", id: "3vEW_r4Swn8", nome: "SABATON - Panzerkampf" },
      { categoria: "Combates", id: "CzX8juePdIM", nome: "Arauta das Promessas" },
      { categoria: "Combates", id: "JuYnlX2OnmA", nome: "Minotauro" },
      { categoria: "Combates", id: "rLyoco9G0U", nome: "Eu Sou Você" },
      { categoria: "Combates", id: "kwyg8Zepb78", nome: "Raiva - Ordem Paranormal: Calamidade (Cover)" },
      { categoria: "Chefes", id: "kbFBPrRj9p8", nome: "Heilah Vagga" },
      { categoria: "Chefes", id: "wnLaArbAJlI", nome: "O Anfitrião" },
      { categoria: "Chefes", id: "W6awJIfdfR0", nome: "Rebobinar Através - Ordem Paranormal: Bestiário (Telopsia)" },
      { categoria: "Chefes", id: "MaAXLHAl3cw", nome: "Genocídio - Ordem Paranormal: Calamidade" },
    ],
  };

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setIsOpenLib(false);
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <div className="relative flex h-[90%] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-black shadow-2xl">
        {/* Mesmo fundo esfumaçado da página principal de música */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -top-32 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-red-950/40 blur-[150px]" />
          <div className="absolute bottom-0 right-0 h-[380px] w-[460px] rounded-full bg-violet-950/25 blur-[130px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0)_0%,rgba(0,0,0,0.6)_75%)]" />
        </div>

        <div className="relative z-10 flex flex-col overflow-hidden h-full">
          <header className="flex items-center justify-between gap-3 border-b border-zinc-800 px-6 py-4">
            <div className="w-10" />

            <h1 className="font-cinzel text-xl md:text-2xl font-bold tracking-wide text-white">
              Biblioteca de Músicas
            </h1>

            <button
              onClick={() => setIsOpenLib(false)}
              title="Fechar"
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                text-zinc-500
                transition
                hover:bg-red-900/40
                hover:text-red-400
              "
            >
              <IoMdClose size={20} />
            </button>
          </header>

          <main className="mx-auto w-full max-w-500 grow space-y-12 overflow-y-auto p-4 md:space-y-14 md:px-8 md:py-8">
            {categorias.map((cat) => {
              const filtered = lib?.playlist.filter((t) => t.categoria === cat);
              if (!filtered?.length) return null;

              return (
                <section key={cat}>
                  <div className="mb-5 flex items-end gap-3 border-b border-zinc-900 pb-2">
                    <h2 className="text-xl font-black tracking-tight text-white md:text-2xl">
                      {cat}
                    </h2>
                    <span className="mb-1 rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-bold uppercase text-zinc-500">
                      {filtered.length} {filtered.length === 1 ? "item" : "itens"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 md:gap-4">
                    {filtered.map((track) => (
                      <MusicCard
                        key={track.id + track.categoria}
                        track={track}
                        onPlay={() => play(track.id)}
                        onPin={() => handlePin(track)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </main>
        </div>
      </div>
    </div>
  );
}