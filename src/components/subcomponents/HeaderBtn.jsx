import { useState } from "react"
import { useNavigate, replace } from "react-router-dom";

import { useAuth } from "../../context/authContext";
import { useSelected } from "../../context/selectedContext/SelectedContext";

export default function HeaderBtn({ type }) {
  const [selected] = useState(true)
  const {userLoggedIn} = useAuth();
  const navigate = useNavigate();
  const {selectedId, setSelectedId} = useSelected();

  let text = "";
  let selfId = selectedId;

  switch(type){
    case "inicial":
      text = "Iniciativas";
      selfId = 1;
      break
    case "combat":
      text = "Combate"
      selfId = 2;
      break
    case "script":
      text = "Roteiro"
      selfId = 3;
      break
    case "music":
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

      if (selectedId !== selfId) {
        setSelectedId(selfId);
      }
    }}
    >
      <p>{text}</p>
    </button>
  )
}