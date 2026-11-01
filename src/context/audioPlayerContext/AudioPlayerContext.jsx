import { createContext, useContext, useState } from "react";

const AudioPlayerContext = createContext();

export function AudioPlayerProvider({ children }) {
  const [videoId, setVideoId] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  const play = (id) => {
    if (id === videoId) {
        if (isPaused) {
            sendPlayerCommand("playVideo");
            setIsPaused(false);
        }
        return;
    }
    setVideoId(id);
    setIsPaused(false);
};

  const stop = () => {
    setVideoId(null);
    setIsPaused(false);
  };

  const sendPlayerCommand = (func, args = []) => {
    const iframe = document.getElementById("youtube-player");

    if (!iframe?.contentWindow) return;

    iframe.contentWindow.postMessage(
      JSON.stringify({
        event: "command",
        func,
        args,
      }),
      "https://www.youtube.com"
    );
  };

  const togglePause = () => {
    if (isPaused) {
      sendPlayerCommand("playVideo");
    } else {
      sendPlayerCommand("pauseVideo");
    }

    setIsPaused((prev) => !prev);
  };

  const restart = () => {
    sendPlayerCommand("seekTo", [0, true]);
    sendPlayerCommand("playVideo");
    setIsPaused(false);
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        videoId,
        play,
        stop,
        togglePause,
        restart,
        isPaused,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  return useContext(AudioPlayerContext);
}