import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom";

import { useAuth } from "../../context/authContext/auth.jsx";
import { useSavedState } from "../../context/selectedContext/SavedStateContext";

export default function HeaderBtn({ type }) {
  const [selected] = useState(true)
  const {userLoggedIn} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {selectedId, setSelectedId} = useSavedState();

  let text = "";
  let selfId = selectedId;

  switch(type){
    case "i":
      text = "Iniciativas";
      selfId = 1;
      break
    case "c":
      text = "Combate"
      selfId = 2;
      break
    case "s":
      text = "Roteiro"
      selfId = 3;
      break
    case "m":
      text = "Música"
      selfId = 4;
      break
  }

  return (
    <button className={` w-full rounded font-semibold px-4 py-2 cursor-pointer hover:bg-gray-800 ${selectedId == selfId?"text-purple-600 bg-gray-900 hover:bg-gray-800":""}`} 
    onClick={() => {

    if (!userLoggedIn) {
        setSelectedId(selfId);
        navigate("/login");
        return;
    }

    // Sempre atualiza a seção desejada
    setSelectedId(selfId);

    // Se estiver fora da página principal,
    // volta para ela.
    if (location.pathname !== "/") {
        navigate("/");
    }
  }}
    >
      <p>{text}</p>
    </button>
  )
}