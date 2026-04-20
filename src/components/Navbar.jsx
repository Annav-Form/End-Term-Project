import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Bookmark, LayoutDashboard, Code2, LogOut, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const Navbar = () => {
  const { user, isAuthLoading } = useAuthStore();

  const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      alert('Failed to sign in. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign-Out Error:", error);
    }
  };

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl bg-zinc-900/70 backdrop-blur-2xl border border-white/5 rounded-full px-6 py-3 flex justify-between items-center z-50 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <div className="flex items-center gap-3 group cursor-pointer">
        <div className="p-2 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-full shadow-lg shadow-violet-500/20">
          <Code2 className="h-5 w-5 text-white" />
        </div>
        <span className="font-extrabold text-lg tracking-tight text-white hidden sm:block">
          CF Manager
        </span>
      </div>
      
      <div className="flex items-center gap-1 sm:gap-2">
        <NavLink to="/" className={({isActive}) => `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${isActive ? 'bg-white/10 text-violet-300 shadow-inner' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'}`}>
          <Home className="h-4 w-4" />
          <span className="hidden md:inline">Explorer</span>
        </NavLink>
        <NavLink to="/bookmarks" className={({isActive}) => `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${isActive ? 'bg-white/10 text-violet-300 shadow-inner' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'}`}>
          <Bookmark className="h-4 w-4" />
          <span className="hidden md:inline">Bookmarks</span>
        </NavLink>
        <NavLink to="/dashboard" className={({isActive}) => `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${isActive ? 'bg-white/10 text-violet-300 shadow-inner' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'}`}>
          <LayoutDashboard className="h-4 w-4" />
          <span className="hidden md:inline">Dashboard</span>
        </NavLink>
      </div>

      <div className="flex items-center pl-4 border-l border-white/10">
        {isAuthLoading ? (
           <Loader2 className="h-5 w-5 text-zinc-500 animate-spin" />
        ) : user ? (
          <div className="flex items-center gap-3">
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=8B5CF6&color=fff`} 
              alt="Profile" 
              className="w-9 h-9 rounded-full ring-2 ring-violet-500/30 object-cover"
            />
            <button 
              onClick={handleSignOut}
              className="p-2 rounded-full text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <button 
            onClick={handleSignIn}
            className="px-5 py-2 bg-white text-black hover:bg-zinc-200 text-sm font-bold rounded-full transition-transform active:scale-95 shadow-lg shadow-white/10 flex items-center gap-2"
          >
            Sign in
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;