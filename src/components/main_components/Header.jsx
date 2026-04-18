import { useState } from "react"

import HeaderBtn from "../subcomponents/HeaderBtn"

export default function Header() {
  const [selected, setSelected] = useState(1)

  return (
    <>
      <header className="flex flex-col gap-3 px-4 py-3 bg-black text-white md:grid md:grid-cols-3 md:items-center">
        
        <div className="flex items-center gap-3 justify-between md:justify-start">
          <img
            src="https://static.wikia.nocookie.net/ordemparanormal/images/e/ec/S%C3%ADmbolo_de_Tenebris.png/revision/latest/scale-to-width-down/1200?cb=20230111234920&path-prefix=pt-br"
            alt="Logo"
            className="size-12"
          />

          <h1 className="text-xl font-bold text-red-500">
            OtherSide
          </h1>

          <button className="bg-purple-600 px-4 py-2 rounded md:hidden">
            <img src="https://cdn-icons-png.flaticon.com/512/446/446044.png" alt=""
            className="size-6"
            />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 md:flex md:justify-center">
          <HeaderBtn type={'inicial'} selectedId={selected} setSelectedId={setSelected}/>
          <HeaderBtn type={'combat'} selectedId={selected} setSelectedId={setSelected}/>
          <HeaderBtn type={'script'} selectedId={selected} setSelectedId={setSelected}/>
          <HeaderBtn type={'music'} selectedId={selected} setSelectedId={setSelected}/>
        </div>

        <div className="md:flex justify-center hidden md:justify-end">
          <button className="bg-purple-600 px-4 py-2 rounded">
            <img src="https://cdn-icons-png.flaticon.com/512/446/446044.png" alt=""
            className="size-6"
            />
          </button>
        </div>
      </header>

      <div className="h-1 w-100% bg-linear-to-r from-red-500 via-yellow-400 to-purple-600"></div>
    </>
  )
}