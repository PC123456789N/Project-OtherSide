import { useState } from "react";
import { useDataHandler } from "../../context/dataHandlerContext/DataHandlerContext.jsx";
import { useAudioPlayer } from "../../context/audioPlayerContext/AudioPlayerContext.jsx";

import { FaPlay } from "react-icons/fa";
import { MdOutlineEdit } from "react-icons/md";
import { PiXLight } from "react-icons/pi";

import MusicLibrary from "./MusicLibrary.jsx";

const getYoutubeId = (url) => {
  try {
    const u = new URL(url);
    return u.searchParams.get("v") || (u.hostname.includes("youtu.be") ? u.pathname.slice(1) : u.pathname.split("/").pop());
  } catch { return null; }
};

const fetchTitle = async (id) => {
  try {
    const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`);
    const data = await response.json();
    return data.title;
  } catch { return null; }
};

const MusicCard = ({ track, onPlay, onRemove, onRename }) => (
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
        onClick={onRename}
        title="Renomear"
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
        <MdOutlineEdit size={14} />
      </button>

      <button
        onClick={onRemove}
        title="Remover"
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
          hover:bg-red-700
          hover:text-white
        "
      >
        <PiXLight size={16} />
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

export default function MusicRPG() {
  const [link, setLink] = useState("");
  const [categoria, setCategoria] = useState("Exploração");
  const [isOpenLib, setIsOpenLib] = useState(false);
  const { playlist, setPlaylist } = useDataHandler();
  const { play } = useAudioPlayer();
  const [loading, setLoading] = useState(false);

  const categorias = ["Chefes", "Combates", "Suspenses", "Exploração"];

  const handleAdd = async () => {
    const id = getYoutubeId(link);
    if (!id) return alert("Link inválido");
    setLoading(true);
    const title = await fetchTitle(id);
    setPlaylist([...playlist, { id, categoria, nome: title || `Música ${playlist.length + 1}` }]);
    setLink("");
    setLoading(false);
  };

  const handleAction = (action, track) => {
    const index = playlist.indexOf(track);
    const newPlaylist = [...playlist];
    if (action === "remove") newPlaylist.splice(index, 1);
    if (action === "rename") {
      const name = prompt("Novo nome:", track.nome);
      if (name) newPlaylist[index].nome = name;
    }
    setPlaylist(newPlaylist);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black font-sans text-white">
      {/* Fundo: gradiente esfumaçado vermelho-sangue, sutil, atrás de tudo */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-32 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-red-950/40 blur-[160px]" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[520px] rounded-full bg-violet-950/25 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0)_0%,rgba(0,0,0,0.6)_75%)]" />
      </div>

      {isOpenLib && <MusicLibrary setIsOpenLib={setIsOpenLib} />}

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex flex-col gap-3 border-b border-zinc-900 p-4 md:flex-row md:items-center md:p-6">
          <button
            onClick={() => setIsOpenLib(!isOpenLib)}
            disabled={loading}
            className="
              shrink-0
              rounded-xl
              border
              border-violet-800/60
              bg-violet-950/40
              px-5
              py-2.5
              text-xs
              font-bold
              uppercase
              tracking-wide
              text-violet-300
              transition
              hover:bg-violet-800/60
              hover:text-white
              disabled:opacity-50
              md:text-sm
            "
          >
            {loading ? "..." : "Biblioteca"}
          </button>

          <div
            className="
              flex
              flex-1
              flex-col
              gap-2
              rounded-2xl
              border
              border-zinc-800
              bg-zinc-950/80
              p-2
              shadow-lg
              md:flex-row
              md:items-center
            "
          >
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Link do YouTube..."
              className="grow bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 md:text-base"
            />

            <div className="flex gap-2">
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="
                  grow
                  rounded-lg
                  border
                  border-zinc-700
                  bg-zinc-900
                  px-3
                  py-2
                  text-xs
                  font-bold
                  text-violet-300
                  outline-none
                  transition
                  focus:border-violet-500
                  md:flex-none
                  md:text-sm
                "
              >
                {categorias.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <button
                onClick={handleAdd}
                disabled={loading}
                className="
                  rounded-lg
                  bg-violet-700
                  px-5
                  py-2
                  text-xs
                  font-bold
                  uppercase
                  tracking-wide
                  text-white
                  transition
                  hover:bg-violet-600
                  disabled:opacity-50
                  md:text-sm
                "
              >
                {loading ? "..." : "Adicionar"}
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-400 grow space-y-12 p-4 md:space-y-16 md:px-8">
          {categorias.map((cat) => {
            const filtered = playlist?.filter((t) => t.categoria === cat);
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

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 md:gap-5">
                  {filtered.map((track) => (
                    <MusicCard
                      key={track.id + Math.random()}
                      track={track}
                      onPlay={() => play(track.id)}
                      onRemove={() => handleAction("remove", track)}
                      onRename={() => handleAction("rename", track)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </main>
      </div>
    </div>
  );
}