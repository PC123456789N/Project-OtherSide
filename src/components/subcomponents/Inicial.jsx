import { useState } from "react";

import { useDataHandler } from "../../context/dataHandlerContext/DataHandlerContext";

export default function Inicial() {
  const [nome, setNome] = useState("");
  const [iniciativa, setIniciativa] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editNome, setEditNome] = useState("");
  const [editIniciativa, setEditIniciativa] = useState(0);

  const { initiativeList, setInitiativeList } = useDataHandler();

  const lista = initiativeList || [];
  const setLista = setInitiativeList;

  function adicionar() {
    if (!nome || !iniciativa) return;

    const novaLista = [
      ...lista,
      { nome, iniciativa: Number(iniciativa) }
    ];

    console.log(novaLista)

    novaLista.sort((a, b) => b.iniciativa - a.iniciativa);

    setLista(novaLista);
    setNome("");
    setIniciativa("");
  }

  function remover(index) {
    setLista(lista.filter((_, i) => i !== index));
  }

  // ✏️ iniciar edição
  function editar(index) {
    setEditIndex(index);
    setEditNome(lista[index].nome);
    setEditIniciativa(lista[index].iniciativa);
  }

  // 💾 salvar edição
  function salvar() {
    const novaLista = [...lista];

    novaLista[editIndex] = {
      nome: editNome,
      iniciativa: Number(editIniciativa)
    };

    // reordenar após edição
    novaLista.sort((a, b) => b.iniciativa - a.iniciativa);

    setLista(novaLista);
    setEditIndex(null);
  }

  return (
    <div className="min-h-full bg-black text-white p-6">

      {/* INPUT */}
      <div className="bg-gray-900 p-4 rounded-xl max-w-md mx-auto mb-6">
        <div className="flex gap-2">
          <input
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="p-2 bg-gray-800 text-white rounded w-full"
          />

          <input
            type="text"
            placeholder="Adicionar iniciativa"
            value={iniciativa}
            onChange={(e) => setIniciativa(e.target.value)}
            className="p-2 bg-gray-800 text-white rounded w-40" />
          <button
            onClick={adicionar}
            className="px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-zinc-400 hover:text-red-400 hover:border-red-500/40 hover:bg-red-600/10 transition-all duration-300"
          >
            Adicionar
          </button>
        </div>
      </div>

      {/* LISTA */}
      <div className="grid gap-4 max-w-md mx-auto">
        {lista.map((item, index) => (
          <div
            key={index}
            className="bg-gray-900 border border-white/10 p-4 rounded-xl flex justify-between items-center"
          >
            {editIndex === index ? (
              <>
                {/* MODO EDIÇÃO */}
                <div className="flex flex-col gap-2 flex-1">
                  <input
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                    placeholder="Nome do personagem"
                    className="p-2 rounded-xl bg-gray-800 border border-white/10"/>
                  <input
                    value={editIniciativa}
                    onChange={(e) => setEditIniciativa(e.target.value)}
                    placeholder="Iniciativa"
                    className="p-2 rounded-xl bg-gray-800 border border-white/10"/>
                </div>

                <div className="flex gap-2 ml-6">
                  <button
                    onClick={salvar}
                    className="px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-zinc-400 hover:text-red-400 hover:border-red-500/40 hover:bg-red-600/10 transition-all duration-300">
                    Inserir
                  </button>

                  <button
                    onClick={() => setEditIndex(null)}
                    className="px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-zinc-400 hover:text-red-400 hover:border-red-500/40 hover:bg-red-600/10 transition-all duration-300"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* MODO NORMAL */}
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold text-zinc-100">
                    {item.nome}
                  </h3>

                  <span className="text-sm text-zinc-400">
                    Iniciativa: {item.iniciativa}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => editar(index)}
                    className="
                px-4 py-2
                rounded-xl
                bg-black/40
                border border-white/10
                text-zinc-400
                hover:text-red-400
                hover:border-red-500/40
                hover:bg-red-600/10
                transition-all duration-300
            "
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => remover(index)}
                    className="
                px-4 py-2
                rounded-xl
                bg-black/40
                border border-white/10
                text-zinc-400
                hover:text-red-400
                hover:border-red-500/40 hover:bg-red-600/10 transition-all duration-300
">
                    Excluir
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}