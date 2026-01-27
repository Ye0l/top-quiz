import React, { useEffect } from 'react';
import QuizMode from './QuizMode';

export default function App() {
    useEffect(() => {
        const handleContextMenu = (e) => e.preventDefault();
        const handleDragStart = (e) => e.preventDefault();

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('dragstart', handleDragStart);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('dragstart', handleDragStart);
        };
    }, []);

    return (
        <div className="relative h-full flex flex-col bg-slate-950 overflow-hidden">
            {/* Content */}
            <div className="flex-1 overflow-y-auto px-1 scroll-smooth">
                <QuizMode />
            </div>
        </div>
    );
}
