import { useState } from 'react';

import Header from './Header.jsx'
import MainPage from './MainPage.jsx'

export default function MainLayout() {
  const [selectedId, setSelectedId] = useState(1)

  return (
    <div className="h-screen w-full grid grid-rows-[auto_1fr] grid-flow-col">
      <div>
          <Header selectedId={selectedId} setSelectedId={setSelectedId} />
      </div>
    
      <div className='bg-gray-800 flex flex-col h-full overflow-hidden'>
          <MainPage selectedId={selectedId} />
      </div>
    </div>        
  );
}