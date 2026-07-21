import { useDataHandler } from "../../context/dataHandlerContext/DataHandlerContext.jsx";
import { useAuth } from "../../context/authContext/auth.jsx";
import { useEffect } from "react";

import Inicial from "../subcomponents/Inicial";
import CombatSelector from "../subcomponents/CombatSelector";
import Script from "../subcomponents/Script.jsx";
import Music from "../subcomponents/Music";
import LandingPage from "./LandingPage";
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
      {selectedPageId == 0 && (<LandingPage />)}
      {selectedPageId == 1 && (<Inicial />)}
      {selectedPageId == 2 && (<CombatSelector />)}
      {selectedPageId == 3 && (<Script />)}
      {selectedPageId == 4 && (<Music />)}
      {selectedPageId == 5 && (<CombatPage />)}
    </div>
  );
}