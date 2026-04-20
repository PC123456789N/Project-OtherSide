import { useState } from 'react'
import { HashRouter, Routes, Route } from "react-router-dom";
import LandingPage from './components/main_components/LandingPage';
import Login from './components/main_components/Login';
import MainLayout from './components/main_components/MainLayout';




function App() {
  return(
    <HashRouter>
      <Routes>
        <Route path="/" element={ <LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mainpage" element={<MainLayout />} />
      </Routes>
    </HashRouter>
  )
}

export default App