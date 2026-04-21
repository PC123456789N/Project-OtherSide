import { useState } from "react";

export default function Music() {
  const [link, setLink] = useState("");
  const [playlist, setPlaylist] = useState([]);
  const [videoId, setVideoId] = useState(null);

  function pegarId(url) {
    try {
      const u = new URL(url);

      if (u.searchParams.get("v")) {
        return u.searchParams.get("v");
      }

      if (u.hostname.includes("youtu.be")) {
        return u.pathname.slice(1);
      }

      const partes = u.pathname.split("/");
      return partes[partes.length - 1];

    } catch {
      return null;
    }
  }

  function adicionar() {
    const id = pegarId(link);

    if (!id) {
      alert("Link inválido");
      return;
    }

    setPlaylist([...playlist, id]);
    setLink("");
  }

  return (
    <div className="bg-black text-white min-h-screen p-6">

      <h1 className="text-3xl text-purple-500 mb-6 text-center">
        Playlist 🎵
      </h1>

      {/* INPUT */}
      <div className="flex gap-2 justify-center mb-6">
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Cole o link do YouTube"
          className="p-2 bg-gray-800 rounded w-80"
        />

        <button
          onClick={adicionar}
          className="bg-green-600 px-4 rounded"
        >
          Adicionar
        </button>
      </div>

      {/* PLAYER */}
      {videoId && (
        <div className="max-w-xl mx-auto mb-6">
          <iframe
            width="100%"
            height="250"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            allow="autoplay"
            allowFullScreen
            className="rounded"
          ></iframe>
        </div>
      )}

      {/* PLAYLIST */}
      <div className="max-w-md mx-auto space-y-3">
        {playlist.map((id, index) => (
          <div
            key={index}
            onClick={() => setVideoId(id)}
            className="bg-gray-900 p-3 rounded cursor-pointer hover:bg-gray-800 transition"
          >
            Música {index + 1}
          </div>
        ))}
      </div>

    </div>
  );
}