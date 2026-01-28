import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import QuizMode from './QuizMode';
import RankingPage from './pages/RankingPage';
import { UserProvider } from './contexts/UserContext';
import { ThemeProvider } from './contexts/ThemeContext';
import UserIdentity from './components/UserIdentity';
import ThemeToggle from './components/ThemeToggle';

export default function App() {
    useEffect(() => {
        const handleContextMenu = (e) => e.preventDefault();
        const handleDragStart = (e) => e.preventDefault();

        // Prevent default browser actions for game feel
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('dragstart', handleDragStart);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('dragstart', handleDragStart);
        };
    }, []);

    return (
        <ThemeProvider>
            <UserProvider>
                <HashRouter>
                    <div className="relative h-full min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 transition-colors duration-500 overflow-hidden text-slate-900 dark:text-white font-sans selection:bg-blue-500/30">
                        
                        {/* Background Gradients */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10 pointer-events-none"></div>

                        {/* Floating Widgets Container */}
                        <div className="fixed bottom-4 right-4 md:top-4 md:bottom-auto md:right-4 md:left-4 md:w-[calc(100%-2rem)] flex flex-col-reverse md:flex-row-reverse md:justify-between items-end md:items-start gap-3 z-50 pointer-events-none">
                            {/* User Profile */}
                            <div className="pointer-events-auto">
                                <UserIdentity />
                            </div>
                            
                            {/* Theme Toggle */}
                            <div className="pointer-events-auto md:absolute md:left-0 md:top-0">
                                <ThemeToggle />
                            </div>
                        </div>

                        <Routes>
                            <Route path="/" element={<QuizMode />} />
                            <Route path="/omega-normal" element={<QuizMode initialMode="omega_quiz" />} />
                            <Route path="/omega-unlimited" element={<QuizMode initialMode="omega_unlimited" />} />
                            <Route path="/arrow-quiz" element={<QuizMode initialMode="arrow_quiz" />} />
                            <Route path="/ranking" element={<RankingPage />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </div>
                </HashRouter>
            </UserProvider>
        </ThemeProvider>
    );
}
