import Header from "../components/main_components/Header";
import { useCombat } from "../context/CombatContext";

export default function CombatPage() {

    const { combatId } = useCombat();
    console.log(combatId);

    return (
    <div className="flex h-full">

    {/* Sidebar (futura) */}
    <aside className="w-72 hidden">
    </aside>

    {/* Conteúdo */}
    <section className="flex-1 overflow-auto">

        {/* <CombatSheet /> */}

    </section>

    </div>
    );
}