import { useSavedState } from "../../context/selectedContext/SavedStateContext";
import { useAuth } from "../../context/authContext";
import { useEffect } from "react";

import Inicial from "../subcomponents/Inicial";
import CombatSelector from "../subcomponents/CombatSelector";
import Script from "../subcomponents/Script";
import Music from "../subcomponents/Music";
import LandingPage from "./LandingPage";


export default function MainPage(){
  const {selectedId, setSelectedId} = useSavedState();
  const {userLoggedIn} = useAuth();

  useEffect(() => {
  if (userLoggedIn) {
    setSelectedId(1);
  }
}, [])
  
  return (
    <div className="w-full h-full">
      {selectedId == 0 && (<LandingPage />)}
      {selectedId == 1 && (<Inicial />)}
      {selectedId == 2 && (<CombatSelector />)}
      {selectedId == 3 && (<Script />)}
      {selectedId == 4 && (<Music />)}
    </div>
  );
}