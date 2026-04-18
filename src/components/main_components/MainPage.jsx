import Script from "../subcomponents/Script";

export default function MainPage( {selectedId} ){
  return (
    <div className="w-full h-full">
      {selectedId == 3 && (<Script />)}
    </div>
  );
}