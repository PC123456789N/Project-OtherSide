import { useContext, useState } from 'react';

import Header from './Header.jsx'
import MainPage from './MainPage.jsx'

export default function MainLayout() {

  return (
    <div className="h-screen w-full grid grid-rows-[auto_1fr] grid-flow-col">
      <div>
          <Header/>
      </div>
    
      <div className='bg-gray-800 flex flex-col h-full overflow-hidden'>
          <MainPage/>
      </div>
    </div>        
  );
}