import { useState } from 'react'
import { HashRouter, Routes, Route } from "react-router-dom";
import { SelectedProvider } from './context/selectedContext/SelectedContext';

import LandingPage from './components/main_components/LandingPage';
import Login from './components/main_components/Login';
import MainLayout from './components/main_components/MainLayout';




function App() {
  return (
    <SelectedProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<MainLayout />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </HashRouter>
    </SelectedProvider>
  )
}

export default App