import Inicial from "../subcomponents/Inicial";
import Combat from "../subcomponents/combat";
import Script from "../subcomponents/Script";
import Music from "../subcomponents/Music";

export default function MainPage( {selectedId} ){
  return (
    <div className="w-full h-full">
      {selectedId == 1 && (<Inicial />)}
      {selectedId == 2 && (<Combat />)}
      {selectedId == 3 && (<Script />)}
      {selectedId == 4 && (<Music />)}
    </div>
  );
}