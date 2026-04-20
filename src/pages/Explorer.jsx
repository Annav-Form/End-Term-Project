import React from 'react';
import Sidebar from '../components/Sidebar';
import ProblemTable from '../components/ProblemTable';

const Explorer = () => {
  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      {/* Sidebar for Filters */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 w-full bg-slate-900/50 p-6 rounded-xl shadow-lg border border-slate-800/80 flex flex-col backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-slate-100 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
          Problem Explorer
        </h1>
        
        {/* ProblemTable Component */}
        <ProblemTable />
      </div>
    </div>
  );
};

export default Explorer;
