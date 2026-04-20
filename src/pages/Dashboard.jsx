import React, { useMemo } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useUserStatus } from '../hooks/useUserStatus';
import { useProblems } from '../hooks/useProblems';
import { Lock, Code, Target, CheckCircle, BarChart3 } from 'lucide-react';
import ProgressCharts from '../components/ProgressCharts';

const Dashboard = () => {
  const { user, cfHandle } = useAuthStore();
  const { data: problems = [] } = useProblems();
  const { data: solvedSet = new Set(), isLoading } = useUserStatus(cfHandle);

  const analytics = useMemo(() => {
    if (solvedSet.size === 0 || problems.length === 0) return null;

    const solvedProblems = problems.filter(prob => 
      solvedSet.has(`${prob.contestId}-${prob.index}`)
    );

    let totalRating = 0;
    let ratedCount = 0;
    const tagFreq = {};

    solvedProblems.forEach(prob => {
      // Calculate ratings
      if (prob.rating) {
        totalRating += prob.rating;
        ratedCount++;
      }

      // Calculate tags
      prob.tags.forEach(tag => {
        tagFreq[tag] = (tagFreq[tag] || 0) + 1;
      });
    });

    const averageRating = ratedCount > 0 ? Math.round(totalRating / ratedCount) : 0;
    
    // Convert to sorted array
    const sortedTags = Object.entries(tagFreq)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 tags

    return {
      totalSolved: solvedSet.size,
      averageRating,
      ratedCount,
      sortedTags,
    };
  }, [solvedSet, problems]);

  if (!user || !cfHandle) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-slate-700">
            <Lock className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-3">Analytics Locked</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            You must be signed in and link your Codeforces handle to view your personal insights and progress.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-slate-900/50 p-8 rounded-xl shadow-lg border border-slate-800/80 backdrop-blur-sm text-center py-20">
        <Target className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-200 mb-2">No Solved Problems Found</h2>
        <p className="text-slate-400">Time to start solving on Codeforces!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-100 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-500">
          Analytics Dashboard
        </h1>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex gap-4 items-center">
            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Solved</p>
              <h3 className="text-3xl font-black text-slate-100">{analytics.totalSolved}</h3>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
          <div className="flex gap-4 items-center">
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <BarChart3 className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Average Rating</p>
              <h3 className="text-3xl font-black text-slate-100">{analytics.averageRating}</h3>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all"></div>
          <div className="flex gap-4 items-center">
            <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
              <Code className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Rated Problems</p>
              <h3 className="text-3xl font-black text-slate-100">{analytics.ratedCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Progress Charts */}
      <ProgressCharts />

      {/* Tags Analytics Chart/Meters */}
      <div className="bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl">
        <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
          Mastery by Tag
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {analytics.sortedTags.map((t, idx) => {
            const maxPercent = (t.count / analytics.sortedTags[0].count) * 100;
            return (
              <div key={t.tag} className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-300 uppercase tracking-wide text-xs">{t.tag}</span>
                  <span className="text-slate-400 font-mono">{t.count} solved</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2.5 shadow-inner overflow-hidden border border-slate-800">
                  <div 
                    className={`h-2.5 rounded-full bg-gradient-to-r ${
                      idx === 0 ? 'from-cyan-400 to-blue-500' :
                      idx === 1 ? 'from-indigo-400 to-purple-500' :
                      idx === 2 ? 'from-fuchsia-400 to-pink-500' :
                      'from-slate-600 to-slate-400'
                    }`} 
                    style={{ width: `${maxPercent}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
