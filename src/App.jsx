import React, { useState } from 'react';
import GridDebugger from './GridDebugger';
import QuizMode from './QuizMode';

export default function App() {
    const [mode, setMode] = useState('debugger'); // debugger, quiz

    return (
        <div>
            {/* Top Navigation */}
            <div className="fixed top-0 left-0 w-full p-2 flex justify-center z-50 pointer-events-none">
                <div className="bg-slate-900/80 backdrop-blur rounded-full p-1 border border-slate-700 pointer-events-auto flex gap-1">
                    <button
                        onClick={() => setMode('debugger')}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${mode === 'debugger' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        Debugger
                    </button>
                    <button
                        onClick={() => setMode('quiz')}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${mode === 'quiz' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        Quiz
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="pt-12">
                {mode === 'debugger' ? <GridDebugger /> : <QuizMode />}
            </div>
        </div>
    );
}
