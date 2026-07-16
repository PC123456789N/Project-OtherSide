import { useState } from "react";

export default function CombatSheet() {

    const [activeTab, setActiveTab] = useState("description");

    return (

        <main className="w-full min-h-screen bg-zinc-950 p-6">

            <div className="max-w-[1800px] mx-auto">

                {/* Header */}

                <div className="mb-6">

                    <h1 className="font-cinzel text-5xl text-white">
                        Nome da Criatura
                    </h1>

                    <p className="text-zinc-500 mt-2">
                        Combat Sheet
                    </p>

                </div>

                {/* Grid Principal */}

                <div className="grid grid-cols-12 gap-6">

                    {/* Painel esquerdo */}

                    <aside className="col-span-3 space-y-6">

                        {/* Retrato */}

                        <div className="
                            h-[420px]
                            rounded-2xl
                            border
                            border-zinc-800
                            bg-zinc-900
                            flex
                            items-center
                            justify-center
                        ">

                            <span className="text-zinc-500">
                                Retrato
                            </span>

                        </div>

                        {/* Configurações */}

                        <div className="
                            rounded-2xl
                            border
                            border-zinc-800
                            bg-zinc-900
                            p-6
                        ">

                            <h2 className="font-cinzel text-white text-xl mb-5">
                                Configurações
                            </h2>

                            <div className="space-y-5">

                                <div>
                                    <p className="text-white">
                                        Multi Criatura
                                    </p>

                                    <p className="text-zinc-500 text-sm">
                                        Permite adicionar várias criaturas.
                                    </p>
                                </div>

                                <div>
                                    <p className="text-white">
                                        Música
                                    </p>

                                    <p className="text-zinc-500 text-sm">
                                        Música do combate.
                                    </p>
                                </div>

                                <div>
                                    <p className="text-white">
                                        Auto iniciativa
                                    </p>

                                    <p className="text-zinc-500 text-sm">
                                        Conecta automaticamente.
                                    </p>
                                </div>

                            </div>

                        </div>

                    </aside>

                    {/* Painel Direito */}

                    <section className="col-span-9 space-y-6">

                        {/* Informações */}

                        <div className="
                            rounded-2xl
                            border
                            border-zinc-800
                            bg-zinc-900
                            p-6
                        ">

                            <div className="grid grid-cols-3 gap-4">

                                <input
                                    placeholder="Nome"
                                    className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white"
                                />

                                <input
                                    placeholder="HP"
                                    className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white"
                                />

                                <input
                                    placeholder="Defesa"
                                    className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white"
                                />

                            </div>

                        </div>

                        {/* Status */}

                        <div className="
                            rounded-2xl
                            border
                            border-zinc-800
                            bg-zinc-900
                            p-6
                        ">

                            <div className="grid grid-cols-5 gap-4">

                                {["HP","SAN","PE","DEF","ESQ"].map(stat => (

                                    <div
                                        key={stat}
                                        className="
                                            rounded-xl
                                            bg-zinc-950
                                            border
                                            border-zinc-800
                                            p-5
                                            text-center
                                        "
                                    >

                                        <h2 className="text-zinc-500">
                                            {stat}
                                        </h2>

                                        <p className="text-white text-3xl font-bold mt-2">
                                            --
                                        </p>

                                    </div>

                                ))}

                            </div>

                        </div>

                        {/* Tabs */}

                        <div className="
                            rounded-2xl
                            border
                            border-zinc-800
                            bg-zinc-900
                        ">

                            <div className="flex">

                                <TabButton
                                    text="Descrição"
                                    active={activeTab==="description"}
                                    onClick={()=>setActiveTab("description")}
                                />

                                <TabButton
                                    text="Ataques"
                                    active={activeTab==="attacks"}
                                    onClick={()=>setActiveTab("attacks")}
                                />

                                <TabButton
                                    text="Perícias"
                                    active={activeTab==="skills"}
                                    onClick={()=>setActiveTab("skills")}
                                />

                                <TabButton
                                    text="Inventário"
                                    active={activeTab==="inventory"}
                                    onClick={()=>setActiveTab("inventory")}
                                />

                            </div>

                            <div className="border-t border-zinc-800 p-8 h-[450px]">

                                {activeTab==="description" && (

                                    <textarea
                                        placeholder="Descrição..."
                                        className="
                                            w-full
                                            h-full
                                            bg-zinc-950
                                            border
                                            border-zinc-800
                                            rounded-xl
                                            p-5
                                            text-white
                                            resize-none
                                        "
                                    />

                                )}

                                {activeTab==="attacks" && (

                                    <div className="text-zinc-500">

                                        Lista de ataques

                                    </div>

                                )}

                                {activeTab==="skills" && (

                                    <div className="text-zinc-500">

                                        Lista de perícias

                                    </div>

                                )}

                                {activeTab==="inventory" && (

                                    <div className="text-zinc-500">

                                        Inventário

                                    </div>

                                )}

                            </div>

                        </div>

                    </section>

                </div>

            </div>

        </main>

    );

}

function TabButton({text,active,onClick}){

    return(

        <button

            onClick={onClick}

            className={`
                flex-1
                py-5
                transition
                font-cinzel

                ${active
                    ? "text-violet-400 border-b-2 border-violet-500 bg-zinc-950"
                    : "text-zinc-400 hover:bg-zinc-800"}
            `}
        >

            {text}

        </button>

    )

}