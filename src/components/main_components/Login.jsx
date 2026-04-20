import { useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";

import { doSignInWithEmailAndPassword, doSignInWithGoogle } from "../../firebase/auth";
import { useAuth } from "../../context/authContext";

const Login = () => {
  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
    e.preventDefault()
    if (!isSigningIn) {
      setIsSigningIn(true)
      doSignInWithGoogle().catch(err => {
        setIsSigningIn(false)
      })
    }
  };

  return (
    <>
      {userLoggedIn && ( <Navigate to={'/'} replace={true} />) }

      <div className="min-h-screen flex items-center justify-center bg-center bg-no-repeat bg-cover sm:bg-contain bg-black bg-[url(./././assets/tenebrislogin.jpg)]">
        <div className="bg-gray-900 p-8 md:p-4 rounded-2xl shadow-lg w-full max-w-sm border-4 border-double border-purple-800">

          {errorMessage && (
            <p className="text-red-400 text-sm mb-4 text-center">
              {errorMessage}
            </p>
          )}

          <h2 className="text-xl font-bold text-purple-600 mb-6 text-center">
            Fazer Login
          </h2>

          <form onSubmit={onSubmit} className="space-y-4">

            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Senha"
              className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 transition p-3 rounded-lg text-white font-semibold"
            >
              Entrar
            </button>

            <button
              className="w-full bg-slate-800  transition p-3 rounded-lg text-purple-600 hover:bg-purple-900 hover:text-white font-semibold"
              onClick={() => { navigate("/registry", { replace: true }) }}
            >
              Registrar Conta
            </button>
          </form>

          <div className="my-4 text-center text-gray-400"> --- ou --- </div>

          <button
            onClick={onGoogleSignIn}
            className="w-full bg-red-800 hover:bg-red-700 transition p-3 rounded-lg text-white font-semibold"
          >
            Entrar com Google
          </button>

        </div>
      </div>
    </>
  );
}

export default Login;