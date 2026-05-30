import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { db } from "../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

import { useAuth } from "../../context/authContext";

import CombatItem from "./CombatItem";

export default function CombatSelector() {
  const { userId } = useAuth();
  const [combatsList, setCombatsList] = useState([]);

  const navigate = useNavigate();

  // 🔴 INICIATIVA
  const [list, setList] = useState([]);
  const [name, setName] = useState("");
  const [init, setInit] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  // 🎲 DADO
  const [diceCollapsed, setDiceCollapsed] = useState(false);
  const [diceValue, setDiceValue] = useState("");
  const [diceResult, setDiceResult] = useState(null);

  const profiles = [
    { id: 1, name: "Combate 1" },
    { id: 2, name: "Combate 2" },
    { id: 3, name: "Combate 3" },
    { id: 4, name: "Combate 4" },
    { id: 5, name: "Combate 5" },
    { id: 6, name: "Combate 6" },
    { id: 7, name: "Combate 7" },
  ];

  function handleOpenCombat(id) {
    navigate(`/combat/${id}`);
  }

  function handleAdd() {
    if (!name || !init) return;

    const newItem = {
      id: Date.now(),
      name,
      init: Number(init)
    };

    const updated = [...list, newItem].sort((a, b) => b.init - a.init);

    setList(updated);
    setName("");
    setInit("");
  }

  function handleRemove(id) {
    setList(list.filter(item => item.id !== id));
  }

  function rollDice() {
    const sides = Number(diceValue);
    if (!sides || sides <= 0) return;

    const result = Math.floor(Math.random() * sides) + 1;
    setDiceResult(result);
  }

  return (
    <div className="flex py-10 justify-center h-fit">

      {/* GRID */}
      <div className="
        grid gap-4
        grid-cols-2 
        sm:grid-cols-3 
        md:grid-cols-4 
        lg:grid-cols-5
      ">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            onClick={() => handleOpenCombat(profile.id)}
            className="cursor-pointer active:scale-95 transition"
          >
            <CombatItem name={profile.name} />
          </div>
        ))}
      </div>

      {/* 🔥 PAINEL */}
      <div className={`
        fixed bottom-0 left-0 w-full z-40
        transition-all duration-500
        ${collapsed
          ? "translate-y-full md:translate-y-full -translate-x-full md:translate-x-0"
          : "translate-y-0 translate-x-0"}
      `}>

        <div className="
          relative
          bg-[#0b0b0f]
          border-t border-white/10
          shadow-[0_-10px_40px_rgba(0,0,0,0.9)]
          backdrop-blur-md
          p-3 md:p-4
          h-[200px] md:h-[240px]
          flex flex-col gap-3
        ">

          {/* GLOW */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-red-700 via-red-500 to-purple-900 animate-pulse" />

          {/* BOTÃO MINIMIZAR PAINEL */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="
              absolute
              left-2 md:left-auto md:right-6
              top-1/2 md:top-[-16px]
              -translate-y-1/2 md:translate-y-0
              bg-[#111]
              border border-white/10
              px-3 py-1 rounded-md
              hover:bg-red-600
              transition-all
              active:scale-90
            "
          >
            {collapsed ? ">" : "<"}
          </button>

          {/* 🎲 PAINEL DE DADO */}
          <div className={`
            relative transition-all duration-500
            ${diceCollapsed ? "w-[50px]" : "w-full md:w-[260px]"}
          `}>

            <div className="
              flex items-center gap-2
              bg-[#111827]
              border border-white/10
              rounded-xl
              px-2 py-2
              shadow-inner
            ">

              {/* BOTÃO LATERAL */}
              <button
                onClick={() => setDiceCollapsed(!diceCollapsed)}
                className="
                  absolute -left-3 top-1/2 -translate-y-1/2
                  bg-[#0d0d0d]
                  border border-white/10
                  px-2 py-1
                  rounded-md
                  hover:bg-red-600
                  transition
                  active:scale-90
                "
              >
                {diceCollapsed ? ">" : "<"}
              </button>

              {!diceCollapsed && (
                <>
                  <input
                    value={diceValue}
                    onChange={(e) => setDiceValue(e.target.value)}
                    placeholder="d20"
                    className="
                      flex-1 bg-transparent px-3 py-2
                      text-sm text-white placeholder:text-white/40
                      focus:outline-none
                    "
                  />

                  <button
                    onClick={rollDice}
                    className="
                      bg-purple-600 hover:bg-purple-500
                      text-white font-bold
                      w-10 h-10 flex items-center justify-center
                      rounded-lg transition-all active:scale-90
                    "
                  >
                    🎲
                  </button>
                </>
              )}
            </div>

            {!diceCollapsed && diceResult && (
              <div className="
                mt-1 text-center text-sm font-bold
                text-purple-400 animate-pulse
              ">
                {diceResult}
              </div>
            )}
          </div>

          {/* 🔥 INPUT INICIATIVA */}
          <div className="
            flex items-center gap-2
            bg-[#111827] 
            border border-white/10
            rounded-xl
            px-2 py-2
            shadow-inner
          ">

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome"
              className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none"
            />

            <input
              value={init}
              onChange={(e) => setInit(e.target.value)}
              type="number"
              placeholder="0"
              className="w-16 bg-[#1f2937] px-3 py-2 rounded-lg text-sm text-white text-center focus:outline-none"
            />

            <button
              onClick={handleAdd}
              className="
                bg-green-500 hover:bg-green-400 text-white font-bold
                w-10 h-10 flex items-center justify-center
                rounded-lg transition-all active:scale-90
              "
            >
              +
            </button>
          </div>

          {/* LISTA */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {list.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 bg-[#111827] border border-white/10 rounded-xl px-2 py-2 shadow-inner"
              >

                <input
                  value={item.name}
                  onChange={(e) => {
                    const updated = list.map(i =>
                      i.id === item.id ? { ...i, name: e.target.value } : i
                    );
                    setList(updated);
                  }}
                  className="flex-1 bg-transparent px-3 py-2 text-sm text-white focus:outline-none"
                />

                <input
                  type="number"
                  value={item.init}
                  onChange={(e) => {
                    const updated = list.map(i =>
                      i.id === item.id ? { ...i, init: Number(e.target.value) || 0 } : i
                    ).sort((a, b) => b.init - a.init);

                    setList(updated);
                  }}
                  className="w-16 bg-[#1f2937] px-3 py-2 rounded-lg text-sm text-white text-center focus:outline-none"
                />

                <button
                  onClick={() => handleRemove(item.id)}
                  className="
                    w-10 h-10 flex items-center justify-center
                    rounded-lg bg-red-600/20 text-red-400
                    hover:bg-red-600 hover:text-white
                    transition-all active:scale-90
                  "
                >
                  ✕
                </button>

              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}