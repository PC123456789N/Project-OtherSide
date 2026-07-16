import { useDataHandler } from "../../context/dataHandlerContext/DataHandlerContext.jsx";
import { useAuth } from "../../context/authContext/auth.jsx";
import { useEffect } from "react";

import Inicial from "../subcomponents/Inicial";
import CombatSelector from "../subcomponents/CombatSelector";
import Script from "../subcomponents/Script";
import Music from "../subcomponents/Music";
import LandingPage from "./LandingPage";
import CombatSheet from "../Combats/CombatSheet.jsx";
import CombatPage from "../../pages/CombatPage.jsx";


export default function MainPage(){
  const {selectedPageId, setSelectedPageId} = useDataHandler();
  const {userLoggedIn} = useAuth();

  useEffect(() => {
  if (userLoggedIn && selectedPageId === 0) {
    setSelectedPageId(1);
  }
}, [])
  
  return (
    <div className="w-full h-full">
      {selectedId == 0 && (<LandingPage />)}
      {selectedId == 1 && (<Inicial />)}
      {selectedId == 2 && (<CombatSelector />)}
      {selectedId == 3 && (<Script />)}
      {selectedId == 4 && (<Music />)}
      {selectedId == 5 && (<CombatPage />)}
    </div>
  );
}