import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CombatItem from "./CombatItem";
import CreateCombatModal from "./CreateCombatModal";
import { useDataHandler } from "../../context/dataHandlerContext/DataHandlerContext";

const TYPES = [
  "Todos",
  "Criatura",
  "Boss",
  "Monstro"
];
export default function CombatSelector() {

  const { selectedPageId, setSelectedPageId } = useDataHandler();

  const {combats, setCombats} = useDataHandler();
  const { setCombatId } = useDataHandler();

  useEffect(() => {
    console.log("Lista de combates:");
    console.log(combats);
  }, [combats]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCombat, setSelectedCombat] = useState(null);
  const [openedCombat, setOpenedCombat] = useState(null);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("Todos");

  const navigate = useNavigate();


  function openCreateModal() {
    setSelectedCombat(null);
    setModalOpen(true);
  }

  function openEditModal(combat) {
    setSelectedCombat(combat);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSelectedCombat(null);
  }

  function saveCombat(data) {
    if (selectedCombat) {
      setCombats(prev =>
        prev.map(item =>
          item.id === selectedCombat.id
            ? { ...item, ...data }
            : item
        )
      );
    }
    else {
      setCombats(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          ...data
        }
      ]);
    }

    closeModal();
  }

  function deleteCombat(id) {
    if (!window.confirm("Deseja remover este combate?"))
      return;
    setCombats(prev =>
      prev.filter(item => item.id !== id)
    );
  }

  function openCombat(combat) {
    setCombatId(combat.id);
    setSelectedPageId(5);
  }

  console.log("combats:", combats);
  const filteredCombats = combats.filter(combat => {
    const searchText = search.toLowerCase();
    const matchName =
      combat.name.toLowerCase().includes(searchText) ||
      combat.location?.toLowerCase().includes(searchText);

    const matchType =
      filterType === "Todos"
      ||
      combat.type === filterType;
    return matchName && matchType;
  });
  return (
    <main
      className="
            relative
            min-h-screen
            overflow-hidden
            bg-zinc-950
            px-6
            py-8"
    >
      {/* Fundo: mesmo gradiente esfumaçado vermelho-sangue das outras páginas */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-32 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-red-950/40 blur-[160px]" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[520px] rounded-full bg-violet-950/25 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0)_0%,rgba(0,0,0,0.6)_75%)]" />
      </div>

      <div className="relative z-10">

      {/* Cabeçalho */}
      <div
        className="
                mb-8
                flex
                flex-col
                gap-6
                lg:flex-row
                lg:items-end
                lg:justify-between"
      >
        <div>
          <h1
            className="
                        font-cinzel
                        text-5xl
                        text-white"
          >
            Combates
          </h1>
          <p
            className="
                        mt-2
                        text-zinc-400"
          >
            Explore todos os combates ocorridos em sua jornada.
          </p>
        </div>

        <div
          className="
                    flex
                    flex-col
                    gap-3
                    md:flex-row"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou local..."
            className="
                        h-12
                        w-full
                        rounded-xl
                        border
                        border-zinc-800
                        bg-zinc-900
                        px-5
                        text-white
                        outline-none
                        transition
                        focus:border-violet-500
                        md:w-80"
          />
          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(e.target.value)
            }
            className="
                        h-12
                        rounded-xl
                        border
                        border-zinc-800
                        bg-zinc-900
                        px-4
                        text-white
                        outline-none"
          >
            {
              TYPES.map(type => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              ))
            }
          </select>
          <button
            onClick={openCreateModal}
            className="
                        rounded-xl
                        bg-violet-600
                        px-7
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:bg-violet-700"
          >
            + Novo Combate
          </button>
        </div>
      </div>
      {
        filteredCombats.length === 0 ?
          (
            <div
              className="
                            flex
                            h-72
                            items-center
                            justify-center
                            rounded-2xl
                            border-2
                            border-dashed
                            border-zinc-800
                            "
            >
              <p
                className="
                                font-cinzel
                                text-zinc-500
                                "
              >
                Nenhum combate encontrado.
              </p>
            </div>
          ) :
          (
            <section
              className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]"
            >
              {
                filteredCombats.map(combat => (
                  <CombatItem
                    key={combat.id}
                    combat={combat}
                    onOpen={openCombat}
                    onEdit={openEditModal}
                    onDelete={deleteCombat}
                  />
                ))
              }
            </section>
          )
      }

      <CreateCombatModal
        open={modalOpen}
        onClose={closeModal}
        onSave={saveCombat}
        combat={selectedCombat}
      />

      </div>
    </main>
  );
}