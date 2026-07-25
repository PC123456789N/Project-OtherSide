import { useState } from 'react'
import { HashRouter, Routes, Route } from "react-router";
import { DataHandlerProvider } from './context/dataHandlerContext/DataHandlerContext.jsx';
import { AudioPlayerProvider } from './context/audioPlayerContext/AudioPlayerContext.jsx';

import LandingPage from './components/main_components/LandingPage';
import Login from './components/main_components/Login.jsx';
import MainLayout from './components/main_components/MainLayout';
import Registry from './components/main_components/Registry.jsx';
import GlobalPlayer from './components/main_components/GlobalAudioPlayer';
import CombatPage from "./pages/CombatPage";



function App() {
  return (
    <DataHandlerProvider>
      <AudioPlayerProvider>
        <GlobalPlayer />
        <HashRouter>
          <Routes>
            <Route path="/" element={<MainLayout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registry" element={<Registry />} />
          </Routes>
        </HashRouter>
      </AudioPlayerProvider>
    </DataHandlerProvider>
  )
}

export default App