import { useState } from "react"
import { Link, Navigate, replace, useNavigate } from "react-router-dom"

import { useAuth } from "../../context/authContext";
import { useSavedState } from "../../context/selectedContext/SavedStateContext";
import { doSignOut } from "../../firebase/auth";

import HeaderBtn from "../subcomponents/HeaderBtn"

export default function Header() {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();
  const {selectedId, setSelectedId} = useSavedState();

  return (
    <>
      <header className="flex flex-col gap-3 px-4 py-3 bg-black text-white md:grid md:grid-cols-3 md:items-center">
        
        <div className="flex items-center gap-3 justify-between md:justify-start">
          <img
            src="https://static.wikia.nocookie.net/ordemparanormal/images/e/ec/S%C3%ADmbolo_de_Tenebris.png/revision/latest/scale-to-width-down/1200?cb=20230111234920&path-prefix=pt-br"
            alt="Logo"
            className="size-10 sm:size-12"
          />

          <h1 className="text-xl font-bold text-red-500">
            OtherSide
          </h1>

          {!userLoggedIn && (
            <button className="bg-purple-600 px-3 sm:px-4 py-2 rounded md:hidden"
            onClick={() => { navigate("/login", { replace: true }) }}
            >
              Login
            </button>
          )}
          {userLoggedIn && (
            <button className="bg-purple-600 px-4 py-2 rounded md:hidden cursor-pointer hover:bg-purple-700"
            onClick={ () => doSignOut() }
            >
              SignOut
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 md:flex md:justify-center">
          <HeaderBtn type={'i'}/>
          <HeaderBtn type={'c'}/>
          <HeaderBtn type={'s'}/>
          <HeaderBtn type={'m'}/>
        </div>

        {!userLoggedIn  && (
          <div className="md:flex justify-center hidden md:justify-end">
            <button className="bg-purple-600 px-4 py-2 rounded cursor-pointer hover:bg-purple-700"
            onClick={() => { navigate("/login", { replace: true }) }}
            >
              Login
            </button>
          </div>
        )}
        {userLoggedIn &&(
          <div className="md:flex justify-center hidden items-center md:justify-end">
            <p className="me-2 hidden lg:inline">Bem vindo a Tenebris</p>
            <button className="bg-purple-600 px-2 py-2 rounded cursor-pointer hover:bg-purple-700"
            onClick={ () => doSignOut() }
            >
              Sign Out
            </button>
          </div>
        )}
      </header>

      <div className="h-1 w-full bg-linear-to-r from-red-500 via-yellow-400 to-purple-600"></div>
    </>
  )
}