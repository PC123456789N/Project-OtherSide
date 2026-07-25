import { useAudioPlayer } from "../../context/audioPlayerContext/AudioPlayerContext.jsx";
import { useDataHandler } from "../../context/dataHandlerContext/DataHandlerContext.jsx";

import { IoMdClose } from "react-icons/io";

export default function GlobalPlayer() {
  const { videoId, stop } = useAudioPlayer();
  const { selectedPageId } = useDataHandler();

  if (!videoId) return null;

  return (
    <div
      className={`
        fixed
        bottom-4
        right-4
        z-100
        w-72
        overflow-hidden
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-950/95
        shadow-[0_10px_40px_rgba(0,0,0,0.65)]
        backdrop-blur
        transition-all
        duration-300
        ${selectedPageId == 4 ? "visible opacity-100" : "invisible opacity-0"}
      `}
    >
      {/* Filete de acento no topo, referência ao tema do site (violeta + sangue) */}
      <div className="h-1 w-full bg-gradient-to-r from-violet-700 via-red-800 to-violet-700" />

      <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 bg-gradient-to-b from-red-950/30 to-transparent px-3 py-2">
        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-500 shadow-[0_0_6px_rgba(139,92,246,0.8)]" />
          Tocando agora
        </span>

        <button
          onClick={stop}
          title="Fechar player"
          className="
            flex
            h-6
            w-6
            items-center
            justify-center
            rounded-full
            text-zinc-500
            transition
            hover:bg-red-900/40
            hover:text-red-400
          "
        >
          <IoMdClose size={16} />
        </button>
      </div>

      <div className="relative aspect-video w-full bg-black">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=0&rel=0&playsinline=0&modestbranding=1`}
          allow="autoplay"
          title="player"
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  );
}