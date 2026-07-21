const tabs = [
  {
    id: "combat",
    label: "Ataques / Habilidades / Resistências",
  },

  {
    id: "skills",
    label: "Perícias",
  },

  {
    id: "description",
    label: "Descrição / Enigma do Medo",
  },
];

export default function MonsterTabs({ selectedTab, setSelectedTab }) {
  return (
    <section className="flex flex-wrap gap-3">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setSelectedTab(tab.id)}
          className={`
            rounded-lg
            px-5
            py-2
            text-sm
            font-medium
            transition
            ${
              selectedTab === tab.id
                ? "bg-violet-700 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </section>
  );
}