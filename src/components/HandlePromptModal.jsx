import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const HandlePromptModal = () => {
  const { user, cfHandle, isAuthLoading, setCfHandle } = useAuthStore();
  const [handleInput, setHandleInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (isAuthLoading || !user || cfHandle) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!handleInput.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`https://codeforces.com/api/user.info?handles=${handleInput.trim()}`);
      const data = await res.json();

      if (data.status !== 'OK') throw new Error('Codeforces handle not found');

      const verifiedHandle = data.result[0].handle;

      await setDoc(doc(db, 'users', user.uid), {
        cfHandle: verifiedHandle,
        email: user.email,
        displayName: user.displayName,
        updatedAt: new Date()
      }, { merge: true });

      setCfHandle(verifiedHandle);
    } catch (err) {
      setError(err.message || 'Failed to link handle. Please check your spelling.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500"></div>
        
        <div className="p-8">
          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Sync Account</h2>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
            Link your Codeforces handle to unlock personalized problem tracking and advanced analytics.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <input
                type="text"
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value)}
                placeholder="Enter CF handle (e.g., tourist)"
                required
                className="w-full px-5 py-3.5 bg-zinc-950/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 text-base text-zinc-100 placeholder-zinc-600 transition-all"
              />
            </div>
            
            {error && (
              <div className="text-rose-400 text-sm font-medium bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !handleInput.trim()}
              className="mt-2 w-full py-3.5 bg-white text-black hover:bg-zinc-200 text-sm font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed shadow-lg shadow-white/10"
            >
              {isSubmitting ? 'Verifying...' : 'Connect Identity'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HandlePromptModal;