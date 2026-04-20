import React from 'react';
import Sidebar from '../components/Sidebar';
import ProblemTable from '../components/ProblemTable';
import { useAuthStore } from '../store/useAuthStore';
import { Lock } from 'lucide-react';

const Bookmarks = () => {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-slate-700">
            <Lock className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-3">Authentication Required</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            You must be signed in with Google to view and manage your saved bookmarks across your devices.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      {/* Sidebar for Filters */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 w-full bg-slate-900/50 p-6 rounded-xl shadow-lg border border-slate-800/80 flex flex-col backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold text-slate-100 bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">
            Saved Bookmarks
          </h1>
        </div>
        
        {/* Render the Table with onlyBookmarked flag */}
        <ProblemTable onlyBookmarked={true} />
      </div>
    </div>
  );
};

export default Bookmarks;
