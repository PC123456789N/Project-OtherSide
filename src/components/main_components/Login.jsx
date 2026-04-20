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

      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-sm">

          {errorMessage && (
            <p className="text-red-400 text-sm mb-4 text-center">
              {errorMessage}
            </p>
          )}

          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Login
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
              className="w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded-lg text-white font-semibold"
            >
              Entrar
            </button>
          </form>

          <div className="my-4 text-center text-gray-400">ou</div>

          <button
            onClick={onGoogleSignIn}
            className="w-full bg-red-500 hover:bg-red-600 transition p-3 rounded-lg text-white font-semibold"
          >
            Entrar com Google
          </button>

        </div>
      </div>
    </>
  );
}

export default Login;