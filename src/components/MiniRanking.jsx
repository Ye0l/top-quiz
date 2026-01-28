import React, { useEffect, useState } from 'react';
import { getRankings } from '../utils/rankingService';
import { getJobIconUrl } from '../contexts/UserContext';
import { Crown, Trophy } from 'lucide-react';

export default function MiniRanking({ category, refreshTrigger }) {
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!category) return;
        
        const fetchRankings = async () => {
            setLoading(true);
            const data = await getRankings(category, 10);
            setRankings(data);
            setLoading(false);
        };

        fetchRankings();
    }, [category, refreshTrigger]);

    if (!category) return null;

    return (
        <div className="bg-white/60 dark:bg-slate-900/80 rounded-2xl border border-white/20 dark:border-slate-700/50 p-4 w-full h-full overflow-hidden flex flex-col backdrop-blur-md shadow-xl">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-white/5">
                <Trophy className="w-3 h-3 text-yellow-500" />
                Top 10 - {category === 'omega_unlimited' ? 'Unlimited' : category === 'omega_quiz' ? 'Normal' : 'Arrow'}
            </h3>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-[200px]">
                {loading ? (
                    <div className="text-center text-slate-500 text-xs py-8 animate-pulse">Fetching Data...</div>
                ) : rankings.length === 0 ? (
                    <div className="text-center text-slate-500 text-xs py-8 flex flex-col gap-1">
                        <span>No records yet.</span>
                        <span className="text-slate-600 dark:text-slate-400">Be the first to conquer!</span>
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        {rankings.map((r, i) => (
                            <div key={r.id || i} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50/50 dark:bg-black/20 hover:bg-white/50 dark:hover:bg-white/5 transition-colors group">
                                <div className={`w-5 text-center text-xs font-black ${i < 3 ? 'text-yellow-600 dark:text-yellow-400 drop-shadow-sm' : 'text-slate-500 dark:text-slate-500'}`}>
                                    {i + 1}
                                </div>
                                <div className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-800 shrink-0 overflow-hidden relative border border-slate-300 dark:border-slate-600/50">
                                    <img 
                                        src={getJobIconUrl(r.job)} 
                                        onError={(e) => e.target.style.display='none'} 
                                        className="w-full h-full object-cover" 
                                    />
                                </div>
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-300 truncate flex-1 group-hover:text-blue-600 dark:group-hover:text-white transition-colors">{r.nickname}</span>
                                <span className="text-xs font-mono font-bold text-blue-500 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-500/10 px-1.5 py-0.5 rounded">
                                    {category === 'omega_unlimited' 
                                        ? `Lv.${r.score}`
                                        : category === 'omega_quiz'
                                            ? <div className="flex flex-col items-end leading-none">
                                                 <span className="text-slate-900 dark:text-white text-[10px]">{r.score} Streak</span>
                                                 <span className="text-[8px] text-slate-600 dark:text-slate-400">Avg {r.subScore ? r.subScore : '0.00'}s</span>
                                              </div>
                                            : `${(r.score / 1000).toFixed(2)}s`
                                    }
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
