import { useState } from "react";

export default function Inicial() {
  const [nome, setNome] = useState("");
  const [iniciativa, setIniciativa] = useState(0);
  const [lista, setLista] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editNome, setEditNome] = useState("");
  const [editIniciativa, setEditIniciativa] = useState(0);

  function adicionar() {
    if (!nome) return;

    const novaLista = [
      ...lista,
      { nome, iniciativa: Number(iniciativa) }
    ];

    novaLista.sort((a, b) => b.iniciativa - a.iniciativa);

    setLista(novaLista);
    setNome("");
    setIniciativa(0);
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
    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-4xl text-center mb-8 text-purple-500 font-bold">
        Iniciativas
      </h1>

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
            type="number"
            placeholder="Iniciativa"
            value={iniciativa}
            onChange={(e) => setIniciativa(e.target.value)}
            className="p-2 bg-gray-800 text-white rounded w-28"
          />

          <button
            onClick={adicionar}
            className="bg-green-600 px-4 rounded"
          >
            +
          </button>
        </div>
      </div>

      {/* LISTA */}
      <div className="grid gap-4 max-w-md mx-auto">
        {lista.map((item, index) => (
          <div
            key={index}
            className="bg-gray-900 p-4 rounded-xl flex justify-between items-center"
          >
            {editIndex === index ? (
              <>
                {/* MODO EDIÇÃO */}
                <div className="flex gap-2">
                  <input
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                    className="p-1 bg-gray-800 text-white rounded"
                  />

                  <input
                    type="number"
                    value={editIniciativa}
                    onChange={(e) => setEditIniciativa(e.target.value)}
                    className="p-1 bg-gray-800 text-white rounded w-20"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={salvar}
                    className="bg-green-600 px-2 rounded"
                  >
                    ✔
                  </button>

                  <button
                    onClick={() => setEditIndex(null)}
                    className="bg-gray-600 px-2 rounded"
                  >
                    ✖
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* MODO NORMAL */}
                <div>
                  <p className="font-semibold">{item.nome}</p>
                  <p className="text-purple-400">
                    Iniciativa: {item.iniciativa}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => editar(index)}
                    className="bg-yellow-600 px-2 rounded"
                  >
                    ✏️
                  </button>

                  <button
                    onClick={() => remover(index)}
                    className="bg-red-600 px-2 rounded"
                  >
                    X
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