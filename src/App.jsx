import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import QuizMode from './QuizMode';
import RankingPage from './pages/RankingPage';
import { UserProvider } from './contexts/UserContext';
import UserIdentity from './components/UserIdentity';

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
        <UserProvider>
            <HashRouter>
                <div className="relative h-full min-h-screen flex flex-col bg-slate-950 overflow-hidden text-white font-sans selection:bg-blue-500/30">
                    
                    {/* Floating Identity Widget - Top Left to avoid overlap with Game UI (Timer/Steps usually on Right) */}
                    <div className="absolute top-4 left-4 z-50">
                        <UserIdentity />
                    </div>

                    <Routes>
                        <Route path="/" element={<QuizMode />} />
                        <Route path="/ranking" element={<RankingPage />} />
                    </Routes>
                </div>
            </HashRouter>
        </UserProvider>
    );
}
