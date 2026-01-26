import React, { useState, useEffect } from 'react';
import OmegaField from './OmegaField';
import ArrowGrid from './ArrowGrid';
import { ARROW_PROBLEMS } from './data/quizData';
import { patterns } from './patterns';
import { generateOmegaProblem } from './omegaLogic';

export default function QuizMode() {
    const [subMode, setSubMode] = useState('menu'); // menu, omega_editor, arrow_quiz

    // Omega Editor State (Optional Custom Mode)
    const [omegaUnits, setOmegaUnits] = useState([{ position: 'center', type: 'Vertical' }]);
    const [savedProblems, setSavedProblems] = useState([]);
    const [editorStep, setEditorStep] = useState('units');
    const [editorAnswer, setEditorAnswer] = useState(null);

    const handleOmegaSlotClick = (slotId) => {
        if (editorStep !== 'units') return;
        setOmegaUnits(prev => {
            const existing = prev.find(u => u.position === slotId);
            if (slotId === 'center') {
                const newType = existing?.type === 'Vertical' ? 'Horizontal' : 'Vertical';
                const others = prev.filter(u => u.position !== 'center');
                return [...others, { position: 'center', type: newType }];
            }
            if (!existing) return [...prev, { position: slotId, type: 'F-Staff' }];
            if (existing.type === 'F-Staff') return prev.map(u => u.position === slotId ? { ...u, type: 'F-Legs' } : u);
            if (existing.type === 'F-Legs') return prev.map(u => u.position === slotId ? { ...u, type: 'M-Sword' } : u);
            if (existing.type === 'M-Sword') return prev.map(u => u.position === slotId ? { ...u, type: 'M-Shield' } : u);
            return prev.filter(u => u.position !== slotId);
        });
    };

    const handleEditorAnswerClick = (spotId) => {
        setEditorAnswer(spotId);
    };

    const saveCurrentProblem = () => {
        if (editorStep === 'units') {
            if (omegaUnits.length === 0) { alert("Place some units!"); return; }
            setEditorStep('answer');
            return;
        }
        if (!editorAnswer) { alert("Select answer!"); return; }
        const problem = {
            id: Date.now(),
            units: omegaUnits,
            correctSpots: [editorAnswer]
        };
        setSavedProblems([...savedProblems, problem]);
        setOmegaUnits([{ position: 'center', type: 'Vertical' }]);
        setEditorAnswer(null);
        setEditorStep('units');
        alert('Saved!');
    };

    // Quiz State
    const [quizState, setQuizState] = useState({ state: 'idle', score: 0, total: 0 });
    const [currentProblem, setCurrentProblem] = useState(null);
    const [timer, setTimer] = useState(3.0);
    const [userAnswerSpot, setUserAnswerSpot] = useState(null);

    const startOmegaQuiz = () => {
        // Direct Logic Generation - No check for saved problems
        setSubMode('omega_quiz');
        setQuizState({ state: 'playing', score: 0, total: 0 });
        nextOmegaQuestion();
    };

    const nextOmegaQuestion = () => {
        const newProb = generateOmegaProblem();
        setCurrentProblem(newProb);
        setUserAnswerSpot(null);
        setQuizState(s => ({ ...s, state: 'playing', total: s.total + 1 }));
        setTimer(3.0);
    };

    const handleOmegaQuizAnswer = (spotId) => {
        if (quizState.state !== 'playing') return;

        setUserAnswerSpot(spotId);
        // Logic problems have correctSpots array
        const isCorrect = currentProblem.correctSpots && currentProblem.correctSpots.includes(spotId);
        const msg = isCorrect ? 'CORRECT!' : 'WRONG!';

        setQuizState(s => ({ ...s, state: 'feedback', message: msg, score: s.score + (isCorrect ? 1 : 0) }));
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

        const sequence = patterns[type];
        const currentData = sequence[frameIndex] || { levels: [] };
        const currentIndices = currentData.levels.flatMap(mapLevelToIndices);

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
        const isRowHit = currentProblem.nextIndices.includes(r);
        const isColHit = currentProblem.nextIndices.includes(c);
        const isHit = isRowHit || isColHit;
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

    return (
        <div className="flex flex-col items-center min-h-screen bg-slate-950 text-white p-4 font-sans">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-8">
                Raid Quiz Training
            </h1>

            {subMode === 'menu' && (
                <div className="flex gap-4">
                    <button onClick={() => setSubMode('omega_editor')} className="px-6 py-3 bg-purple-600 rounded-lg font-bold hover:bg-purple-500 transition">
                        Omega Editor (Legacy)
                    </button>
                    <button onClick={startOmegaQuiz} className="px-6 py-3 bg-red-600 rounded-lg font-bold hover:bg-red-500 transition">
                        Omega Quiz (Auto)
                    </button>
                    <button onClick={() => setSubMode('arrow_quiz')} className="px-6 py-3 bg-blue-600 rounded-lg font-bold hover:bg-blue-500 transition">
                        Arrow Quiz (WIP)
                    </button>
                </div>
            )}

            {subMode === 'omega_editor' && (
                <div className="flex flex-col items-center">
                    <h2 className="text-xl text-slate-400 mb-4">
                        {editorStep === 'units' ? "Step 1: Place Units" : "Step 2: Select Answer"}
                    </h2>
                    <OmegaField
                        placedUnits={omegaUnits}
                        onSlotClick={handleOmegaSlotClick}
                        showAnswerSpots={editorStep === 'answer'}
                        onAnswerSpotClick={handleEditorAnswerClick}
                        selectedSpot={editorAnswer}
                    />
                    <div className="flex gap-4 mt-8">
                        <button onClick={saveCurrentProblem} className="px-6 py-2 bg-green-600 rounded hover:bg-green-500 font-bold">
                            {editorStep === 'units' ? "Next" : "Save"}
                        </button>
                        <button onClick={() => { setSubMode('menu'); setEditorStep('units'); }} className="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600">
                            Back
                        </button>
                    </div>
                </div>
            )}

            {subMode === 'omega_quiz' && currentProblem && (
                <div className="flex flex-col items-center w-full max-w-2xl">
                    <div className="flex justify-between w-full mb-4 px-8">
                        <div className={`text-3xl font-black ${timer < 1.0 ? 'text-red-500' : 'text-yellow-400'}`}>{timer.toFixed(1)}s</div>
                        <div className="text-xl font-bold">Score: {quizState.score} / {quizState.total}</div>
                    </div>

                    <div className="mb-4">
                        <OmegaField
                            placedUnits={currentProblem.units}
                            showAnswerSpots={true}
                            onAnswerSpotClick={handleOmegaQuizAnswer}
                            selectedSpot={userAnswerSpot}
                            correctSpots={quizState.state === 'feedback' ? currentProblem.correctSpots : []}
                        />
                    </div>

                    {quizState.state === 'feedback' && (
                        <div className="text-center animate-in fade-in zoom-in duration-300 w-full mb-8">
                            <div className={`text-5xl font-black mb-6 ${quizState.message.includes('CORRECT') ? 'text-green-500' : 'text-red-500'}`}>
                                {quizState.message}
                            </div>
                            <button onClick={nextOmegaQuestion} className="px-8 py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 text-xl shadow-lg hover:translate-y-[-2px] transition">
                                Next Problem
                            </button>
                        </div>
                    )}

                    {quizState.state === 'playing' && (
                        <div className="text-slate-400 text-sm mb-8">Click the safe spot!</div>
                    )}

                    <button onClick={() => setSubMode('menu')} className="mt-4 text-slate-500 hover:text-white underline">
                        Quit to Menu
                    </button>
                </div>
            )}

            {subMode === 'arrow_quiz' && (
                <div className="flex flex-col items-center w-full max-w-2xl">
                    {/* Arrow Quiz UI reused */}
                    {currentProblem && (
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
                    )}
                    {!currentProblem && (
                        <div className="text-center"><button onClick={startArrowQuiz}>Start</button></div>
                    )}
                    <button onClick={() => setSubMode('menu')} className="mt-8 text-slate-500 hover:text-white underline">
                        Back to Menu
                    </button>
                </div>
            )}
        </div>
    );
}
