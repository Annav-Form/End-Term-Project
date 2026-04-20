import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col items-center">
      {/* Ambient glowing background orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-fuchsia-600/10 blur-[120px] pointer-events-none" />
      
      <Navbar />
      
      {/* Pushed down to account for the floating navbar */}
      <main className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-12 relative z-10 flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;