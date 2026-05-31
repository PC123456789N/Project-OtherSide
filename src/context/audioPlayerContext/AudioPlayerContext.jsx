import { createContext, useContext, useState } from "react";

const AudioPlayerContext = createContext();

export function AudioPlayerProvider({ children }) {
  const [videoId, setVideoId] = useState(null);

  const play = (id) => {
    setVideoId(id);
  };

  const stop = () => {
    setVideoId(null);
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        videoId,
        play,
        stop,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  return useContext(AudioPlayerContext);
}