import { useState } from 'react'
import { HashRouter, Routes, Route } from "react-router-dom";
import { DataHandlerProvider } from './context/dataHandlerContext/DataHandlerContext.jsx';
import { AudioPlayerProvider } from './context/audioPlayerContext/AudioPlayerContext.jsx';

import LandingPage from './components/main_components/LandingPage';
import Login from './components/main_components/Login';
import MainLayout from './components/main_components/MainLayout';
import Registry from './components/main_components/Registry';
import GlobalPlayer from './components/main_components/GlobalAudioPlayer';
import CombatPage from "./pages/CombatPage";
import { CombatProvider } from "./context/CombatContext";



function App() {
  return (
    <DataHandlerProvider>
      <AudioPlayerProvider>
        <CombatProvider>
          <GlobalPlayer />
          <HashRouter>
            <Routes>
              <Route path="/" element={<MainLayout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registry" element={<Registry />} />
            </Routes>
          </HashRouter>
        </CombatProvider>
      </AudioPlayerProvider>
    </DataHandlerProvider>
  )
}

export default App