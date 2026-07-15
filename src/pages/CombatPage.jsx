import Header from "../components/main_components/Header";
import { useCombat } from "../context/CombatContext";

export default function CombatPage() {

    const { combatId } = useCombat();
    console.log(combatId);

    return (
        <div className="h-screen w-full grid grid-rows-[auto_1fr]">

            {/* Header */}
            <Header />

            {/* Conteúdo da página */}
            <main className="bg-gray-800 overflow-auto">

                <h1 className="p-10 text-5xl text-white">
                    Página do Combate
                </h1>
                
                <h2 className="text-white px-10">
                    ID do combate: {combatId}
                </h2>

            </main>

        </div>
    );

}