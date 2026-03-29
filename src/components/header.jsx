function Header() {
  return (
    <>
      <header className="bg-black text-white flex items-center justify-between px-6 py-4">

        <div className="flex items-center gap-3">
          <img
            src="https://img.freepik.com/vetores-gratis/logotipo-de-asas-de-espada-de-design-plano_23-2150404216.jpg"
            alt="Logo"
            className="w-10"
          />
          <h1 className="text-xl font-bold text-red-500">
            C.R.I.S.
          </h1>
        </div>

        <nav className="flex gap-8">
          <a href="#">Agentes</a>
          <a href="#">Campanhas</a>
          <a href="#">Ameaças</a>
          <a href="#">Homebrew</a>
          <a href="#">Patente</a>
        </nav>

        <button className="bg-purple-600 px-4 py-2 rounded">
          LOGIN
        </button>

      </header>

      {/* achei daora */}
      <div className="h-1 bg-gradient-to-r from-red-500 via-yellow-400 to-purple-600"></div>
    </>
  )
}

export default Header