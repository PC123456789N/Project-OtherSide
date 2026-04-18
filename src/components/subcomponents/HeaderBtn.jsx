import { useState } from "react"

export default function HeaderBtn({ type, selectedId, setSelectedId }) {
  const [selected] = useState(true)
  let text = "";
  let selfId = 0
  
  switch(type){
    case "inicial":
      text = "iniciativas";
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
    <button className={`bg-amber-900 w-full rounded px-4 py-2 ${selectedId == selfId?"bg-red-700":""}`} onClick={() => selectedId != selfId && setSelectedId(selfId)}>
      <p>{text}</p>
    </button>
  )
}