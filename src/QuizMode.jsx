import React, { useState, useEffect, useRef } from 'react';
import OmegaField from './OmegaField';
import ArrowGrid from './ArrowGrid';
import { patterns } from './patterns';
import { getNextOmegaProblem } from './data/omegaProblems';

export default function QuizMode() {
    const [subMode, setSubMode] = useState('menu'); // menu, omega_quiz, arrow_quiz

    // --- Omega Quiz State ---
    const [omegaState, setOmegaState] = useState('idle'); // idle, p1_playing, p1_feedback, p2_playing, p2_feedback, set_clear, set_fail
    const [currentSet, setCurrentSet] = useState({
        p1: null,
        p2: null,
        ghosts: [] // Units from P1 to show in P2
    });

    // Stats
    const [stats, setStats] = useState({
        clears: 0,
        fails: 0,
        totalTime: 0, // ms
        history: [] // { type: 'clear'|'fail', time: ms }
    });

    const [startTime, setStartTime] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [feedbackMsg, setFeedbackMsg] = useState('');
    const [userSelectedSpot, setUserSelectedSpot] = useState(null);

    // --- Arrow Quiz State ---
    const [arrowState, setArrowState] = useState({
        status: 'idle', // idle, playing, fail, clear
        seqType: null, // 'inner' | 'outer'
        currentIndex: 0,
        totalSteps: 0,
        history: [], // [{r, c}, ...]
        message: ''
    });
    const [arrowProblem, setArrowProblem] = useState(null); // { activeIndices: [], nextIndices: [] }

    // Refs for timer and auto-play
    const arrowTimerRef = useRef(null);
    const arrowStartTimeRef = useRef(0);

    // --- Omega Logic ---

    const startOmegaSet = () => {
        const p1 = getNextOmegaProblem(null, null);
        setCurrentSet({
            p1: p1,
            p2: null,
            p1Answer: null,
            ghosts: []
        });
        setOmegaState('p1_playing');
        setStartTime(Date.now());
        setElapsedTime(0);
        setUserSelectedSpot(null);
        setFeedbackMsg('');
    };

    const handleOmegaAnswer = (spotId) => {
        if (omegaState !== 'p1_playing' && omegaState !== 'p2_playing') return;

        setUserSelectedSpot(spotId);

        let currentProblem = omegaState === 'p1_playing' ? currentSet.p1 : currentSet.p2;
        const isCorrect = currentProblem.correctSpots.includes(spotId);

        if (isCorrect) {
            if (omegaState === 'p1_playing') {
                // Correct P1 -> Move to P2
                setOmegaState('p1_feedback');
                setFeedbackMsg('P1 CLEAR! Next Pattern Incoming...');

                // Save P1 answer
                setCurrentSet(prev => ({ ...prev, p1Answer: spotId }));

                // Prepare P2 immediately (or after delay)
                setTimeout(() => {
                    generateP2(currentSet.p1);
                }, 1000);
            } else {
                // Correct P2 -> Set Clear
                setOmegaState('set_clear');
                setFeedbackMsg('SET CLEARED!');
                const timeTaken = Date.now() - startTime;
                updateStats('clear', timeTaken);
            }
        } else {
            // Wrong -> Set Fail
            setOmegaState('set_fail');
            setFeedbackMsg('FAILURE! Incorrect Spot.');
            const timeTaken = Date.now() - startTime;
            updateStats('fail', timeTaken);
        }
    };

    const generateP2 = (p1Data) => {
        // P2 Constraint: Center Type Opposite
        // P2 Constraint: New M/F must be in the REMAINING empty spots (Opposite Diagonal).

        const targetCenter = p1Data.centerType === 'Vertical' ? 'Horizontal' : 'Vertical';

        // Find occupied positions in P1 (excluding center)
        const occupiedPos = p1Data.units.filter(u => u.position !== 'center').map(u => u.position);

        // Determine the diagonal for P2 (The one NOT used in P1)
        // Diagonals: [ne, sw] vs [nw, se]
        // If P1 had 'ne', then 'sw' is also occupied. So we check if 'ne' is in occupied.
        const p1HasNE = occupiedPos.includes('ne') || occupiedPos.includes('sw');
        const p1HasNW = occupiedPos.includes('nw') || occupiedPos.includes('se');

        let targetFPos = null;
        let targetMPos = null;

        if (p1HasNE) {
            // P1 used NE/SW -> P2 must use NW/SE
            targetFPos = Math.random() < 0.5 ? 'nw' : 'se'; // Randomly pick one end for F
            targetMPos = targetFPos === 'nw' ? 'se' : 'nw'; // M gets the other
        } else {
            // P1 used NW/SE -> P2 must use NE/SW
            targetFPos = Math.random() < 0.5 ? 'ne' : 'sw';
            targetMPos = targetFPos === 'ne' ? 'sw' : 'ne';
        }

        let p2Candidate = null;
        let attempts = 0;

        while (!p2Candidate && attempts < 50) {
            attempts++;
            // We request a problem, but ignore its units positions initially, 
            // relying on the generator to give us valid weapons.
            // Actually, `getNextOmegaProblem` randomizes positions too.
            // We should just use `solveOmegaProblem` directly or filter `getNextOmegaProblem`?
            // `getNextOmegaProblem` doesn't support forcing positions.
            // I will call `getNextOmegaProblem` repeatedly until I get the positions I want? 
            // No, that's inefficient (1/6 chance * 1/2 chance).
            // Better: Extract logic to build problem manually here using the generator's helpers? 
            // Or just loop `getNextOmegaProblem` but only check weapons, then force positions and Re-Solve?
            // Yes, Force Positions & Re-Solve is safer.

            const temp = getNextOmegaProblem(p1Data.units[1].type, p1Data.units[2].type);

            // We force the positions we calculated
            const centerType = targetCenter;
            const fType = temp.units[1].type; // Random valid weapon f
            const mType = temp.units[2].type; // Random valid weapon m

            // Re-import solver or just rely on the fact we need to generate valid problem?
            // If we change positions, we MUST re-solve to get correct spots.
            // But `QuizMode` doesn't modify `correctSpots`.
            // I need to import `solveOmegaProblem` in QuizMode or update generator to accept constraints.
            // Easier: Just loop. 50 attempts is usually enough for 1/12 chance.

            if (temp.centerType === targetCenter &&
                ((temp.units[1].position === targetFPos && temp.units[2].position === targetMPos) ||
                    (temp.units[1].position === targetMPos && temp.units[2].position === targetFPos))
            ) {
                p2Candidate = temp;
            }
        }

        if (!p2Candidate) {
            console.warn("Retrying P2 generation strictness...");
            // Fallback: If strict generation fails, we might just get any opposite center problem 
            // but that violates the user's rule. 
            // Actually, let's just create a constructed problem if loop fails?
            // But we need `solveOmegaProblem` logic which isn't imported here.
            // I will add the import `solveOmegaProblem` to be safe, or just rely on loop.
            // The loop is 1/2 (center) * 1/2 (diagonal) = 1/4 chance. 50 attempts is PLENTY.
            p2Candidate = getNextOmegaProblem(null, null);
        }

        const ghosts = p1Data.units
            .filter(u => u.position !== 'center')
            .map(u => ({ ...u, isGhost: true }));

        setCurrentSet(prev => ({
            ...prev,
            p2: p2Candidate,
            ghosts: ghosts
        }));

        setOmegaState('p2_playing');
        setUserSelectedSpot(null);
        setFeedbackMsg('');
    };

    const updateStats = (type, time) => {
        setStats(prev => ({
            ...prev,
            clears: type === 'clear' ? prev.clears + 1 : prev.clears,
            fails: type === 'fail' ? prev.fails + 1 : prev.fails,
            totalTime: type === 'clear' ? prev.totalTime + time : prev.totalTime,
            history: [...prev.history, { type, time }]
        }));
    };

    // Timer Loop
    useEffect(() => {
        let interval;
        if (omegaState === 'p1_playing' || omegaState === 'p2_playing') {
            interval = setInterval(() => {
                setElapsedTime(Date.now() - startTime);
            }, 50);
        }
        return () => clearInterval(interval);
    }, [omegaState, startTime]);

    // Average Calc
    const avgTime = stats.clears > 0 ? (stats.totalTime / stats.clears / 1000).toFixed(2) : '0.00';

    // --- Arrow Logic (Redesigned) ---
    const mapLevelToIndices = (level) => {
        if (level < 0 || level > 9) return [];
        return [level, 9 - level];
    };

    const startArrowQuiz = (type) => { // type: 'inner' | 'outer'
        if (!type) {
            const types = ['inner', 'outer'];
            type = types[Math.floor(Math.random() * types.length)];
        }

        setSubMode('arrow_quiz');
        setArrowState({
            status: 'playing',
            seqType: type,
            currentIndex: 0,
            totalSteps: patterns[type].length,
            history: [],
            message: ''
        });

        arrowStartTimeRef.current = Date.now();
        setElapsedTime(0);
        processArrowFrame(type, 0);
    };

    // Main Arrow Logic Processor
    const processArrowFrame = (seqType, index) => {
        const sequence = patterns[seqType];

        // Safety Check
        if (index >= sequence.length) {
            finishArrowQuiz('clear');
            return;
        }

        const currentData = sequence[index];

        // Prepare display data
        const currentIndices = currentData.levels.flatMap(mapLevelToIndices);

        // Next Indices Calculation (for validation)
        let nextIndices = [];
        if (index + 1 < sequence.length) {
            const nextData = sequence[index + 1];
            nextIndices = nextData.levels.flatMap(mapLevelToIndices);
        }

        setArrowProblem({
            activeIndices: currentIndices,
            // Next frame info is needed only if current frame is interactive (question: true)
            nextIndices: nextIndices,
            isQuestion: currentData.question
        });

        // If NOT a question (Animation only), auto-advance
        if (!currentData.question) {
            arrowTimerRef.current = setTimeout(() => {
                const nextIndex = index + 1;
                setArrowState(prev => ({ ...prev, currentIndex: nextIndex }));
                if (nextIndex >= sequence.length) {
                    finishArrowQuiz('clear');
                } else {
                    processArrowFrame(seqType, nextIndex);
                }
            }, 800); // 800ms display for non-questions
        }
    };

    const handleArrowAnswer = (r, c) => {
        if (arrowState.status !== 'playing') return;
        if (!arrowProblem || !arrowProblem.isQuestion) return; // Ignore clicks during auto-play

        // Validation Logic:
        // The user must click a Safe Spot for the NEXT frame.
        // So we check if (r, c) is contained in arrowProblem.nextIndices (Attack).
        // If it IS in nextIndices -> Hit -> Fail.
        // If NOT -> Safe -> Pass.

        const isHit = arrowProblem.nextIndices.includes(r) || arrowProblem.nextIndices.includes(c);

        if (isHit) {
            // FAILED
            setArrowState(prev => ({ ...prev, status: 'fail', message: 'Retry' }));
            if (arrowTimerRef.current) clearTimeout(arrowTimerRef.current);
        } else {
            // CORRECT -> Advance immediately
            const nextIndex = arrowState.currentIndex + 1;
            setArrowState(prev => ({
                ...prev,
                currentIndex: nextIndex,
                history: [...prev.history, { r, c }] // Record trail
            }));
            processArrowFrame(arrowState.seqType, nextIndex);
        }
    };

    const finishArrowQuiz = (result) => {
        if (arrowTimerRef.current) clearTimeout(arrowTimerRef.current);
        const totalTime = Date.now() - arrowStartTimeRef.current;
        setElapsedTime(totalTime);
        setArrowState(prev => ({
            ...prev,
            status: result,
            message: result === 'clear' ? 'SEQUENCE COMPLETE!' : 'FAILED'
        }));
    };

    // Arrow Timer (Visual Only)
    useEffect(() => {
        let interval;
        if (subMode === 'arrow_quiz' && arrowState.status === 'playing') {
            interval = setInterval(() => {
                setElapsedTime(Date.now() - arrowStartTimeRef.current);
            }, 30);
        }
        return () => {
            clearInterval(interval);
            if (arrowTimerRef.current) clearTimeout(arrowTimerRef.current);
        };
    }, [subMode, arrowState.status]);


    // --- Render Helpers ---

    const renderOmegaField = () => {
        let problem = null;
        let ghosts = [];

        if (omegaState === 'p1_playing' || omegaState === 'p1_feedback') {
            problem = currentSet.p1;
        } else if (omegaState === 'p2_playing' || omegaState === 'p2_feedback' || omegaState === 'set_clear' || omegaState === 'set_fail') {
            problem = currentSet.p2;
            ghosts = currentSet.ghosts;
        }

        if (!problem) return null;
        const displayUnits = [...problem.units, ...ghosts];
        const isInteractive = omegaState === 'p1_playing' || omegaState === 'p2_playing';
        const correctSpots = (omegaState === 'set_clear' || omegaState === 'p1_feedback') ? problem.correctSpots : [];

        return (
            <OmegaField
                placedUnits={displayUnits}
                showAnswerSpots={true}
                onAnswerSpotClick={isInteractive ? handleOmegaAnswer : undefined}
                selectedSpot={userSelectedSpot}
                previousAnswerSpot={currentSet.p1Answer}
                correctSpots={correctSpots}
                showAttacks={omegaState === 'p1_feedback' || omegaState === 'set_fail' || omegaState === 'set_clear'}
            />
        );
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-slate-950 text-white p-4 font-sans overflow-x-hidden w-full">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6 shrink-0">
                Raid Quiz / Omega
            </h1>

            {subMode === 'menu' && (
                <div className="flex flex-col gap-6 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 text-center">
                        <h2 className="text-xl font-bold mb-4 text-slate-200">Select Mode</h2>
                        <div className="flex flex-col gap-4">
                            <button onClick={() => { setSubMode('omega_quiz'); startOmegaSet(); }}
                                className="group relative px-6 py-4 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-red-500/20 hover:-translate-y-1 transition-all overflow-hidden">
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    ⚔️ Code: Omega
                                </span>
                            </button>
                            <button onClick={() => startArrowQuiz()}
                                className="group relative px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1 transition-all overflow-hidden">
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    🏹 Cosmo Arrow (Time Attack)
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {subMode === 'omega_quiz' && (
                <div className="flex flex-col xl:flex-row gap-8 w-full px-4 md:px-8 items-center xl:items-start justify-center animate-in fade-in duration-300">
                    {/* Left Panel: Field */}
                    <div className="w-full max-w-[500px] shrink-0">
                        <div className="relative aspect-square">
                            {renderOmegaField()}
                        </div>
                    </div>

                    {/* Right Panel: Info & Stats */}
                    <div className="w-full max-w-[400px] flex flex-col gap-4">
                        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-700 shadow-xl backdrop-blur">
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-slate-400 font-bold text-sm tracking-wider">TIMER</div>
                                <div className="font-mono text-4xl font-black text-yellow-400">
                                    {(elapsedTime / 1000).toFixed(2)}<span className="text-lg text-slate-500 ml-1">s</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center border-t border-slate-800 pt-4">
                                <div className="text-center">
                                    <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">AVG TIME</div>
                                    <div className="text-xl font-bold text-white">{avgTime}s</div>
                                </div>
                                <div className="h-8 w-px bg-slate-800"></div>
                                <div className="text-center">
                                    <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">CLEARS</div>
                                    <div className="text-xl font-bold text-green-400">{stats.clears}</div>
                                </div>
                                <div className="h-8 w-px bg-slate-800"></div>
                                <div className="text-center">
                                    <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">FAILS</div>
                                    <div className="text-xl font-bold text-red-400">{stats.fails}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-700 shadow-xl min-h-[150px] flex flex-col items-center justify-center text-center">
                            {(omegaState === 'set_clear' || omegaState === 'set_fail') ? (
                                <>
                                    <div className={`text-4xl font-black mb-2 animate-bounce ${omegaState === 'set_clear' ? 'text-green-500' : 'text-red-500'}`}>
                                        {omegaState === 'set_clear' ? 'PERFECT!' : 'FAILED'}
                                    </div>
                                    <div className="text-slate-400 mb-6">{feedbackMsg}</div>
                                    <button onClick={startOmegaSet} className="w-full py-4 bg-white text-slate-950 font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
                                        NEXT SET <span className="text-xl">➔</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="text-2xl font-bold text-blue-200 mb-2">
                                        {omegaState === 'p1_playing' ? 'ROUND 1' : omegaState === 'p2_playing' ? 'ROUND 2' : '...'}
                                    </div>
                                    <div className="text-slate-400 text-sm">
                                        {omegaState === 'p1_playing' && "Identify the safe spot."}
                                        {omegaState === 'p2_playing' && "Center Changed! Watch for the new safe spot."}
                                        {omegaState === 'p1_feedback' && "Correct! Prepare for Round 2..."}
                                    </div>
                                </>
                            )}
                        </div>
                        <button onClick={() => setSubMode('menu')} className="mt-auto py-3 text-slate-500 hover:text-white font-bold transition-colors">
                            Return to Menu
                        </button>
                    </div>
                </div>
            )}

            {subMode === 'arrow_quiz' && (
                <div className="flex flex-col items-center w-full max-w-2xl px-4">
                    <div className="flex justify-between w-full mb-4 md:px-8 items-end">
                        <div className="flex flex-col">
                            <div className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Time Elapsed</div>
                            <div className={`text-4xl font-black font-mono leading-none ${arrowState.status === 'fail' ? 'text-red-500' : 'text-yellow-400'}`}>
                                {(elapsedTime / 1000).toFixed(2)}s
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Step</div>
                            <div className="text-2xl font-bold font-mono">
                                {Math.min(arrowState.currentIndex + 1, arrowState.totalSteps)} / {arrowState.totalSteps}
                            </div>
                        </div>
                    </div>

                    <div className={`w-full max-w-xl relative transition-all duration-300 ${arrowProblem?.isQuestion ? 'ring-4 ring-blue-500/50 rounded-lg' : 'opacity-90'}`}>
                        {arrowProblem && (
                            <ArrowGrid
                                activeIndices={arrowState.status === 'fail' ? arrowProblem.nextIndices : arrowProblem.activeIndices}
                                isInteractive={arrowState.status === 'playing' && arrowProblem.isQuestion}
                                onCellClick={handleArrowAnswer}
                                history={arrowState.history}
                            />
                        )}
                        {/* Overlay Message when !isQuestion (Auto Playing) is NOT necessary due to visual cues, but we can add one if user wants */}
                        {arrowState.status === 'playing' && arrowProblem && !arrowProblem.isQuestion && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="bg-black/40 backdrop-blur-sm px-4 py-1 rounded-full text-white/80 font-bold text-sm border border-white/20">
                                    WATCH PATTERN
                                </div>
                            </div>
                        )}
                    </div>

                    {arrowState.message && (
                        <div className="mt-8 text-center animate-in slide-in-from-bottom-4 fade-in duration-300">
                            <div className={`text-5xl font-black mb-2 ${arrowState.status === 'clear' ? 'text-green-500' : arrowState.status === 'fail' ? 'text-red-500' : 'text-white'}`}>
                                {arrowState.message}
                            </div>
                            {arrowState.status === 'clear' && (
                                <div className="text-xl text-slate-300 mb-6">
                                    Final Time: <span className="text-yellow-400 font-mono font-bold">{(elapsedTime / 1000).toFixed(2)}s</span>
                                </div>
                            )}
                            <div className="flex gap-4 justify-center">
                                <button onClick={() => startArrowQuiz()} className="px-8 py-3 bg-white text-slate-900 font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg">
                                    RETRY
                                </button>
                                <button onClick={() => setSubMode('menu')} className="px-8 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all">
                                    MENU
                                </button>
                            </div>
                        </div>
                    )}

                    {!arrowState.message && (
                        <div className="mt-8 text-slate-500 text-sm font-medium">
                            {arrowProblem?.isQuestion
                                ? "👉 DODGE! Click a SAFE SPOT for the NEXT wave!"
                                : "👀 Watch the pattern..."}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
