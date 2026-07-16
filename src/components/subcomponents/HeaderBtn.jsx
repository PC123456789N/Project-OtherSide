import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom";

import { useAuth } from "../../context/authContext/auth.jsx";
import { useDataHandler } from "../../context/dataHandlerContext/DataHandlerContext.jsx";

export default function HeaderBtn({ type }) {
  const [selected] = useState(true)
  const {userLoggedIn} = useAuth();
  const navigate = useNavigate();
  const {selectedPageId, setSelectedPageId} = useDataHandler();

  let text = "";
  let selfId = selectedPageId;

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
    <button className={` w-full rounded font-semibold px-4 py-2 cursor-pointer hover:bg-gray-800 ${selectedPageId == selfId?"text-purple-600 bg-gray-900 hover:bg-gray-800":""}`} 
    onClick={() => {
      if (!userLoggedIn) {
        setSelectedPageId(selfId);
        navigate("/login");
        return;
      }

      if (selectedPageId !== selfId) {
        setSelectedPageId(selfId);
      }
    }}
    >
      <p>{text}</p>
    </button>
  )
}