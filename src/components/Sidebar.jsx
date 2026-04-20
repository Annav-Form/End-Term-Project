import React from 'react';
import { useFilterStore } from '../store/useFilterStore';
import { Search, X } from 'lucide-react';

const COMMON_TAGS = [
  'implementation', 'math', 'greedy', 'dp', 'data structures',
  'brute force', 'constructive algorithms', 'graphs', 'sortings',
  'binary search', 'dfs and similar', 'trees', 'strings',
  'number theory', 'combinatorics', 'geometry'
];

const Sidebar = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedTags,
    toggleTag,
    ratingRange,
    setRatingRange,
    resetFilters
  } = useFilterStore();

  const handleMinRatingChange = (e) => {
    const val = e.target.value === '' ? '' : Number(e.target.value);
    setRatingRange([val, ratingRange[1]]);
  };

  const handleMaxRatingChange = (e) => {
    const val = e.target.value === '' ? '' : Number(e.target.value);
    setRatingRange([ratingRange[0], val]);
  };

  return (
    <div className="w-full md:w-72 bg-slate-900 rounded-xl shadow-lg border border-slate-800 p-5 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          Filters
        </h2>
        <button 
          onClick={resetFilters}
          className="text-xs text-cyan-500 hover:text-cyan-400 font-medium tracking-wide uppercase transition-colors"
        >
          Reset All
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Search</label>
        <div className="relative">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g. Watermelon"
            className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-sm text-slate-200 placeholder-slate-600 transition-all"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3"
            >
              <X className="h-4 w-4 text-slate-500 hover:text-slate-300 transition-colors" />
            </button>
          )}
        </div>
      </div>

      {/* Rating Range */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Rating Range</label>
        <div className="flex items-center gap-3">
          <div className="relative w-full">
            <span className="absolute left-3 top-2.5 text-xs font-semibold text-slate-600">MIN</span>
            <input 
              type="number"
              value={ratingRange[0]}
              onChange={handleMinRatingChange}
              className="w-full pl-10 pr-2 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-sm text-slate-200 font-mono"
            />
          </div>
          <span className="text-slate-600">-</span>
          <div className="relative w-full">
            <span className="absolute left-3 top-2.5 text-xs font-semibold text-slate-600">MAX</span>
            <input 
              type="number"
              value={ratingRange[1]}
              onChange={handleMaxRatingChange}
              className="w-full pl-10 pr-2 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-sm text-slate-200 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Common Tags</label>
        <div className="flex flex-wrap gap-2">
          {COMMON_TAGS.map(tag => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  isSelected 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.1)]' 
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default Sidebar;
