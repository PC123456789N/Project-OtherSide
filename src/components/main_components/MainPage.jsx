import { useSelected } from "../../context/selectedContext/SelectedContext";

import Inicial from "../subcomponents/Inicial";
import Combat from "../subcomponents/combat";
import Script from "../subcomponents/Script";
import Music from "../subcomponents/Music";
import LandingPage from "./LandingPage";


export default function MainPage(){
  const {selectedId, setSelectedId} = useSelected();
  return (
    <div className="w-full h-full">
      {selectedId == 0 && (<LandingPage />)}
      {selectedId == 1 && (<Inicial />)}
      {selectedId == 2 && (<Combat />)}
      {selectedId == 3 && (<Script />)}
      {selectedId == 4 && (<Music />)}
    </div>
  );
}