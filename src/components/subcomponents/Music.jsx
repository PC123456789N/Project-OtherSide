import { useState } from "react";

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

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 md:w-10 md:h-10 text-white ml-1">
    <path d="M8 5.14v13.72a1 1 0 001.5.86l10.86-6.86a1 1 0 000-1.72L9.5 4.28a1 1 0 00-1.5.86z" />
  </svg>
);

const MusicCard = ({ track, onPlay, onRemove, onRename }) => (
  <div className="group relative bg-white/5 p-2 md:p-3 rounded-xl hover:bg-white/10 transition-all duration-300 border border-white/5">
    {/* Ações: Sempre visíveis no mobile, hover no PC */}
    <div className="absolute top-3 right-3 z-10 flex gap-1.5 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300">
      <button onClick={onRename} className="bg-black/80 p-2 rounded-full hover:bg-purple-600 text-[10px] md:text-xs shadow-lg">✏️</button>
      <button onClick={onRemove} className="bg-black/80 p-2 rounded-full hover:bg-red-600 text-[10px] md:text-xs shadow-lg">✕</button>
    </div>

    <div onClick={onPlay} className="cursor-pointer">
      <div className="relative aspect-square mb-2 md:mb-3 overflow-hidden rounded-lg shadow-2xl bg-black/40">
        <img
          src={`https://img.youtube.com/vi/${track.id}/mqdefault.jpg`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          alt=""
        />
        {/* Play centralizado */}
        <div className="absolute inset-0 bg-black/10 flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-600 rounded-full flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
            <PlayIcon />
          </div>
        </div>
      </div>
      <p className="font-bold text-xs md:text-sm truncate text-gray-200 group-hover:text-purple-400">{track.nome}</p>
    </div>
  </div>
);

export default function MusicRPG() {
  const [link, setLink] = useState("");
  const [categoria, setCategoria] = useState("Exploração");
  const [playlist, setPlaylist] = useState([]);
  const [videoId, setVideoId] = useState(null);
  const [loading, setLoading] = useState(false);

  const categorias = ["Chefes", "Combates", "Suspences", "Exploração"];

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
    if (action === 'remove') newPlaylist.splice(index, 1);
    if (action === 'rename') {
      const name = prompt("Novo nome:", track.nome);
      if (name) newPlaylist[index].nome = name;
    }
    setPlaylist(newPlaylist);
  };

  return (
    <div className="bg-[#030303] text-white min-h-screen font-sans flex flex-col">

      {/* HEADER: Fixado no fluxo normal (Some ao rolar no mobile) */}
      <header className="p-4 md:p-8 bg-linear-to-b from-white/5 to-transparent">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-2 bg-[#121212] p-1.5 md:p-2 rounded-xl md:rounded-2xl border border-white/10 shadow-2xl">
          <input
            value={link}
            onChange={e => setLink(e.target.value)}
            placeholder="Link do YouTube..."
            className="bg-transparent grow px-3 py-2 outline-none text-sm md:text-lg placeholder:text-gray-700"
          />
          <div className="flex gap-2">
            <select
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              className="bg-gray-900 rounded-lg px-2 md:px-4 text-purple-400 outline-none border border-white/5 font-bold text-xs md:text-sm grow md:flex-none"
            >
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
              onClick={handleAdd}
              disabled={loading}
              className="bg-purple-600 px-4 md:px-8 py-2 md:py-3 rounded-lg md:rounded-xl font-bold text-xs md:text-sm active:scale-95 disabled:opacity-50"
            >
              {loading ? "..." : "ADICIONAR"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-400 mx-auto p-4 md:p-8 grow w-full space-y-12 md:space-y-20">
        {categorias.map(cat => {
          const filtered = playlist.filter(t => t.categoria === cat);
          if (!filtered.length) return null;
          return (
            <section key={cat}>
              <div className="flex items-end gap-3 mb-6 border-b border-white/5 pb-2">
                <h2 className="text-xl md:text-3xl font-black tracking-tight">{cat}</h2>
                <span className="text-[10px] text-gray-500 font-bold mb-1 uppercase">{filtered.length} itens</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-6">
                {filtered.map(track => (
                  <MusicCard
                    key={track.id + Math.random()}
                    track={track}
                    onPlay={() => setVideoId(track.id)}
                    onRemove={() => handleAction('remove', track)}
                    onRename={() => handleAction('rename', track)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {videoId && (
        <div className="sticky bottom-0 w-full bg-[#0a0a0a] border-t border-purple-500/20 p-4 md:p-6 z-50">
          <div className="max-w-400 mx-auto flex flex-col md:flex-row items-center gap-4 md:gap-10">
            {/* Iframe menor no mobile para não ocupar tela */}
            <div className="w-full md:w-64 aspect-video rounded-lg overflow-hidden border border-white/10 shadow-2xl">
              <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1`} allow="autoplay" />
            </div>

            <div className="grow text-center md:text-left">
              <h3 className="text-sm md:text-xl font-bold text-white truncate px-4 md:px-0">
                {playlist.find(t => t.id === videoId)?.nome}
              </h3>
            </div>

            <button
              onClick={() => setVideoId(null)}
              className="w-full md:w-auto bg-red-600/10 hover:bg-red-600/20 text-red-500 px-8 py-3 rounded-lg text-[10px] font-black uppercase border border-red-500/20"
            >
              Fechar Player
            </button>
          </div>
        </div>
      )}
    </div>
  );
}