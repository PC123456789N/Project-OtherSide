import { useState } from "react"

export default function HeaderBtn({ type, selectedId, setSelectedId }) {
  const [selected] = useState(true)
  let text = "";
  let selfId = 0
  
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
    <button className={` w-full rounded font-semibold px-4 py-2 cursor-pointer hover:bg-gray-800 ${selectedId == selfId?"text-purple-600 bg-gray-900 hover:bg-gray-800":""}`} onClick={() => selectedId != selfId && setSelectedId(selfId)}>
      <p>{text}</p>
    </button>
  )
}