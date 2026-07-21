import { useDataHandler } from "../../context/dataHandlerContext/DataHandlerContext";
import { useAudioPlayer } from "../../context/audioPlayerContext/AudioPlayerContext";

import { FaPlay } from "react-icons/fa";
import { TbLibraryPlusFilled } from "react-icons/tb";

const PlayIcon = () => (
  <FaPlay size={26}/>
);

const MusicCard = ({ track, onPlay, onPin }) => (
  
  <div className="group relative bg-white/5 p-2 md:p-3 rounded-xl hover:bg-white/10 transition-all duration-300 border border-white/5">
    {/* Ações: Sempre visíveis no mobile, hover no PC */}
    <div className="absolute top-3 right-3 z-10 flex gap-1.5 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300">
      <button onClick={(e) => {e.stopPropagation(); onPin();}} className="bg-black/80 p-2 rounded-full hover:bg-purple-600 text-[10px] md:text-xs shadow-lg">
        <TbLibraryPlusFilled size={16}/>
      </button>
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
          <div className="w-12 h-12 md:w-12 md:h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
            <PlayIcon />
          </div>
        </div>
      </div>
      <p className="font-bold text-xs md:text-sm truncate text-gray-200 group-hover:text-purple-400">{track.nome}</p>
    </div>
  </div>
);



export default function MusicLibrary( {setIsOpenLib} ){
  const {playlist, setPlaylist} = useDataHandler();
  const {play} = useAudioPlayer();

  const categorias = ["Chefes", "Combates", "Suspenses", "Exploração"];

  const handlePin = (track) => {
    if (playlist.some(item => item.id === track.id)) return;

    setPlaylist([
      ...playlist, 
      { 
        id: track.id, 
        categoria: track.categoria, 
        nome: track.nome 
      }
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
    ]
  };

  return(
    <div className="inset-0 absolute w-full h-full bg-black/50 flex items-center justify-center">
      <div className="fixed z-50 top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2
    bg-gray-900 h-[90%] w-[80%] rounded-2xl overflow-hidden flex flex-col
      bg-linear-to-br from-gray-900 via-purple-950 to-black"
      >
        <div className="items-center">
          <header className="grid grid-cols-3 w-full h-10">
            <div className="invisible">holder</div>
            <div className="flex items-center justify-center">
              <h1 className="text-3xl text-center">Biblioteca de Musicas</h1>
            </div>
            <div className="flex justify-end">
              <button className="bg-gray-950 w-10 rounded-tr-2xl hover:bg-purple-600"
                onClick={() => setIsOpenLib(false)}
              >
                <h1 className="text-white">X</h1>
              </button>
            </div>
          </header>
          <div className="flex justify-center">
            <hr className="text-purple-700 w-full"/>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto max-w-500 mx-auto p-4 md:px-8 grow w-full space-y-12 md:space-y-15">
          {categorias.map(cat => {
            const filtered = lib?.playlist.filter(t => t.categoria === cat);
            if (!filtered?.length) return null;
            return (
              <section key={cat}>
                <div className="flex items-end gap-3 mb-6 border-b border-white/5 pb-2">
                  <h2 className="text-xl md:text-3xl font-black tracking-tight">{cat}</h2>
                  <span className="text-[10px] text-gray-500 font-bold mb-1 uppercase">{filtered.length} itens</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 md:gap-4">
                  {filtered.map(track => (
                    <MusicCard
                      key={track.id + Math.random()}
                      track={track}
                      onPlay={() => play(track.id)}
                      onPin={()=> handlePin(track)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </main>

      </div>
    </div>
  )
}