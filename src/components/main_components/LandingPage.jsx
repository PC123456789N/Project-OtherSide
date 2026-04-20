import { Navigate, Link, useNavigate } from "react-router-dom";

export default function LandingPage () {
  const navigate = useNavigate();

  return (
    <>
      <div>
        <h1>Bem Vindo ao Projeto Otherside</h1>
        <Link to="/login">
          <button>
            <p>Ir ao Login</p>
          </button>
        </Link>
      </div>
    </>
  );
}