import { Link, useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center h-screen bg-purple-900">
      
      <div className="bg-gray-900 p-10 rounded-2xl shadow-2xl text-center w-[350px]">
        
        <h1 className="text-3xl text-white font-bold mb-6">
          Bem Vindo ao Projeto Otherside
        </h1>

        <Link to="/login">
          <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg shadow-md transition">
            Ir ao Login
          </button>
        </Link>

      </div>

    </div>
  );
}