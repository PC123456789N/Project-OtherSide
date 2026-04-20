import { useNavigate, Navigate } from "react-router-dom";
import { useState } from "react";

import { useAuth } from "../../context/authContext";
import { doCreateUserWithEmailAndPassword } from "../../firebase/auth";

export const Registry = () => {
  const navigate = useNavigate();
  const userLoggedIn = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(false)
  const [isRegistering, setIsRegistering] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault()
    if(!isRegistering){
      setIsRegistering(true)
      await doCreateUserWithEmailAndPassword(email, password)
    }
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-sm">

          {errorMessage && (
            <p className="text-red-400 text-sm mb-4 text-center">
              {errorMessage}
            </p>
          )}

          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Registrar Conta
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

            <input
              type="password"
              placeholder="Confirme a Senha"
              className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded-lg text-white font-semibold"
            >
              Criar Conta
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default Registry