import React, { useMemo, useState } from 'react';
import { useProblems } from '../hooks/useProblems';
import { useFilterStore } from '../store/useFilterStore';
import { useAuthStore } from '../store/useAuthStore';
import { useUserStatus } from '../hooks/useUserStatus';
import { CheckCircle2, Star, ExternalLink } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const ITEMS_PER_PAGE = 50;

const ProblemTable = ({ onlyBookmarked = false }) => {
  const { data: problems = [], isLoading, isError, error } = useProblems();
  const { searchQuery, selectedTags, ratingRange, sortBy, sortOrder } = useFilterStore();
  const { user, cfHandle, bookmarks, toggleLocalBookmark } = useAuthStore();
  const { data: solvedSet = new Set() } = useUserStatus(cfHandle);
  const [currentPage, setCurrentPage] = useState(1);

  const handleToggleBookmark = async (problemKey) => {
    if (!user) {
      alert("Please sign in to bookmark problems!");
      return;
    }

    const isCurrentlyBookmarked = bookmarks.includes(problemKey);
    toggleLocalBookmark(problemKey);

    try {
      const docRef = doc(db, 'users', user.uid);
      if (isCurrentlyBookmarked) {
        await updateDoc(docRef, { bookmarks: arrayRemove(problemKey) });
      } else {
        await updateDoc(docRef, { bookmarks: arrayUnion(problemKey) });
      }
    } catch (error) {
      console.error("Failed to update bookmark:", error);
      toggleLocalBookmark(problemKey);
    }
  };

  const filteredAndSortedProblems = useMemo(() => {
    let result = problems.filter(prob => {
      if (onlyBookmarked && !bookmarks.includes(`${prob.contestId}-${prob.index}`)) return false;
      if (searchQuery && !prob.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      const r = prob.rating || 0;
      const minR = ratingRange[0] === '' ? 0 : Number(ratingRange[0]);
      const maxR = ratingRange[1] === '' ? 4000 : Number(ratingRange[1]);
      if (r < minR || r > maxR) return false;
      
      if (selectedTags.length > 0) {
        const hasAllTags = selectedTags.every(tag => prob.tags.includes(tag));
        if (!hasAllTags) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      let valA = sortBy === 'rating' ? (a.rating || 0) : sortBy === 'solvedCount' ? a.solvedCount : a.name.toLowerCase();
      let valB = sortBy === 'rating' ? (b.rating || 0) : sortBy === 'solvedCount' ? b.solvedCount : b.name.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [problems, searchQuery, selectedTags, ratingRange, sortBy, sortOrder, onlyBookmarked, bookmarks]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTags, ratingRange, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedProblems.length / ITEMS_PER_PAGE) || 1;
  const currentProblems = filteredAndSortedProblems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
      </div>
    );
  }

  if (isError) {
    return <div className="text-rose-400 p-6 font-medium bg-rose-950/50 border border-rose-900/50 rounded-2xl">Error loading problems: {error.message}</div>;
  }

  return (
    <div className="flex-1 flex flex-col w-full">
      {/* Grid Header */}
      <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-2">
        <div className="col-span-1 text-center">Save</div>
        <div className="col-span-5">Problem Context</div>
        <div className="col-span-2">Difficulty</div>
        <div className="col-span-3">Categories</div>
        <div className="col-span-1 text-right">Solves</div>
      </div>

      {/* Grid Body */}
      <div className="flex flex-col gap-3">
        {currentProblems.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 font-medium bg-zinc-900/30 rounded-3xl border border-white/5">
            No problems match your current filter parameters.
          </div>
        ) : (
          currentProblems.map(prob => {
            const problemUrl = `https://codeforces.com/problemset/problem/${prob.contestId}/${prob.index}`;
            const problemKey = `${prob.contestId}-${prob.index}`;
            const isSolved = solvedSet.has(problemKey);
            const isBookmarked = bookmarks.includes(problemKey);

            return (
              <div 
                key={problemKey} 
                className={`group grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-zinc-900/40 hover:bg-zinc-800/80 border ${isSolved ? 'border-violet-500/40 bg-violet-900/10' : 'border-white/5'} rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-black/50`}
              >
                {/* Bookmark Toggle */}
                <div className="col-span-1 flex lg:justify-center items-center">
                  <button 
                    onClick={() => handleToggleBookmark(problemKey)}
                    className="p-2 rounded-xl hover:bg-white/10 transition-colors focus:outline-none"
                  >
                    <Star className={`w-5 h-5 transition-all duration-300 ${isBookmarked ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]' : 'text-zinc-600 hover:text-amber-400/70'}`} />
                  </button>
                </div>

                {/* Problem Name & Link */}
                <div className="col-span-5 flex items-center gap-3">
                  {isSolved && <CheckCircle2 className="w-5 h-5 text-violet-400 shrink-0" />}
                  <div className="flex flex-col">
                    <span className="text-xs font-mono text-zinc-500 mb-0.5">{prob.contestId}{prob.index}</span>
                    <a 
                      href={problemUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className={`font-semibold text-[15px] flex items-center gap-2 transition-colors ${isSolved ? 'text-white' : 'text-zinc-200 hover:text-white'}`}
                    >
                      {prob.name}
                      <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500" />
                    </a>
                  </div>
                </div>

                {/* Rating Pill */}
                <div className="col-span-2">
                  <span className={`px-3 py-1.5 inline-flex text-xs font-bold rounded-full ${
                    (prob.rating >= 2400) ? 'bg-rose-500/10 text-rose-400' :
                    (prob.rating >= 1900) ? 'bg-fuchsia-500/10 text-fuchsia-400' :
                    (prob.rating >= 1600) ? 'bg-blue-500/10 text-blue-400' :
                    (prob.rating >= 1400) ? 'bg-emerald-500/10 text-emerald-400' :
                    (prob.rating > 0) ? 'bg-zinc-700/50 text-zinc-300' :
                    'bg-zinc-800 text-zinc-500'
                  }`}>
                    {prob.rating || 'UNRATED'}
                  </span>
                </div>

                {/* Tags */}
                <div className="col-span-3 flex flex-wrap gap-2">
                  {prob.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-md text-[10px] uppercase font-bold bg-black/40 text-zinc-400 tracking-wider">
                      {tag}
                    </span>
                  ))}
                  {prob.tags.length > 2 && (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-black/40 text-zinc-600">
                      +{prob.tags.length - 2}
                    </span>
                  )}
                </div>

                {/* Solves */}
                <div className="col-span-1 lg:text-right text-sm text-zinc-500 font-mono font-medium">
                  {prob.solvedCount >= 1000 ? `${(prob.solvedCount / 1000).toFixed(1)}k` : prob.solvedCount}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modern Pagination */}
      {filteredAndSortedProblems.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-zinc-900/50 backdrop-blur-md border border-white/5 px-6 py-4 mt-8 rounded-2xl">
          <p className="text-sm text-zinc-500 font-medium mb-4 sm:mb-0">
            Showing <span className="text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-white">{Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedProblems.length)}</span> of <span className="text-white">{filteredAndSortedProblems.length}</span>
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-5 py-2 rounded-xl bg-zinc-800 text-sm font-bold text-zinc-300 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 transition-all active:scale-95"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-5 py-2 rounded-xl bg-white text-sm font-bold text-black hover:bg-zinc-200 disabled:opacity-30 disabled:hover:bg-white transition-all active:scale-95"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemTable;