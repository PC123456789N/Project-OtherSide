import Header from './components/main_components/Header.jsx'
import { useState } from 'react'

function App() {
  return (
    <div className="h-screen w-full grid grid-rows-[auto_1fr] grid-flow-col">
      <div>
        <Header />
      </div>

      <div className='bg-gray-800 p-4'>

      </div>
    </div>
  )
}

export default App