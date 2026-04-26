import { useEffect, useRef, useState } from "react";

import { db } from "../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

import { useAuth } from "../../context/authContext";

import CombatItem from "./CombatItem";

export default function CombatSelector() {
  const { userId } = useAuth();
  const [ combatsList, setCombatsList] = useState([]);

  const profiles = [
    { id: 1, name: "Combate 1" },
    { id: 2, name: "Combate 2" },
    { id: 3, name: "Combate 3" },
    { id: 4, name: "Combate 4" },
    { id: 5, name: "Combate 5" },
    { id: 6, name: "Combate 6" },
    { id: 7, name: "Combate 7" },
  ];

      
  return (
    <div className="flex py-10 justify-center h-fit">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
         {profiles.map((profile) => (
          <CombatItem key={profile.id} name={profile.name}/>
         ))}
      </div>

    </div>
  )
}