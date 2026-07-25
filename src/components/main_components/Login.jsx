import { useState } from "react";
import { Navigate, useNavigate } from "react-router";

import { doSignInWithEmailAndPassword, doSignInWithGoogle } from "../../firebase/auth.js";
import { useAuth } from "../../context/authContext/auth.jsx";

import { FcGoogle } from "react-icons/fc";
import logo from "../../assets/othersidelogo.webp";

const Login = () => {
  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!isSigningIn) {
      setIsSigningIn(true);
      setErrorMessage("");

      try {
        await doSignInWithEmailAndPassword(email, password);
      } catch (err) {
        setErrorMessage("Email ou senha inválidos");
        setIsSigningIn(false);
      }
    }
  };

  const onGoogleSignIn = (e) => {
    e.preventDefault();
    if (!isSigningIn) {
      setIsSigningIn(true);
      doSignInWithGoogle().catch((err) => {
        setIsSigningIn(false);
        console.error("Erro Google:", err);
      });
    }
  };

  return (
    <>
      {userLoggedIn && <Navigate to={"/"} replace={true} />}

      <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden px-4">
        {/* brilho de fundo — mesmo tom do header do app */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(147,51,234,0.15),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(220,38,38,0.12),transparent_60%)]" />

        <div className="relative w-full max-w-sm bg-zinc-900/60 backdrop-blur border border-white/10 rounded-2xl p-8 shadow-xl">
          {/* LOGO — mesma marca OTHERSIDE do header */}
          <div className="flex flex-col items-center mb-8">
            <img src={logo} alt="OtherSide" className="w-14 h-14 mb-3 object-contain" />
            <h1 className="text-2xl font-bold">
              <span className="text-white">OTHER</span>
              <span
                className="text-red-500"
                style={{ textShadow: "0 0 10px rgba(239,68,68,0.85), 0 0 22px rgba(239,68,68,0.5)" }}
              >
                SIDE
              </span>
            </h1>
            <p className="text-zinc-500 text-sm mt-1">Entre para continuar sua jornada</p>
          </div>

          {errorMessage && (
            <p className="text-red-400 text-sm mb-4 text-center bg-red-500/10 border border-red-500/30 rounded-lg py-2 px-3">
              {errorMessage}
            </p>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-zinc-500 outline-none focus:border-purple-500/60 transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Senha"
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-zinc-500 outline-none focus:border-purple-500/60 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={isSigningIn}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-60 transition-colors p-3 rounded-lg text-white font-semibold"
            >
              {isSigningIn ? "Entrando..." : "Entrar"}
            </button>

            <button
              type="button"
              onClick={onGoogleSignIn}
              disabled={isSigningIn}
              className="w-full flex justify-center items-center gap-3 bg-black/40 border border-white/10 hover:border-purple-500/40 hover:bg-purple-600/10 disabled:opacity-60 transition-colors p-3 rounded-lg text-white font-semibold"
            >
              <FcGoogle className="size-5" />
              <span>Entrar com Google</span>
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-zinc-500 text-xs uppercase tracking-wide">ou</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <button
            type="button"
            className="w-full bg-transparent transition-colors p-3 rounded-lg border border-purple-700/50 text-purple-400 hover:bg-purple-600/10 hover:text-purple-300 font-semibold"
            onClick={() => navigate("/registry", { replace: true })}
          >
            Não tem uma conta? Registrar
          </button>
        </div>
      </div>
    </>
  );
};

export default Login;
