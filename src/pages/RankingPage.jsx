import React, { useState, useEffect } from 'react';
import { getRankings } from '../utils/rankingService';
import { getJobIconUrl } from '../contexts/UserContext';
import { ArrowLeft, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
    { id: 'omega_quiz', label: 'Omega Normal' },
    { id: 'omega_unlimited', label: 'Omega Unlimited' },
    { id: 'arrow_quiz', label: 'Cosmo Arrow' }
];

export default function RankingPage() {
    const [activeTab, setActiveTab] = useState('omega_quiz');
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const data = await getRankings(activeTab, 100);
            setRankings(data);
            setLoading(false);
        };
        fetch();
    }, [activeTab]);

    return (
        <div className="min-h-[calc(100vh-2rem)] text-slate-900 dark:text-white p-4 md:p-8 font-sans flex flex-col items-center custom-scrollbar overflow-y-auto w-full">
             <div className="w-full max-w-4xl relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="absolute left-0 top-2 md:top-3 z-10">
                     <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold transition-all border border-slate-200 dark:border-slate-700">
                        <ArrowLeft className="w-5 h-5"/> <span className="hidden sm:inline">Back</span>
                     </Link>
                </div>
                
                <div className="flex flex-col items-center mb-10 mt-14 md:mt-0">
                    <div className="flex items-center gap-3 mb-2">
                        <Trophy className="w-8 h-8 text-yellow-500" />
                        <h1 className="text-3xl md:text-5xl font-black text-center bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-yellow-600 dark:from-yellow-100 dark:to-yellow-500 drop-shadow-lg">
                             HALL OF FAME
                        </h1>
                        <Trophy className="w-8 h-8 text-yellow-500 scale-x-[-1]" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-bold tracking-widest text-xs md:text-sm uppercase opacity-70">Top 100 Commanders</p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center gap-2 mb-8 flex-wrap">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className={`px-6 py-3 rounded-xl font-bold transition-all border-2 ${activeTab === cat.id ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white scale-105 shadow-lg' : 'bg-white/30 dark:bg-slate-900/50 text-slate-600 dark:text-slate-500 border-transparent hover:bg-white/50 dark:hover:bg-slate-800'}`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="bg-white/60 dark:bg-slate-900/60 border border-white/20 dark:border-slate-700 rounded-3xl overflow-hidden backdrop-blur-md min-h-[500px] shadow-2xl">
                    <div className="grid grid-cols-12 gap-2 md:gap-4 p-4 border-b border-slate-200 dark:border-slate-800 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100/50 dark:bg-slate-950/30">
                        <div className="col-span-2 md:col-span-1 text-center">Rank</div>
                        <div className="col-span-2 md:col-span-1 text-center">Job</div>
                        <div className="col-span-4 md:col-span-6 pl-2">Nickname</div>
                        <div className="col-span-4 md:col-span-4 text-right pr-2">Score</div>
                    </div>
                    
                    {loading ? (
                         <div className="flex items-center justify-center h-[400px]">
                             <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                         </div>
                    ) : (
                        <div className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                            {rankings.length === 0 ? (
                                <div className="p-10 text-center text-slate-500">No records found. Be the legend!</div>
                            ) : rankings.map(r => (
                                <div key={r.id || r.rank} className="grid grid-cols-12 gap-2 md:gap-4 p-3 md:p-4 items-center hover:bg-slate-500/5 dark:hover:bg-white/5 transition-colors group">
                                     <div className="col-span-2 md:col-span-1 flex justify-center">
                                         {r.rank <= 3 ? (
                                             <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-lg shadow-lg ${r.rank === 1 ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 text-white' : r.rank === 2 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800' : 'bg-gradient-to-br from-amber-600 to-amber-800 text-white'}`}>
                                                 {r.rank}
                                             </div>
                                         ) : (
                                            <span className="text-slate-800 dark:text-slate-500 font-bold text-lg group-hover:text-slate-950 dark:group-hover:text-slate-400 transition-colors">#{r.rank}</span>
                                         )}
                                     </div>
                                     <div className="col-span-2 md:col-span-1 flex justify-center">
                                         <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-200 dark:bg-slate-800 p-1 border border-slate-300 dark:border-slate-700 shadow-inner">
                                            <img src={getJobIconUrl(r.job)} className="w-full h-full object-cover rounded-lg" onError={e=>e.target.style.display='none'}/>
                                         </div>
                                     </div>
                                     <div className="col-span-4 md:col-span-6 font-bold text-slate-900 dark:text-slate-300 text-sm md:text-lg truncate group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors pl-2">
                                         {r.nickname}
                                     </div>
                                     <div className="col-span-4 md:col-span-4 text-right font-mono font-bold text-lg md:text-xl text-blue-500 dark:text-blue-400 pr-2 whitespace-nowrap">
                                         {activeTab === 'omega_unlimited' 
                                            ? <span className="text-purple-500 dark:text-purple-400">Lv.{r.score}</span> 
                                            : activeTab === 'omega_quiz'
                                                ? <div className="flex flex-col items-end">
                                                    <span className="text-yellow-500 dark:text-yellow-400 text-base md:text-lg">{r.score} Streak</span>
                                                    <span className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-normal">Avg {r.subScore ? r.subScore : '0.00'}s</span>
                                                  </div>
                                                : <span>{(r.score/1000).toFixed(2)}<span className="text-sm text-slate-500 dark:text-slate-600 ml-1">s</span></span>
                                         }
                                     </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
             </div>
        </div>
    );
}
