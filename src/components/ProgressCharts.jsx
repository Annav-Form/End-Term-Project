import React, { useState, useMemo } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useUserSubmissions } from '../hooks/useUserSubmissions';
import { useUserRating } from '../hooks/useUserRating';
import { BarChart2, Activity } from 'lucide-react';

const ProgressCharts = () => {
  const { cfHandle } = useAuthStore();
  const [timeframe, setTimeframe] = useState('month'); // 'week', 'month', 'year', 'max'
  
  const { data: submissions = [], isLoading: isLoadingSubmissions } = useUserSubmissions(cfHandle);
  const { data: ratings = [], isLoading: isLoadingRatings } = useUserRating(cfHandle);

  const now = useMemo(() => new Date(), []);

  // ----------------------------------------
  // Bar Chart Processing (Questions Solved)
  // ----------------------------------------
  const barData = useMemo(() => {
    let cutoff = new Date(0);
    let bucketKeyFormatter;
    let allKeys = [];
    
    if (timeframe === 'week') {
      cutoff = new Date(now.getTime() - 7 * 86400000);
      bucketKeyFormatter = (date) => date.toLocaleDateString(undefined, { weekday: 'short' });
      for (let i = 6; i >= 0; i--) {
        allKeys.push(bucketKeyFormatter(new Date(now.getTime() - i * 86400000)));
      }
    } else if (timeframe === 'month') {
      cutoff = new Date(now.getTime() - 30 * 86400000);
      bucketKeyFormatter = (date) => `${date.getMonth() + 1}/${date.getDate()}`;
      for (let i = 29; i >= 0; i--) {
        allKeys.push(bucketKeyFormatter(new Date(now.getTime() - i * 86400000)));
      }
    } else if (timeframe === 'year') {
      cutoff = new Date(now.getTime() - 365 * 86400000);
      bucketKeyFormatter = (date) => date.toLocaleDateString(undefined, { month: 'short' });
      for (let i = 11; i >= 0; i--) {
        allKeys.push(bucketKeyFormatter(new Date(now.getFullYear(), now.getMonth() - i, 1)));
      }
    } else {
      bucketKeyFormatter = (date) => date.getFullYear().toString();
      if (submissions.length > 0) {
        const earliest = new Date(Math.min(...submissions.map(s => s.creationTimeSeconds * 1000)));
        for (let y = earliest.getFullYear(); y <= now.getFullYear(); y++) {
          allKeys.push(y.toString());
        }
      }
    }

    const bucketMap = new Map();
    allKeys.forEach(k => bucketMap.set(k, { label: k, count: 0 }));

    submissions.forEach(sub => {
      const subDate = new Date(sub.creationTimeSeconds * 1000);
      if (subDate >= cutoff) {
        const key = bucketKeyFormatter(subDate);
        if (bucketMap.has(key)) {
          bucketMap.get(key).count += 1;
        } else if (timeframe === 'max') {
          // Fallback for max if year wasn't created initially
          bucketMap.set(key, { label: key, count: 1 });
        }
      }
    });

    return Array.from(bucketMap.values());
  }, [submissions, timeframe, now]);

  const maxBarValue = Math.max(...barData.map(d => d.count), 5); // Minimum 5 to avoid flat charts

  // ----------------------------------------
  // Line Chart Processing (Contests)
  // ----------------------------------------
  const lineData = useMemo(() => {
    let cutoffTime = 0;
    if (timeframe === 'week') cutoffTime = now.getTime() - 7 * 86400000;
    else if (timeframe === 'month') cutoffTime = now.getTime() - 30 * 86400000;
    else if (timeframe === 'year') cutoffTime = now.getTime() - 365 * 86400000;

    let filtered = ratings.filter(r => (r.ratingUpdateTimeSeconds * 1000) >= cutoffTime);
    
    // If no contests in this range, try to grab the last known rating to draw a flat line
    if (filtered.length === 0 && ratings.length > 0) {
      const lastKnown = ratings[ratings.length - 1]; // sorted by time usually
      filtered = [{ ...lastKnown, ratingUpdateTimeSeconds: cutoffTime / 1000 }, { ...lastKnown, ratingUpdateTimeSeconds: now.getTime() / 1000 }];
    }

    return filtered.map(r => ({
      xMs: r.ratingUpdateTimeSeconds * 1000,
      yVal: r.newRating,
      label: new Date(r.ratingUpdateTimeSeconds * 1000).toLocaleDateString(),
      name: r.contestName || 'Rating Baseline'
    }));
  }, [ratings, timeframe, now]);

  // SVG Math Utilities
  const drawLineChart = () => {
    if (lineData.length === 0) return null;

    const width = 800;
    const height = 240;
    const padding = 20;

    const minX = timeframe === 'max' ? Math.min(...lineData.map(d => d.xMs)) : 
                 (timeframe === 'week' ? now.getTime() - 7 * 86400000 :
                  timeframe === 'month' ? now.getTime() - 30 * 86400000 : 
                  now.getTime() - 365 * 86400000);
    const maxX = now.getTime();
    const rangeX = (maxX - minX) || 1;

    const paddingY = 100;
    const minY = Math.max(0, Math.min(...lineData.map(d => d.yVal)) - paddingY);
    const maxY = Math.max(...lineData.map(d => d.yVal)) + paddingY;
    const rangeY = (maxY - minY) || 1;

    const points = lineData.map(d => {
      const x = padding + ((d.xMs - minX) / rangeX) * (width - 2 * padding);
      const y = height - padding - ((d.yVal - minY) / rangeY) * (height - 2 * padding);
      return { x, y, ...d };
    });

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <div className="relative w-full h-[240px] overflow-hidden group">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
          {/* Grid lines */}
          <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1={padding} x2={width} y2={padding} stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1={height - padding} x2={width} y2={height - padding} stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
          
          <path d={pathData} fill="none" stroke="#06b6d4" strokeWidth="3" className="drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" strokeLinejoin="round" />
          
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" className="transition-transform hover:scale-150 duration-200 cursor-pointer" />
              <title>{`${p.label}: Rating ${p.yVal} (${p.name})`}</title>
            </g>
          ))}
        </svg>

        {/* Axis Labels */}
        <div className="absolute left-0 bottom-0 text-[10px] text-slate-500 font-mono">{new Date(minX).toLocaleDateString()}</div>
        <div className="absolute right-0 bottom-0 text-[10px] text-slate-500 font-mono">Today</div>
        <div className="absolute left-0 top-0 text-[10px] text-slate-500 font-mono">{maxY}</div>
        <div className="absolute left-0 top-[220px] text-[10px] text-slate-500 font-mono">{minY}</div>
      </div>
    );
  };

  if (isLoadingSubmissions || isLoadingRatings) {
    return <div className="h-64 flex items-center justify-center animate-pulse bg-slate-900 rounded-xl"></div>;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl w-full">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          Activity Overview
        </h2>
        
        <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-1">
          {['week', 'month', 'year', 'max'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                timeframe === tf 
                  ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.1)]' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Native Bar Chart */}
        <div className="flex flex-col bg-slate-950 p-4 border border-slate-800/50 rounded-xl relative">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-300">Questions Solved</h3>
          </div>
          
          <div className="flex-1 h-[240px] flex items-end justify-between gap-1 group">
             {barData.length === 0 ? (
               <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">No solving activity found for this timeframe.</div>
             ) : (
               barData.map((d, i) => (
                  <div key={i} className="flex flex-col items-center flex-1 h-full justify-end relative group/bar cursor-pointer">
                     <div 
                        className="w-full max-w-[40px] bg-gradient-to-t from-emerald-500/80 to-emerald-400 rounded-t-sm transition-all duration-300 ease-out hover:brightness-125"
                        style={{ height: `${(d.count / maxBarValue) * 100}%`, minHeight: d.count > 0 ? '4px' : '0px' }}
                     ></div>
                     
                     {/* Tooltip */}
                     {d.count > 0 && (
                       <div className="absolute -top-8 bg-slate-800 text-slate-200 text-xs py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none z-10 font-mono shadow-xl border border-slate-700 whitespace-nowrap">
                         {d.label}: {d.count}
                       </div>
                     )}
                     
                     {/* Dynamic X-Axis labeling for fewer bars, else hide or rotate */}
                     {barData.length <= 14 && (
                       <span className="text-[10px] text-slate-500 mt-2 rotate-45 sm:rotate-0 whitespace-nowrap truncate w-full text-center">{d.label}</span>
                     )}
                  </div>
               ))
             )}
          </div>
        </div>

        {/* Native Line Chart */}
        <div className="flex flex-col bg-slate-950 p-4 border border-slate-800/50 rounded-xl">
           <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-300">Contest Rating Trajectory</h3>
          </div>
          
          <div className="flex-1 w-full flex items-center justify-center relative">
            {lineData.length === 0 ? (
              <div className="text-slate-500 text-sm h-[240px] flex items-center">No contests in this timeframe.</div>
            ) : (
              drawLineChart()
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default ProgressCharts;
