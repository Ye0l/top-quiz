import React, { useState } from 'react';
import { useUser, getJobIconUrl, generateNickname } from '../contexts/UserContext';
import { Settings, X, Dices } from 'lucide-react';

export default function UserIdentity({ className }) {
    const { userProfile, updateProfile, jobs } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [tempName, setTempName] = useState('');
    const [tempJob, setTempJob] = useState('');

    const handleSave = () => {
        if (!tempName.trim()) return;
        updateProfile({ nickname: tempName, job: tempJob });
        setIsOpen(false);
    };

    const handleOpen = () => {
        setTempName(userProfile.nickname);
        setTempJob(userProfile.job);
        setIsOpen(true);
    };

    const handleJobSelect = (job) => {
        setTempJob(job);
        // Auto-reroll nickname when job changes
        setTempName(generateNickname(job));
    };

    const handleReroll = () => {
        setTempName(generateNickname(tempJob));
    };

    return (
        <>
            {/* Widget */}
            <button 
                onClick={handleOpen}
                className={`flex items-center gap-3 p-2 sm:px-4 sm:py-2 bg-white/20 dark:bg-slate-900/80 hover:bg-white/40 dark:hover:bg-slate-800 border border-white/30 dark:border-slate-700/50 hover:border-slate-400 rounded-full transition-all group backdrop-blur-md shadow-lg ${className}`}
                title="Click to edit profile"
            >
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0 overflow-hidden border border-slate-300 dark:border-slate-600 flex items-center justify-center relative">
                    <img 
                        src={getJobIconUrl(userProfile.job)} 
                        alt={userProfile.job} 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }} 
                    />
                </div>
                <div className="hidden sm:flex flex-col items-start">
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">{userProfile.job}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-white max-w-[150px] truncate leading-none pb-0.5">{userProfile.nickname}</span>
                </div>
                <Settings className="w-4 h-4 text-slate-500 group-hover:text-slate-800 dark:group-hover:text-white transition-colors ml-1 hidden sm:block" />
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white/95 dark:bg-slate-900/95 p-6 rounded-2xl border border-white/20 dark:border-slate-700 w-full max-w-md shadow-2xl relative overflow-hidden backdrop-blur-md">
                        {/* Background Deco */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Settings className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                                Edit Profile
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <X className="text-slate-500 hover:text-slate-900 dark:hover:text-white w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="space-y-5 relative z-10">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Nickname</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input 
                                            value={tempName} 
                                            onChange={(e) => setTempName(e.target.value)}
                                            maxLength={16}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                            placeholder="Enter nickname..."
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">{tempName.length}/16</div>
                                    </div>
                                    <button 
                                        onClick={handleReroll}
                                        className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group"
                                        title="Reroll Nickname"
                                    >
                                        <Dices className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Job Archetype</label>
                                <div className="grid grid-cols-5 gap-2 max-h-[220px] overflow-y-auto p-2 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-700 custom-scrollbar">
                                    {jobs.map(job => (
                                        <button 
                                            key={job}
                                            onClick={() => handleJobSelect(job)}
                                            className={`p-2 rounded-lg border transition-all flex flex-col items-center justify-center gap-1 ${tempJob === job ? 'bg-blue-100 dark:bg-blue-600/20 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/50 dark:border-slate-800/50'}`}
                                        >
                                            <div className="w-8 h-8 relative flex items-center justify-center">
                                                <img 
                                                    src={getJobIconUrl(job)} 
                                                    alt={job} 
                                                    className="w-full h-full object-contain drop-shadow"
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-500">{job}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button onClick={() => setIsOpen(false)} className="flex-1 py-3 font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Cancel</button>
                                <button onClick={handleSave} className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all transform active:scale-95">Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
