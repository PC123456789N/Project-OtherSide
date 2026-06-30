import { useAudioPlayer } from "../../context/audioPlayerContext/AudioPlayerContext.jsx";
import { useDataHandler } from "../../context/dataHandlerContext/DataHandlerContext.jsx";

import { IoMdClose } from "react-icons/io";

export default function GlobalPlayer() {
  const { videoId, stop } = useAudioPlayer();
  const { selectedPageId } = useDataHandler();

  if (!videoId) return null;

  return (
    <div className={`fixed bottom-1 right-4 bg-linear-to-b from-black to-white/2 p-3 rounded-2xl border-2 shadow-2xl border-gray-800 ${selectedPageId == 4 ? `visible` : `invisible`}`}>
      <div className="max-w-5xl flex mx-auto gap-1 items-center">

        <div className="w-64 aspect-video">
          <iframe
            width={"100%"}
            height={"100%"}
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=0&rel=0&playsinline=0&modestbranding=1`}
            allow="autoplay"
            title="player"
          />
        </div>

        <button
          onClick={stop}
          className="px-1 py-1 z-50 text-white rounded-full hover:text-purple-600 hover:bg-gray-800/50 transition cursor-pointer"
        >
          <IoMdClose size={35} />
        </button>

      </div>
    </div>
  );
}