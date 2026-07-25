
import { useNavigate } from "react-router-dom"
import logoOther from "../../assets/othersidelogo.webp";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-[#050108] text-[#e8e3e8] overflow-hidden">
      {/* HERO */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Portal glow — o elemento de assinatura */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-140 h-140 rounded-full bg-[radial-gradient(circle,rgba(220,38,38,0.18)_0%,rgba(147,51,234,0.12)_35%,transparent_70%)] animate-[pulse_5s_ease-in-out_infinite]" />
        </div>
        {/* Selo hexagonal girando devagar */}
        <svg
          viewBox="0 0 200 200"
          className="absolute w-72 h-72 opacity-20 animate-[spin_60s_linear_infinite]"
        >
          <polygon
            points="100,10 175,55 175,145 100,190 25,145 25,55"
            fill="none"
            stroke="#dc2626"
            strokeWidth="1"
          />
          <polygon
            points="100,40 150,70 150,130 100,160 50,130 50,70"
            fill="none"
            stroke="#a855f7"
            strokeWidth="0.75"
          />
          <image href={logoOther} x="100" y="100" width="80" height="80"
            className="transform-fill origin-center -translate-x-1/2 -translate-y-1/2"
          />
        </svg>

        <span
          className="relative text-xs tracking-[0.4em] uppercase text-[#dc2626] mb-4"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          O melhor companion para mestres de Ordem Paranormal
        </span>

        {/* <h1
          className="relative text-5xl md:text-6xl font-bold mb-4 tracking-wide"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          PROJETO <span className="text-[#dc2626]">OTHERSIDE</span>
        </h1> */}
        <h1
          className="relative text-5xl md:text-6xl font-bold mb-4 tracking-wide"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          <span className="me-5">PROJECT</span>
          <span className="text-white">OTHER</span>
          <span className="text-[#dc2626] drop-shadow-[0_0_12px_rgba(220,38,38,0.7)]">
            SIDE
          </span>
        </h1>

        <p className="relative w-170 text-[#8b8594] mb-10 leading-relaxed">
          Sua mesa, sua campanha, seu grimório digital. Combates, iniciativas,
          roteiro e trilhas sonoras. Tudo em um só lugar, para você e seus jogadores.
        </p>

        <div className="flex gap-10 relative">
          <button className="relative px-8 py-3.5 w-40 rounded-lg font-semibold tracking-wide bg-linear-to-l from-[#000000] to-[#dc2626] text-white shadow-[0_0_25px_rgba(220,38,38,0.35)] transition-transform duration-200 hover:scale-105 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Developers
          </button>
          <button className="relative px-8 py-3.5 w-40 rounded-lg font-semibold tracking-wide bg-linear-to-l from-[#9333ea] to-[#000000] text-white shadow-[0_0_25px_rgba(220,38,38,0.35)] transition-transform duration-200 hover:scale-105 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Fazer Login
          </button>
        </div>

        <div className="absolute bottom-10 flex flex-col items-center gap-2 text-[#6b6470] animate-bounce">
          <span className="text-xs tracking-widest uppercase">Explorar</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 5v14M5 12l7 7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>

      {/* PRÉVIA DAS SEÇÕES */}
      <section className="relative px-6 pb-12">
        <div className="flex items-center gap-4 max-w-4xl mx-auto mb-12">
          <div className="h-px flex-1 bg-linear-to-r from-transparent to-[#dc2626]/40" />
          <span className="text-[#dc2626] text-lg">⬡</span>
          <div className="h-px flex-1 bg-linear-to-l from-transparent to-[#dc2626]/40" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-4xl mx-auto">
          {[
            { label: "Iniciativas", desc: "Organização de iniciativas automaticas." },
            { label: "Combate", desc: "Registro de todas as batalhas" },
            { label: "Roteiro", desc: "Saber tudo, é perder tudo." },
            { label: "Música", desc: "Trilha sonora de cada cena" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-white/5 bg-white/2 px-5 py-6  text-left hover:border-[#dc2626]/30 hover:bg-white/[0.04] transition-colors duration-200"
            >
              <h3
                className="text-lg mb-1 text-[#e8e3e8]"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {item.label}
              </h3>
              <p className="text-sm text-[#6b6470]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center text-xs text-gray-500 pb-6 px-4 border-gray-900">
        <p className="mb-1">
          Projeto de fã sem fins lucrativos. Inspirado no <strong>Site C.R.I.S.</strong>
        </p>
        <p>
          Todos os direitos de imagem, artes e marcas pertencem ao <strong>Cellbit</strong> e à <strong>Equipe do Ordem Paranormal</strong>.
        </p>
      </footer>
    </div>
  );
}