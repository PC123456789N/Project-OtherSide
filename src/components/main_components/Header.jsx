import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { useAuth } from "../../context/authContext/auth.jsx";
import { doSignOut } from "../../firebase/auth";
import { useDataHandler } from "../../context/dataHandlerContext/DataHandlerContext.jsx";
import HeaderBtn from "../subcomponents/HeaderBtn"

import logoOther from "../../assets/othersidelogo.webp";

export default function Header() {
    const navigate = useNavigate();
    const { userLoggedIn } = useAuth();
    const { selectedPageId, setSelectedPageId } = useDataHandler();
    const [isMinimized, setIsMinimized] = useState(selectedPageId === 0 ? true : false);

    useEffect(() => {
        if (selectedPageId === 0) {
            setIsMinimized(true);
        } else{
            setIsMinimized(false);
        }
    }, [selectedPageId]);

    return (
        <div className="sticky top-0 z-50 w-full bg-[#050505] overflow-x-hidden">

            <header className={`
                relative mx-auto transition-all duration-500 ease-out
                bg-[radial-gradient(circle_at_top,#1a0000,#0d0d0d,#050505)]
                border-x border-b border-white/10
                shadow-[0_10px_40px_rgba(0,0,0,0.9),0_0_30px_rgba(220,38,38,0.2)]
                ${isMinimized
                    ? 'max-h-0 py-0 opacity-0 overflow-hidden'
                    : 'max-h-50 md:max-h-125 py-2 md:py-3 opacity-100'}
                w-full md:max-w-full
            `}>

                {/* Energia */}
                <div className="absolute inset-0 pointer-events-none opacity-20 animate-pulse bg-[radial-gradient(circle,rgba(220,38,38,0.3)_0%,transparent_70%)]"></div>

                <div className="relative flex flex-col gap-2 lg:grid lg:grid-cols-3 lg:items-center px-3 lg:px-8">

                    {/* Logo */}
                    <div className="flex items-center justify-between lg:justify-start">
                        <div className="flex items-center gap-2 md:gap-4 transition-transform duration-300">
                            <img
                                src={logoOther}
                                alt="Logo"
                                className="size-7 md:size-12 drop-shadow-[0_0_10px_rgba(220,38,38,0.9)]"
                            />
                            <h1 className="text-base md:text-2xl font-black text-zinc-200 uppercase tracking-tighter">
                                Other<span className="text-red-600 drop-shadow-[0_0_12px_rgba(220,38,38,0.9)]">Side</span>
                            </h1>
                        </div>

                        {/* Botão mobile */}
                        <div className="lg:hidden">
                            {userLoggedIn ? (
                                <button
                                    onClick={() => {setSelectedPageId(0); doSignOut();}}
                                    className="text-[10px] px-3 py-1 rounded-full border border-red-600 text-red-500 active:scale-90 transition-all hover:shadow-[0_0_10px_rgba(220,38,38,0.6)]"
                                >
                                    Sair
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate("/login")}
                                    className="text-[10px] px-3 py-1 rounded-full bg-white text-black active:scale-90 transition-all hover:shadow-[0_0_10px_rgba(255,255,255,0.4)]"
                                >
                                    Login
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="h-px w-full bg-white/5 md:hidden"></div>

                    {/* Navegação */}
                    <div className="flex justify-center">
                        <nav className="
                            grid grid-cols-4 gap-2
                            lg:flex lg:flex-nowrap lg:gap-2
                            items-center
                            bg-black/50 px-2 lg:px-5 py-2 rounded-xl
                            border border-white/10 backdrop-blur-md shadow-inner
                            w-full lg:w-auto
                        ">
                            {['i', 'c', 's', 'm'].map((t) => (
                                <div
                                    key={t}
                                    className="
                                        relative overflow-hidden
                                        flex flex-col items-center justify-center
                                        py-2 md:py-0
                                        rounded-xl
                                        bg-black/40 md:bg-transparent
                                        border border-white/5 md:border-none

                                        text-zinc-400 hover:text-red-400

                                        transition-all duration-300
                                        active:scale-90
                                        cursor-pointer
                                        group
                                    "
                                >
                                    {/* 🩸 efeito sangue */}
                                    <span className="
                                        absolute inset-0
                                        bg-[linear-gradient(180deg,transparent,rgba(220,38,38,0.3),rgba(120,0,0,0.9))]
                                        translate-y-full
                                        group-hover:translate-y-0
                                        transition-transform duration-500 ease-out
                                    "></span>

                                    {/* conteúdo */}
                                    <div className="relative z-10">
                                        <HeaderBtn type={t} />
                                    </div>
                                </div>
                            ))}
                        </nav>
                    </div>

                    {/* Desktop auth */}
                    <div className="hidden lg:flex justify-end items-center gap-2">
                        {userLoggedIn ? (
                            <button
                                onClick={() => {setSelectedPageId(0); doSignOut();}}
                                className="
                                mt-1
                                px-4 py-2
                                rounded-xl
                                bg-black/40
                                border border-white/10
                                text-zinc-400
                                hover:text-red-400
                                transition-all duration-300
                                hover:border-red-500/40
                                hover:bg-red-600/10
                                active:scale-95"
                            >
                                Sign Out
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate('/login')}
                                className="
                                mt-1
                                px-4 py-2
                                rounded-xl
                                bg-black/40
                                border border-white/10
                                text-zinc-400
                                hover:text-red-400
                                transition-all duration-300
                                hover:border-red-500/40
                                hover:bg-red-600/10
                                active:scale-95"
                            >
                                Login
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Linha HUD */}
            <div className="relative flex flex-col items-end gap-0">
                <div
                    className="h-0.5 w-full bg-linear-to-r from-red-700 via-red-500 to-purple-900 blur-[1px] animate-pulse"
                />
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        setIsMinimized(!isMinimized);
                    }}
                    className="fixed px-4 py-2 right-3 mt-0.5 rounded-b-xl border-x border-b border-white/10 hover:bg-red-600 transition-all active:scale-90 hover:shadow-[0_0_12px_rgba(220,38,38,0.6)]"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={4}
                        stroke="white"
                        className={`size-4 transition-transform duration-300 ${isMinimized ? "rotate-180" : ""
                            }`}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m4.5 15.75 7.5-7.5 7.5 7.5"
                        />
                    </svg>
                </button>
            </div>
        </div>
    )
}