import React, { useState, useEffect } from 'react';
import OmegaField from './OmegaField';
import ArrowGrid from './ArrowGrid';
import { ARROW_PROBLEMS } from './data/quizData';
import { patterns } from './patterns';

export default function QuizMode() {
    const [subMode, setSubMode] = useState('menu'); // menu, omega_editor, arrow_quiz

    // Omega Editor State
    // Default center unit is Vertical
    const [omegaUnits, setOmegaUnits] = useState([{ position: 'center', type: 'Vertical' }]);
    const [savedProblems, setSavedProblems] = useState([]);

    const handleOmegaSlotClick = (slotId) => {
        setOmegaUnits(prev => {
            const existing = prev.find(u => u.position === slotId);

            // Center Logic: Toggle Vertical <-> Horizontal
            if (slotId === 'center') {
                const newType = existing?.type === 'Vertical' ? 'Horizontal' : 'Vertical';
                // Always update or add if missing (though should be there)
                const others = prev.filter(u => u.position !== 'center');
                return [...others, { position: 'center', type: newType }];
            }

            // Clone Logic (Diagonal slots)
            if (!existing) return [...prev, { position: slotId, type: 'F-Staff' }];
            if (existing.type === 'F-Staff') return prev.map(u => u.position === slotId ? { ...u, type: 'F-Legs' } : u);
            if (existing.type === 'F-Legs') return prev.map(u => u.position === slotId ? { ...u, type: 'M-Sword' } : u);
            if (existing.type === 'M-Sword') return prev.map(u => u.position === slotId ? { ...u, type: 'M-Shield' } : u);

            return prev.filter(u => u.position !== slotId);
        });
    };

    const [quizState, setQuizState] = useState({ state: 'idle', score: 0, total: 0 }); // idle, playing, feedback
    const [currentProblem, setCurrentProblem] = useState(null);
    const [timer, setTimer] = useState(3.0);

    // Helper to calculate answer based on units
    const calculateAns = (units) => {
        // Find center orientation
        const center = units.find(u => u.position === 'center');
        const isVertical = center?.type === 'Vertical';

        // Find F and M (simple logic for now based on user rules)
        // User rules:
        // F-Staff M-Sword -> Outside Letter
        // F-Staff M-Shield -> In front of Letter
        // F-Legs M-Sword -> F Side Inner
        // F-Legs M-Shield -> M Side Inner

        // We need to just check existence of types in the array
        const hasFStaff = units.some(u => u.type === 'F-Staff');
        const hasFLegs = units.some(u => u.type === 'F-Legs');
        const hasMSword = units.some(u => u.type === 'M-Sword');
        const hasMShield = units.some(u => u.type === 'M-Shield');

        if (hasFStaff && hasMSword) return "영어징 밖";
        if (hasFStaff && hasMShield) return "영어징 앞";
        if (hasFLegs && hasMSword) return "F쪽 파이널 오메가 안";
        if (hasFLegs && hasMShield) return "M쪽 파이널 오메가 안";
        return "Unknown";
    };

    const saveCurrentProblem = () => {
        if (omegaUnits.length === 0) return;
        const problem = {
            id: Date.now(),
            units: omegaUnits
        };
        setSavedProblems([...savedProblems, problem]);
        setOmegaUnits([]); // Reset
        alert('Problem Saved!');
    };

    const startOmegaQuiz = () => {
        if (savedProblems.length === 0) {
            alert("No saved problems! Please create some in Editor.");
            return;
        }
        setSubMode('omega_quiz');
        setQuizState({ state: 'playing', score: 0, total: 0 }); // Reset score on start
        nextOmegaQuestion();
    };

    const nextOmegaQuestion = () => {
        const randomProb = savedProblems[Math.floor(Math.random() * savedProblems.length)];
        setCurrentProblem({
            ...randomProb,
            correctAnswer: calculateAns(randomProb.units)
        });
        setQuizState(s => ({ ...s, state: 'playing', total: s.total + 1 }));
        setTimer(3.0);
    };

    // --- Arrow Quiz Logic ---
    const startArrowQuiz = () => {
        setSubMode('arrow_quiz');
        setQuizState({ state: 'playing', score: 0, total: 0 });
        nextArrowQuestion();
    };

    const mapLevelToIndices = (level) => {
        if (level < 0 || level > 9) return [];
        return [level, 9 - level];
    };

    const nextArrowQuestion = () => {
        const types = ['inner', 'outer'];
        const type = types[Math.floor(Math.random() * types.length)];
        const problems = ARROW_PROBLEMS[type];
        const frameIndex = problems[Math.floor(Math.random() * problems.length)];

        // Get Current Frame Data (Visual)
        const sequence = patterns[type];
        const currentData = sequence[frameIndex] || { levels: [] };
        const currentIndices = currentData.levels.flatMap(mapLevelToIndices);

        // Get Next Frame Data (Validation)
        const nextIndex = (frameIndex + 1) % sequence.length;
        const nextData = sequence[nextIndex] || { levels: [] };
        const nextIndices = nextData.levels.flatMap(mapLevelToIndices);

        setCurrentProblem({
            type,
            frameIndex,
            activeIndices: currentIndices,
            nextIndices: nextIndices
        });

        setQuizState(s => ({ ...s, state: 'playing', total: s.total + 1 }));
        setTimer(3.0);
    };

    const handleArrowAnswer = (r, c) => {
        if (quizState.state !== 'playing') return;

        // Validation: Is the clicked cell in the NEXT frame's AoE?
        // AoE logic: row is in nextIndices OR col is in nextIndices
        const isRowHit = currentProblem.nextIndices.includes(r);
        const isColHit = currentProblem.nextIndices.includes(c);
        const isHit = isRowHit || isColHit; // If hit, it's NOT safe -> Wrong Answer

        if (isHit) {
            setQuizState(s => ({ ...s, state: 'feedback', message: 'BOOM! You died!' }));
        } else {
            setQuizState(s => ({ ...s, state: 'feedback', message: 'CORRECT! Safe!', score: s.score + 1 }));
        }
    };

    // Timer effect
    useEffect(() => {
        let interval;
        if ((subMode === 'omega_quiz' || subMode === 'arrow_quiz') && quizState.state === 'playing') {
            interval = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 0.1) {
                        setQuizState(s => ({ ...s, state: 'feedback', message: 'Time Over!' }));
                        return 0;
                    }
                    return prev - 0.1;
                });
            }, 100);
        }
        return () => clearInterval(interval);
    }, [subMode, quizState.state]);

    // --- End Arrow Logic ---

    const handleAnswer = (ans) => {
        if (quizState.state !== 'playing') return;

        const isCorrect = ans === currentProblem.correctAnswer;
        const msg = isCorrect ? 'CORRECT!' : `WRONG! Ans: ${currentProblem.correctAnswer}`;
        setQuizState(s => ({ ...s, state: 'feedback', message: msg, score: s.score + (isCorrect ? 1 : 0) }));
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-slate-950 text-white p-4 font-sans">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-8">
                Raid Quiz Training
            </h1>

            {subMode === 'menu' && (
                <div className="flex gap-4">
                    <button onClick={() => setSubMode('omega_editor')} className="px-6 py-3 bg-purple-600 rounded-lg font-bold hover:bg-purple-500 transition">
                        Omega Editor
                    </button>
                    <button onClick={startOmegaQuiz} className="px-6 py-3 bg-red-600 rounded-lg font-bold hover:bg-red-500 transition">
                        Omega Quiz ({savedProblems.length})
                    </button>
                    <button onClick={() => setSubMode('arrow_quiz')} className="px-6 py-3 bg-blue-600 rounded-lg font-bold hover:bg-blue-500 transition">
                        Arrow Quiz (WIP)
                    </button>
                </div>
            )}

            {subMode === 'omega_editor' && (
                <div className="flex flex-col items-center">
                    <h2 className="text-xl text-slate-400 mb-4">Click slots to cycle: F-Staff / F-Legs / M-Sword / M-Shield / Empty</h2>
                    <OmegaField placedUnits={omegaUnits} onSlotClick={handleOmegaSlotClick} />
                    <div className="flex gap-4 mt-8">
                        <button onClick={saveCurrentProblem} className="px-6 py-2 bg-green-600 rounded hover:bg-green-500 font-bold">
                            Save Problem
                        </button>
                        <button onClick={() => setSubMode('menu')} className="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600">
                            Back to Menu
                        </button>
                    </div>
                    <div className="mt-4 text-slate-500 text-sm">
                        Saved Problems: {savedProblems.length}
                    </div>
                </div>
            )}

            {subMode === 'omega_quiz' && currentProblem && (
                <div className="flex flex-col items-center w-full max-w-2xl">
                    <div className="flex justify-between w-full mb-4 px-8">
                        <div className={`text-3xl font-black ${timer < 1.0 ? 'text-red-500' : 'text-yellow-400'}`}>{timer.toFixed(1)}s</div>
                        <div className="text-xl font-bold">Score: {quizState.score} / {quizState.total}</div>
                    </div>

                    <div className="pointer-events-none mb-8">
                        <OmegaField placedUnits={currentProblem.units} />
                    </div>

                    {quizState.state === 'playing' ? (
                        <div className="grid grid-cols-2 gap-4 w-full">
                            {["영어징 밖", "영어징 앞", "F쪽 파이널 오메가 안", "M쪽 파이널 오메가 안"].map(ans => (
                                <button key={ans} onClick={() => handleAnswer(ans)}
                                    className="p-6 bg-slate-800 rounded-xl border-2 border-slate-600 hover:bg-slate-700 hover:border-blue-500 transition text-xl font-bold active:scale-95">
                                    {ans}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center animate-in fade-in zoom-in duration-300 w-full">
                            <div className={`text-5xl font-black mb-6 ${quizState.message.includes('CORRECT') ? 'text-green-500' : 'text-red-500'}`}>
                                {quizState.message}
                            </div>
                            <button onClick={nextOmegaQuestion} className="w-full py-4 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 text-2xl shadow-lg hover:translate-y-[-2px] transition">
                                Next Problem
                            </button>
                        </div>
                    )}

                    <button onClick={() => setSubMode('menu')} className="mt-12 text-slate-500 hover:text-white underline">
                        Quit to Menu
                    </button>
                </div>
            )}
            {subMode === 'arrow_quiz' && (
                <div className="flex flex-col items-center w-full max-w-2xl">
                    {currentProblem ? (
                        <>
                            <div className="flex justify-between w-full mb-4 px-8">
                                <div className={`text-3xl font-black ${timer < 1.0 ? 'text-red-500' : 'text-yellow-400'}`}>{timer.toFixed(1)}s</div>
                                <div className="text-xl font-bold">Score: {quizState.score} / {quizState.total}</div>
                            </div>

                            <div className="mb-4 text-xl font-bold text-blue-300">
                                Avoid the NEXT impact! (Current: {currentProblem.type.toUpperCase()})
                            </div>

                            <ArrowGrid
                                activeIndices={currentProblem.activeIndices}
                                isInteractive={quizState.state === 'playing'}
                                onCellClick={(r, c) => handleArrowAnswer(r, c)}
                            />

                            {quizState.state !== 'playing' && (
                                <div className="text-center animate-in fade-in zoom-in duration-300 mt-6 w-full">
                                    <div className={`text-5xl font-black mb-6 ${quizState.message.includes('CORRECT') ? 'text-green-500' : 'text-red-500'}`}>
                                        {quizState.message}
                                    </div>
                                    <button onClick={nextArrowQuestion} className="w-full py-4 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 text-2xl shadow-lg hover:translate-y-[-2px] transition mb-4">
                                        Next Pattern
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center">
                            <p className="mb-8 text-xl text-slate-300">Click start to begin continuous random patterns.</p>
                            <button onClick={startArrowQuiz} className="px-8 py-4 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 text-2xl shadow-lg hover:translate-y-[-2px] transition mb-8">
                                Start Arrow Quiz
                            </button>
                        </div>
                    )}

                    <button onClick={() => setSubMode('menu')} className="mt-8 text-slate-500 hover:text-white underline">
                        Back to Menu
                    </button>
                </div>
            )}
        </div>
    );
}
