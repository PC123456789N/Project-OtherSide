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

    const novaLista = [...lista, { nome, iniciativa: Number(iniciativa) }];

    novaLista.sort((a, b) => b.iniciativa - a.iniciativa);

    setLista(novaLista);
    setNome("");
    setIniciativa("");
  }

  function remover(index) {
    setLista(lista.filter((_, i) => i !== index));
  }

  function editar(index) {
    setEditIndex(index);
    setEditNome(lista[index].nome);
    setEditIniciativa(lista[index].iniciativa);
  }

  function salvar() {
    const novaLista = [...lista];

    novaLista[editIndex] = {
      nome: editNome,
      iniciativa: Number(editIniciativa),
    };

    novaLista.sort((a, b) => b.iniciativa - a.iniciativa);

    setLista(novaLista);
    setEditIndex(null);
  }

  return (
    <div className="relative min-h-full overflow-hidden bg-black text-white p-3">
      {/* Fundo: mesmo gradiente esfumaçado vermelho-sangue da página de música */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-32 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-red-950/40 blur-[160px]" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[520px] rounded-full bg-violet-950/25 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0)_0%,rgba(0,0,0,0.6)_75%)]" />
      </div>

      <div className="relative z-10">
        {/* HEADER — mesmo padrão de título + descrição das abas Combate e Música */}
        <div className="max-w-3xl mx-auto mb-4">
          <h1 className="text-4xl text-white">Iniciativas</h1>
          <p className="text-zinc-400 mt-1">
            Defina a ordem de turnos dos personagens e inimigos em combate.
          </p>
        </div>

        {/* BARRA DE AÇÃO — inputs + botão primário roxo, no estilo "+ Novo Combate" */}
        <div className="max-w-3xl mx-auto mb-4">
          <div className="bg-zinc-900/60 border border-white/10 rounded-xl p-2 flex flex-col sm:flex-row gap-3">
            <input
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="flex-1 p-2.5 bg-black/40 border border-white/10 text-white placeholder:text-zinc-500 rounded-lg outline-none focus:border-purple-500/60 transition-colors"
            />

            <input
              type="text"
              placeholder="Iniciativa"
              value={iniciativa}
              onChange={(e) => setIniciativa(e.target.value)}
              className="w-full sm:w-40 p-2.5 bg-black/40 border border-white/10 text-white placeholder:text-zinc-500 rounded-lg outline-none focus:border-purple-500/60 transition-colors"
            />

            <button
              onClick={adicionar}
              className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors whitespace-nowrap"
            >
              + Adicionar
            </button>
          </div>
        </div>

        {/* LISTA */}
        <div className="max-w-3xl mx-auto">
          {lista.length === 0 ? (
            <div className="text-center border border-dashed border-white/10 rounded-xl py-16">
              <p className="text-zinc-400">Nenhuma iniciativa adicionada ainda.</p>
              <p className="text-zinc-600 text-sm mt-1">
                Adicione um nome e um valor de iniciativa acima para começar.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {lista.map((item, index) => (
                <div
                  key={index}
                  className="bg-zinc-900/60 border border-white/10 hover:border-purple-500/30 rounded-xl p-3 flex justify-between items-center transition-colors"
                >
                  {editIndex === index ? (
                    <>
                      {/* MODO EDIÇÃO */}
                      <div className="flex flex-col sm:flex-row gap-2 flex-1 mr-4">
                        <input
                          value={editNome}
                          onChange={(e) => setEditNome(e.target.value)}
                          placeholder="Nome do personagem"
                          className="flex-1 p-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-purple-500/60"
                        />
                        <input
                          type="number"
                          value={editIniciativa}
                          onChange={(e) => setEditIniciativa(e.target.value)}
                          placeholder="Iniciativa"
                          className="w-full sm:w-32 p-2 rounded-lg bg-black/40 border border-white/10 text-white outline-none focus:border-purple-500/60"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={salvar}
                          className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditIndex(null)}
                          className="px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 text-sm font-medium transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* MODO NORMAL */}
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-lg bg-purple-600/15 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold shrink-0">
                          {item.iniciativa}
                        </div>
                        <div className="flex flex-col">
                          <h3 className="text-base font-semibold text-zinc-100">
                            {item.nome}
                          </h3>
                          <span className="text-sm text-zinc-500">
                            Iniciativa: {item.iniciativa}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => editar(index)}
                          className="px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-zinc-400 hover:text-purple-300 hover:border-purple-500/40 hover:bg-purple-600/10 transition-all duration-300 text-sm font-medium"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => remover(index)}
                          className="px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-zinc-400 hover:text-red-400 hover:border-red-500/40 hover:bg-red-600/10 transition-all duration-300 text-sm font-medium"
                        >
                          Excluir
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}