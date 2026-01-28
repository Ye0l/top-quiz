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
        <div className="bg-slate-900/80 rounded-2xl border border-slate-700/50 p-4 w-full h-full overflow-hidden flex flex-col backdrop-blur-sm shadow-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 pb-2 border-b border-white/5">
                <Trophy className="w-3 h-3 text-yellow-500" />
                Top 10 - {category === 'omega_unlimited' ? 'Unlimited' : category === 'omega_quiz' ? 'Normal' : 'Arrow'}
            </h3>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-[200px]">
                {loading ? (
                    <div className="text-center text-slate-500 text-xs py-8 animate-pulse">Fetching Data...</div>
                ) : rankings.length === 0 ? (
                    <div className="text-center text-slate-500 text-xs py-8 flex flex-col gap-1">
                        <span>No records yet.</span>
                        <span className="text-slate-600">Be the first to conquer!</span>
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        {rankings.map((r, i) => (
                            <div key={r.id || i} className="flex items-center gap-2 p-1.5 rounded-lg bg-black/20 hover:bg-white/5 transition-colors group">
                                <div className={`w-5 text-center text-xs font-black ${i < 3 ? 'text-yellow-400 drop-shadow-sm' : 'text-slate-600'}`}>
                                    {i + 1}
                                </div>
                                <div className="w-6 h-6 rounded bg-slate-800 shrink-0 overflow-hidden relative border border-slate-600/50">
                                    <img 
                                        src={getJobIconUrl(r.job)} 
                                        onError={(e) => e.target.style.display='none'} 
                                        className="w-full h-full object-cover" 
                                    />
                                </div>
                                <span className="text-xs font-bold text-slate-300 truncate flex-1 group-hover:text-white transition-colors">{r.nickname}</span>
                                <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                                    {category === 'omega_unlimited' 
                                        ? `Lv.${r.score}`
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
