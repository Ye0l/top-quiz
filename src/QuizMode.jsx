import React, { useState, useEffect, useRef } from 'react';
import OmegaField from './OmegaField';
import ArrowGrid from './ArrowGrid';
import MiniRanking from './components/MiniRanking';
import { patterns } from './patterns';
import { getNextOmegaProblem } from './data/omegaProblems';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from './contexts/UserContext';
import { addRankingEntry } from './utils/rankingService';
import { Trophy } from 'lucide-react';

export default function QuizMode({ initialMode = 'menu' }) {
    const { userProfile } = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [subMode, setSubMode] = useState(initialMode); // menu, omega_quiz, arrow_quiz, omega_unlimited
    const [rankRefresh, setRankRefresh] = useState(0);

    // --- Omega Quiz State ---
    const [omegaState, setOmegaState] = useState('idle'); // idle, p1_playing, p1_feedback, p2_playing, p2_feedback, set_clear, set_fail
    const [currentSet, setCurrentSet] = useState({
        p1: null,
        p2: null,
        ghosts: []
    });

    const arrowTimerRef = useRef(null);
    const arrowStartTimeRef = useRef(0);
    
    // Handle specific mode initialization on mount via Route Prop
    useEffect(() => {
        setSubMode(initialMode);
        resetGameState(); // Ensure clean state when switching modes
    }, [initialMode]);

    // --- Reset Logic (Hoisted) ---
    const resetGameState = () => {
        // Clear Arrow Timer
        if (arrowTimerRef.current) clearTimeout(arrowTimerRef.current);

        // Reset Omega State
        setOmegaState('idle');
        setCurrentSet({ p1: null, p2: null, ghosts: [] });

        // Reset Unlimited State
        setUnlimitedStats({ level: 1, timeLimit: 15000, score: 0 });

        // Reset Arrow State
        setArrowState({
            status: 'idle',
            seqType: null,
            currentIndex: 0,
            totalSteps: 0,
            history: [],
            message: ''
        });
        setArrowProblem(null);

        // Reset Timers
        setElapsedTime(0);
        setStartTime(0);
        arrowStartTimeRef.current = 0;
    };

    // History & Navigation Logic
    // History & Navigation Logic - Removed as Router handles it now
    // useEffect(() => { ... }, []);

    // Stats
    // Stats
    const [stats, setStats] = useState({
        clears: 0,
        fails: 0,
        streak: 0,
        totalTime: 0, // ms
        history: [] // { type: 'clear'|'fail', time: ms }
    });


    const [unlimitedStats, setUnlimitedStats] = useState({
        level: 1,
        timeLimit: 15000, // ms
        score: 0
    });

    const [startTime, setStartTime] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [feedbackMsg, setFeedbackMsg] = useState('');
    const [userSelectedSpot, setUserSelectedSpot] = useState(null);
    const [isCenterRevealed, setIsCenterRevealed] = useState(false);

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

    // --- Mobile & UI State ---
    const [isMobile, setIsMobile] = useState(false);
    const [userSelectedArrow, setUserSelectedArrow] = useState(null); // {r, c}

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Refs for timer and auto-play
    // --- Omega Logic ---

    const startOmegaSet = () => {
        const p1 = getNextOmegaProblem(null, null);
        setIsCenterRevealed(false);
        setSubMode('omega_quiz'); // Ensure subMode is correct if called from START button
        setCurrentSet({
            p1: p1,
            p2: null,
            p1Answer: null,
            ghosts: []
        });
        setOmegaState('p1_playing');
        setElapsedTime(0);
        setUserSelectedSpot(null);
        setFeedbackMsg('');
    };

    const startUnlimitedMode = () => {
        const p1 = getNextOmegaProblem(null, null);
        setSubMode('omega_unlimited');
        setOmegaState('unlimited_playing');
        setCurrentSet({
            p1: p1,
            p2: null,
            p1Answer: null,
            ghosts: []
        });
        setUnlimitedStats({
            level: 1,
            timeLimit: 15000,
            score: 0
        });
        setIsCenterRevealed(true); 
        setStartTime(Date.now());
        setElapsedTime(0);
        setUserSelectedSpot(null);
        setFeedbackMsg('');
    };

    const handleOmegaAnswer = React.useCallback((spotId) => {
        if (omegaState !== 'p1_playing' && omegaState !== 'p2_playing' && omegaState !== 'unlimited_playing') return;

        // Mobile Logic:
        if (isMobile) {
            // Unselected -> Select
            if (userSelectedSpot !== spotId) {
                setUserSelectedSpot(spotId);
            }
            // Selected -> Confirm (Double Tap)
            else {
                submitOmegaAnswer(spotId);
            }
        } else {
            // Desktop: Immediate Submit
            setUserSelectedSpot(spotId);
            submitOmegaAnswer(spotId);
        }
    }, [omegaState, isMobile, userSelectedSpot, currentSet]); // Added Dependency



    const submitOmegaAnswer = (spotId) => {
        // Logic remains same but function needs to be stable or we accept `handleOmegaAnswer` depends on it.
        // `submitOmegaAnswer` relies on many state variables. 
        // Ideally we wrap this too, but for `handleOmegaAnswer` dependency list, we can just omit it if it's defined in component scope 
        // (functions in component scope are re-created every render, so `handleOmegaAnswer` effectively depends on everything `submitOmegaAnswer` depends on).
        // To make `handleOmegaAnswer` stable, `submitOmegaAnswer` MUST be stable (useCallback) or we copy logic.
        // Let's just fix `handleOmegaAnswer` dependency to include `submitOmegaAnswer` but since `submitOmegaAnswer` is not stable, `handleOmegaAnswer` is not stable.

        // REFACTOR STRATEGY: 
        // We will skip full `useCallback` valid refactor here due to complexity of nested functions.
        // Instead, we will rely on the fact that `OmegaField` is memoized, and we pass `onAnswerSpotClick`.
        // If we don't stabilize the handler, `OmegaField` WILL re-render.
        // So we MUST stabilize `submitOmegaAnswer`.

        // ... (Original Code) ...
        if (!spotId) return;

        let currentProblem = (omegaState === 'p1_playing' || omegaState === 'unlimited_playing') ? currentSet.p1 : currentSet.p2;
        const isCorrect = currentProblem.correctSpots.includes(spotId);

        if (isCorrect) {
            // Visual Feedback: Show AOEs immediately
            setIsCenterRevealed(true);

            if (omegaState === 'p1_playing') {
                // Correct P1 -> Move to P2
                setOmegaState('p1_feedback');
                setFeedbackMsg('P1 CLEAR! Next Pattern Incoming...');
                setCurrentSet(prev => ({ ...prev, p1Answer: spotId }));
                setTimeout(() => {
                    setOmegaState('p1_transition');
                    setTimeout(() => {
                        generateP2(currentSet.p1);
                    }, 500);
                }, 2000);
            } else if (omegaState === 'unlimited_playing') {
                // Unlimited Mode Correct Feedback
                setOmegaState('unlimited_feedback');
                setFeedbackMsg('CORRECT!');

                setTimeout(() => {
                    // Logic to move to next level
                    let nextLimit = unlimitedStats.timeLimit;
                    if (nextLimit > 5000) {
                        nextLimit -= 1000;
                    } else if (nextLimit > 2000) {
                        nextLimit -= 500;
                    }
                    if (nextLimit < 2000) nextLimit = 2000;

                    setUnlimitedStats(prev => ({
                        level: prev.level + 1,
                        timeLimit: nextLimit,
                        score: prev.score + 1
                    }));

                    // Next Problem
                    const nextP = getNextOmegaProblem(null, null);
                    setCurrentSet({
                        p1: nextP,
                        p2: null,
                        p1Answer: null,
                        ghosts: []
                    });
                     // UNLIMITED MODE tracks time per stage? Or global?
                     // Currently implementation resets time per stage.
                    setStartTime(Date.now());
                    setElapsedTime(0);
                    setUserSelectedSpot(null);
                    setFeedbackMsg('');
                    setOmegaState('unlimited_playing');
                }, 500); // 0.5s Feedback
            } else {
                // Omega Normal: P2 Correct -> SET CLEAR -> Loop to next set (Survival)
                setOmegaState('p2_feedback'); // Use a feedback state rather than 'set_clear' immediately
                setFeedbackMsg('SET CLEARED! Next Set...');
                const timeTaken = elapsedTime; // Use visual timer value
                updateStats('clear', timeTaken);
                
                // Provide visual feedback then move to next set
                 setTimeout(() => {
                    // Start New Set
                    const p1 = getNextOmegaProblem(null, null);
                    setIsCenterRevealed(false);
                    setCurrentSet({
                        p1: p1,
                        p2: null,
                        p1Answer: null,
                        ghosts: []
                    });
                    setOmegaState('p1_playing');
                    setElapsedTime(0);
                    setUserSelectedSpot(null);
                    setFeedbackMsg('');
                    // startTime will be set by useEffect when center is revealed
                }, 1500);
            }
        } else {
            // Wrong -> Fail
            if (omegaState === 'unlimited_playing') {
                setOmegaState('unlimited_fail');
                setFeedbackMsg('GAME OVER');
                // Submit Ranking (Unlimited Mode Fail)
                addRankingEntry('omega_unlimited', userProfile.nickname, userProfile.job, unlimitedStats.level).then(() => setRankRefresh(prev => prev + 1));
            } else {
                setOmegaState('set_fail');
                setFeedbackMsg('FAILURE! Incorrect Spot.');
                const timeTaken = elapsedTime; // Use visual timer value
                
                // Submit Ranking (Normal Mode Fail - Survival Result)
                // Score: Consecutive Clears (stats.streak)
                // SubScore: Avg Time (totalTime / clears)
                // Note: The streak we submit is the one that just ended.
                const successfulStreak = stats.streak;
                const avg = stats.clears > 0 ? (stats.totalTime / stats.clears / 1000).toFixed(2) : 9999;
                
                if (successfulStreak > 0) {
                    addRankingEntry('omega_quiz', userProfile.nickname, userProfile.job, successfulStreak, avg).then(() => setRankRefresh(prev => prev + 1));
                }
                
                updateStats('fail', timeTaken);
            }
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

        // setStartTime(Date.now() - elapsedTime); // Handled in reveal effect to pause timer
        setIsCenterRevealed(false);
        setOmegaState('p2_playing');
        setUserSelectedSpot(null);
        setFeedbackMsg('');
    };

    const updateStats = (type, time) => {
        setStats(prev => ({
            ...prev,
            clears: type === 'clear' ? prev.clears + 1 : prev.clears,
            fails: type === 'fail' ? prev.fails + 1 : prev.fails,
            streak: type === 'clear' ? prev.streak + 1 : 0, // Reset streak on fail
            totalTime: type === 'clear' ? prev.totalTime + time : prev.totalTime,
            history: [...prev.history, { type, time }]
        }));
    };

    // Timer Loop
    useEffect(() => {
        let interval;
        if ((omegaState === 'p1_playing' || omegaState === 'p2_playing' || omegaState === 'unlimited_playing') && isCenterRevealed) {
            interval = setInterval(() => {
                const now = Date.now();
                const elapsed = now - startTime;

                const limit = omegaState === 'unlimited_playing' ? unlimitedStats.timeLimit : 30000;

                if (elapsed >= limit) {
                    setElapsedTime(limit);
                    if (omegaState === 'unlimited_playing') {
                        setOmegaState('unlimited_fail');
                        setFeedbackMsg('TIME LIMIT!');
                        // Submit Ranking (Unlimited Time Limit)
                        addRankingEntry('omega_unlimited', userProfile.nickname, userProfile.job, unlimitedStats.level).then(() => setRankRefresh(prev => prev + 1));
                    } else {
                        setOmegaState('set_fail');
                        setFeedbackMsg('TIME LIMIT EXCEEDED!');
                        
                        // Submit Ranking (Normal Mode Timeout)
                        const successfulStreak = stats.streak;
                        const avg = stats.clears > 0 ? (stats.totalTime / stats.clears / 1000).toFixed(2) : 9999;
                        
                        if (successfulStreak > 0) {
                            addRankingEntry('omega_quiz', userProfile.nickname, userProfile.job, successfulStreak, avg).then(() => setRankRefresh(prev => prev + 1));
                        }

                        updateStats('fail', 30000);
                    }
                    clearInterval(interval);
                } else {
                    setElapsedTime(elapsed);
                }
            }, 10); // 10ms update for smooth bar

        }
        return () => clearInterval(interval);
    }, [omegaState, startTime, isCenterRevealed, unlimitedStats.timeLimit, stats]);

    // Center Reveal Timer
    useEffect(() => {
        // Optimization: If already revealed, do not schedule timeout.
        // This prevents the effect from churning scheduling/clearing timeouts on every `elapsedTime` update (10ms).
        if (isCenterRevealed) return;

        let timer;
        if (omegaState === 'p1_playing' || omegaState === 'p2_playing') {
            timer = setTimeout(() => {
                setIsCenterRevealed(true);
                setStartTime(Date.now() - elapsedTime);
            }, 3000);
        } else {
            // For other states or initial load where we might want immediate reveal?
            // Actually in `startUnlimitedMode` we set `isCenterRevealed(true)` manually.
            // If `omegaState` is not playing, we usually don't need this, but existing logic had else { setTrue }.
            // The else block here runs when NOT p1/p2 playing. e.g. menu?
            // If we are in menu, `isCenterRevealed` doesn't matter much.
            // Let's keep existing behavior safely.
            setIsCenterRevealed(true);
        }
        return () => clearTimeout(timer);
    }, [omegaState, elapsedTime, isCenterRevealed]);

    // Average Calc
    const avgTime = stats.clears > 0 ? (stats.totalTime / stats.clears / 1000).toFixed(1) : '0.0';

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

        setUserSelectedArrow(null);
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

    const handleArrowAnswer = React.useCallback((r, c) => {
        if (arrowState.status !== 'playing') return;
        if (!arrowProblem || !arrowProblem.isQuestion) return;

        // Mobile Logic
        if (isMobile) {
            // Unselected or Different -> Select
            if (!userSelectedArrow || userSelectedArrow.r !== r || userSelectedArrow.c !== c) {
                setUserSelectedArrow({ r, c });
            }
            // Same -> Confirm (Double Tap)
            else {
                submitArrowAnswer({ r, c });
            }
        } else {
            // Desktop: Immediate Submit
            setUserSelectedArrow({ r, c });
            submitArrowAnswer({ r, c });
        }
    }, [arrowState.status, arrowProblem, isMobile, userSelectedArrow]);

    const submitArrowAnswer = ({ r, c }) => {
        if (!r && r !== 0) return; // Safety

        // Validation Logic:
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
                history: [...prev.history, { r, c }]
            }));
            setUserSelectedArrow(null); // Clear selection for next step
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
        if (result === 'clear') {
            const totalTime = Date.now() - arrowStartTimeRef.current; // Re-calculate to be sure or use local var if available
            addRankingEntry('arrow_quiz', userProfile.nickname, userProfile.job, totalTime).then(() => setRankRefresh(prev => prev + 1));
        }
    };

    // Arrow Timer (Visual & Logic)
    useEffect(() => {
        let interval;
        if (subMode === 'arrow_quiz' && arrowState.status === 'playing') {
            interval = setInterval(() => {
                const now = Date.now();
                const elapsed = now - arrowStartTimeRef.current;

                if (elapsed >= 30000) {
                    setElapsedTime(30000);
                    setArrowState(prev => ({
                        ...prev,
                        status: 'fail',
                        message: 'TIME LIMIT!'
                    }));
                    if (arrowTimerRef.current) clearTimeout(arrowTimerRef.current);
                    clearInterval(interval);
                } else {
                    setElapsedTime(elapsed);
                }
            }, 10);
        }
        return () => {
            clearInterval(interval);
        };
    }, [subMode, arrowState.status]);


    // --- Render Helpers ---

    // --- Return to Menu & Reset ---
    const returnToMenu = () => {
        // Use Router navigate to return to root
        navigate('/');
        // resetGameState(); // Will be handled by unmount/mount of QuizMode at '/'
        setSubMode('menu'); // Redundant if unmounting, but safe for immediate update
    };

    // --- Memoize Data derived from state to ensure stability for React.memo children ---
    const currentProblemForRender = (omegaState === 'p1_playing' || omegaState === 'p1_feedback' || omegaState === 'p1_transition' || omegaState === 'unlimited_playing' || omegaState === 'unlimited_fail' || omegaState === 'unlimited_feedback')
        ? currentSet.p1
        : ((omegaState === 'p2_playing' || omegaState === 'p2_feedback' || omegaState === 'set_clear' || (omegaState === 'set_fail' && currentSet.p2)) ? currentSet.p2 : currentSet.p1);

    const ghostsForRender = (omegaState === 'p2_playing' || omegaState === 'p2_feedback' || omegaState === 'set_clear' || (omegaState === 'set_fail' && currentSet.p2))
        ? currentSet.ghosts
        : [];

    const displayUnits = React.useMemo(() => {
        // Fix Ghosting: Ensure we don't render P2 ghosts if we are simply transitioning from P1
        if (omegaState === 'p1_transition') {
             return currentSet.p1.units;
        }
        if (!currentProblemForRender) return [];
        return [...currentProblemForRender.units, ...(ghostsForRender || [])];
    }, [currentProblemForRender, ghostsForRender, omegaState, currentSet.p1]);

    const displayCorrectSpots = React.useMemo(() => {
        // Fix P2 Feedback: Include p2_feedback state
        if (omegaState === 'set_clear' || omegaState === 'p1_feedback' || omegaState === 'p2_feedback' || omegaState === 'unlimited_fail' || omegaState === 'unlimited_feedback') {
            return currentProblemForRender ? currentProblemForRender.correctSpots : [];
        }
        return [];
    }, [omegaState, currentProblemForRender]);

    const shouldShowAttacks = omegaState === 'p1_feedback' || omegaState === 'p2_feedback' || omegaState === 'set_fail' || omegaState === 'set_clear' || omegaState === 'p1_transition' || omegaState === 'unlimited_fail' || omegaState === 'unlimited_feedback';
    const isInteractive = omegaState === 'p1_playing' || omegaState === 'p2_playing' || omegaState === 'unlimited_playing';
    const renderStartOverlay = () => {
        let title = '';
        let desc = '';
        let onStart = null;

        if (subMode === 'omega_quiz') {
            title = 'Code: Omega (Normal)';
            desc = '두 번의 기믹 패턴을 파악하여 안전한 위치를 순서대로 찾아내세요.';
            onStart = startOmegaSet;
        } else if (subMode === 'omega_unlimited') {
            title = 'Code: Omega (Unlimited)';
            desc = '제한 시간 내에 끊임없이 문제를 해결하세요. 갈수록 시간이 짧아집니다.';
            onStart = startUnlimitedMode;
        } else if (subMode === 'arrow_quiz') {
            title = 'Cosmo Arrow Quiz';
            desc = '화살표 기믹이 터지는 순서를 파악하여 안전한 경로로 이동하세요.';
            onStart = () => startArrowQuiz();
        }

        return (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center animate-in fade-in zoom-in duration-300">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{title}</h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                        {desc}
                    </p>
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={onStart}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-600 text-white font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
                        >
                            START MISSION
                        </button>
                        <button 
                            onClick={returnToMenu}
                            className="w-full py-3 bg-slate-200/50 dark:bg-white/10 text-slate-600 dark:text-white/70 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-white/20 transition-all"
                        >
                            Return to Menu
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderOmegaField = () => {
        const isIdle = omegaState === 'idle';
        if (!currentProblemForRender && !isIdle) return null;

        return (
            <div className="relative w-full aspect-square">
                {isIdle && renderStartOverlay()}
                <OmegaField
                    placedUnits={displayUnits}
                    showAnswerSpots={!isIdle}
                    onAnswerSpotClick={isInteractive ? handleOmegaAnswer : undefined}
                    selectedSpot={userSelectedSpot}
                    previousAnswerSpot={currentSet.p1Answer}
                    correctSpots={displayCorrectSpots}
                    showAttacks={shouldShowAttacks}
                    isTransitioning={omegaState === 'p1_transition'}
                    isMobile={isMobile}
                    isCenterRevealed={isCenterRevealed}
                />
            </div>
        );
    };


    return (
        <div className="flex flex-col items-center min-h-[calc(100vh-2rem)] w-full font-sans overflow-x-hidden">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500 mb-6 shrink-0 drop-shadow-sm pt-4">
                Omega Protocol Trainer
            </h1>

            {subMode === 'menu' && (
                <div className="flex flex-col gap-6 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-xl text-center">
                        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">Select Mode</h2>
                        <div className="flex flex-col gap-4">
                            <button onClick={() => navigate('/omega-normal')}
                                className="group relative px-6 py-4 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl font-bold text-lg text-white shadow-lg hover:shadow-red-500/20 hover:-translate-y-1 transition-all overflow-hidden">
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    ⚔️ Code: Omega (Normal)
                                </span>
                            </button>
                            <button onClick={() => navigate('/omega-unlimited')}
                                className="group relative px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-bold text-lg text-white shadow-lg hover:shadow-purple-500/20 hover:-translate-y-1 transition-all overflow-hidden">
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    ♾️ Code: Omega (Unlimited)
                                </span>
                            </button>
                            <button onClick={() => navigate('/arrow-quiz')}
                                className="group relative px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-bold text-lg text-white shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1 transition-all overflow-hidden">
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    🏹 Cosmo Arrow
                                </span>
                            </button>
                        </div>
                        
                        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                             <Link to="/ranking" className="group flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:text-yellow-500 dark:hover:text-yellow-400 font-bold transition-all p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                                 <Trophy className="w-5 h-5" />
                                 <span>Hall of Fame</span>
                             </Link>
                        </div>
                    </div>
                </div>
            )}

            {(subMode === 'omega_quiz' || subMode === 'omega_unlimited') && (
                <div className="flex flex-col xl:flex-row gap-8 w-full px-4 md:px-8 items-center xl:items-start justify-center animate-in fade-in duration-300">
                    {/* Left Panel: Field */}
                    <div className="w-full max-w-[75vh] shrink-0">
                        <div className="relative aspect-square">
                            {renderOmegaField()}
                        </div>
                    </div>

                    {/* Right Panel: Info & Stats */}
                    <div className="w-full max-w-[400px] flex flex-col gap-4">
                        <div className="bg-white/60 dark:bg-slate-900/80 p-6 rounded-2xl border border-white/20 dark:border-slate-700 shadow-xl backdrop-blur-md">
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-wider">{subMode === 'omega_unlimited' ? 'REMAINING' : 'TIMER'}</div>
                                <div className={`font-led text-4xl font-black ${subMode === 'omega_unlimited' && (unlimitedStats.timeLimit - elapsedTime) < 5000 ? 'text-red-500 animate-pulse' : 'text-yellow-500 dark:text-yellow-400'}`}>
                                    {subMode === 'omega_unlimited'
                                        ? ((unlimitedStats.timeLimit - elapsedTime) / 1000).toFixed(2)
                                        : (elapsedTime / 1000).toFixed(2)
                                    }<span className="text-lg text-slate-500 ml-1">s</span>
                                </div>
                            </div>
                            {subMode === 'omega_quiz' ? (
                                <div className="grid grid-cols-4 divide-x divide-slate-200 dark:divide-slate-800 border-t border-slate-200 dark:border-slate-800 pt-4">
                                    <div className="text-center px-1">
                                        <div className="text-[9px] uppercase text-slate-500 dark:text-slate-500 font-bold mb-1">STREAK</div>
                                        <div className="text-lg font-bold text-yellow-600 dark:text-yellow-500">{stats.streak}</div>
                                    </div>
                                    <div className="text-center px-1">
                                        <div className="text-[9px] uppercase text-slate-500 dark:text-slate-500 font-bold mb-1">AVG.T</div>
                                        <div className="text-lg font-bold text-slate-800 dark:text-white">{avgTime}s</div>
                                    </div>
                                    <div className="text-center px-1">
                                        <div className="text-[9px] uppercase text-slate-500 dark:text-slate-500 font-bold mb-1">CLEARS</div>
                                        <div className="text-lg font-bold text-green-600 dark:text-green-400">{stats.clears}</div>
                                    </div>
                                    <div className="text-center px-1">
                                        <div className="text-[9px] uppercase text-slate-500 dark:text-slate-500 font-bold mb-1">FAILS</div>
                                        <div className="text-lg font-bold text-red-500 dark:text-red-400">{stats.fails}</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-800 pt-4">
                                    <div className="text-center w-full">
                                        <div className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-bold mb-1">CURRENT STAGE</div>
                                        <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">STAGE {unlimitedStats.level}</div>
                                    </div>
                                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
                                    <div className="text-center w-full">
                                        <div className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-bold mb-1">LIMIT</div>
                                        <div className="text-xl font-bold text-red-500 dark:text-red-400">{unlimitedStats.timeLimit / 1000}s</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-white/60 dark:bg-slate-900/80 p-6 rounded-2xl border border-white/20 dark:border-slate-700 shadow-xl backdrop-blur-md min-h-[150px] flex flex-col items-center justify-center text-center">
                            {(omegaState === 'set_clear' || omegaState === 'set_fail' || omegaState === 'unlimited_fail') ? (
                                <>
                                    <div className={`text-4xl font-black mb-2 animate-bounce ${omegaState === 'set_clear' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                                        {omegaState === 'set_clear' ? 'PERFECT!' : 'GAME OVER'}
                                    </div>
                                    <div className="text-slate-600 dark:text-slate-400 mb-6 flex flex-col items-center">
                                        {omegaState === 'unlimited_fail' ? (
                                            <>
                                                <div className="text-lg text-slate-900 dark:text-white font-bold mb-1">Reached STAGE {unlimitedStats.level}</div>
                                                <div className="text-sm text-slate-500 dark:text-slate-500">Fastest Interval: {unlimitedStats.timeLimit / 1000}s</div>
                                            </>
                                        ) : (
                                            feedbackMsg
                                        )}
                                    </div>
                                    <button onClick={omegaState === 'unlimited_fail' ? startUnlimitedMode : startOmegaSet} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
                                        {omegaState === 'unlimited_fail' ? 'RETRY' : 'NEXT SET'} <span className="text-xl">➔</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="text-2xl font-bold text-blue-200 mb-2">
                                        {omegaState === 'p1_playing' ? 'ROUND 1' : omegaState === 'p2_playing' ? 'ROUND 2' : omegaState === 'unlimited_playing' ? `STAGE ${unlimitedStats.level}` : omegaState === 'unlimited_feedback' ? 'GOOD!' : '...'}
                                    </div>
                                    <div className="text-slate-400 text-sm">
                                        {omegaState === 'p1_playing' && "Identify the safe spot."}
                                        {omegaState === 'p2_playing' && "Center Changed! Watch for the new safe spot."}
                                        {omegaState === 'p1_feedback' && "Correct! Prepare for Round 2..."}
                                        {(omegaState === 'unlimited_playing' || omegaState === 'unlimited_feedback') && "Survive as long as you can."}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    {/* PC Ranking Sidebar for Omega */}
                    {!isMobile && (subMode === 'omega_quiz' || subMode === 'omega_unlimited') && (
                        <div className="w-[300px] shrink-0 h-[600px] animate-in slide-in-from-right-4 duration-500">
                             <MiniRanking category={subMode} refreshTrigger={rankRefresh} />
                        </div>
                    )}
                    
                    {!isMobile && (
                        <button onClick={returnToMenu} className="fixed bottom-4 right-4 py-3 text-slate-500 hover:text-white font-bold transition-colors z-50">
                            Return to Menu
                        </button>
                    )}

                </div>
            )}
            {subMode === 'arrow_quiz' && (
                <div className="flex flex-col xl:flex-row gap-8 w-full px-4 md:px-8 items-center xl:items-start justify-center animate-in fade-in duration-300">
                    {/* Left Panel: Field */}
                    <div className="w-full max-w-[75vh] shrink-0">
                        <div className="flex justify-between w-full mb-4 md:px-8 items-end">
                            <div className="flex flex-col">
                                <div className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Time Elapsed</div>
                                <div className={`text-4xl font-black font-led leading-none ${arrowState.status === 'fail' ? 'text-red-500' : 'text-yellow-400'}`}>
                                    {(elapsedTime / 1000).toFixed(2)}s
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Step</div>
                                <div className="text-2xl font-bold font-led">
                                    {Math.min(arrowState.currentIndex + 1, arrowState.totalSteps)} / {arrowState.totalSteps}
                                </div>
                            </div>
                        </div>

                        <div className="relative aspect-square">
                            {arrowState.status === 'idle' && renderStartOverlay()}
                            <ArrowGrid
                                activeIndices={arrowState.status === 'fail' && arrowProblem?.nextIndices ? arrowProblem.nextIndices : (arrowProblem ? arrowProblem.activeIndices : [])}
                                isInteractive={arrowState.status === 'playing' && arrowProblem?.isQuestion}
                                onCellClick={handleArrowAnswer}
                                history={arrowState.history}
                                selectedCell={userSelectedArrow}
                            />

                            {arrowState.status === 'playing' && arrowProblem && !arrowProblem.isQuestion && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="bg-black/40 backdrop-blur-sm px-4 py-1 rounded-full text-white/80 font-bold text-sm border border-white/20">
                                        WATCH PATTERN
                                    </div>
                                </div>
                            )}
                        </div>

                        {!arrowState.message && arrowState.status === 'playing' && (
                            <div className="mt-8 text-center text-slate-500 text-sm font-medium">
                                {arrowProblem?.isQuestion
                                    ? "👉 DODGE! Click a SAFE SPOT for the NEXT wave!"
                                    : "👀 Watch the pattern..."}
                            </div>
                        )}

                        {arrowState.message && (
                            <div className="mt-8 text-center animate-in slide-in-from-bottom-4 fade-in duration-300">
                                <div className={`text-5xl font-black mb-2 ${arrowState.status === 'clear' ? 'text-green-600 dark:text-green-500' : arrowState.status === 'fail' ? 'text-red-600 dark:text-red-500' : 'text-slate-900 dark:text-white'}`}>
                                    {arrowState.message}
                                </div>
                                {arrowState.status === 'clear' && (
                                    <div className="text-xl text-slate-600 dark:text-slate-300 mb-6">
                                        Final Time: <span className="text-yellow-600 dark:text-yellow-400 font-led font-bold">{(elapsedTime / 1000).toFixed(2)}s</span>
                                    </div>
                                )}
                                <div className="flex gap-4 justify-center">
                                    <button onClick={() => startArrowQuiz()} className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg">
                                        RETRY
                                    </button>
                                    <button onClick={returnToMenu} className="px-8 py-3 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-all">
                                        MENU
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Mobile and PC rankings etc. */}
                    {!isMobile && (
                        <div className="w-[300px] shrink-0 h-[600px] animate-in slide-in-from-right-4 duration-500">
                             <MiniRanking category="arrow_quiz" refreshTrigger={rankRefresh} />
                        </div>
                    )}
                    
                    {!isMobile && (
                        <button onClick={returnToMenu} className="fixed bottom-4 right-4 py-3 text-slate-500 hover:text-white font-bold transition-colors z-50">
                            Return to Menu
                        </button>
                    )}
                </div>
            )}

            {/* Floating Controls (Mobile Only) */}
            {
                isMobile && subMode !== 'menu' && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-4 bg-white/90 dark:bg-slate-900/90 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl backdrop-blur-md">

                        {/* CONFIRM BUTTON (Playing State) */}
                        {((subMode === 'omega_quiz' && (omegaState === 'p1_playing' || omegaState === 'p2_playing')) ||
                            (subMode === 'omega_unlimited' && omegaState === 'unlimited_playing') ||
                            (subMode === 'arrow_quiz' && arrowState.status === 'playing' && arrowProblem?.isQuestion)) && (
                                <button
                                    onClick={() => {
                                        if (subMode === 'omega_quiz' || subMode === 'omega_unlimited') submitOmegaAnswer(userSelectedSpot);
                                        if (subMode === 'arrow_quiz' && userSelectedArrow) submitArrowAnswer(userSelectedArrow);
                                    }}
                                    disabled={subMode === 'omega_quiz' ? !userSelectedSpot : !userSelectedArrow}
                                    className={`px-8 py-3 rounded-xl font-black text-lg shadow-lg transition-all flex items-center gap-2
                            ${(subMode === 'omega_quiz' ? userSelectedSpot : userSelectedArrow)
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-105 active:scale-95'
                                            : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
                                >
                                    CONFIRM <span>✓</span>
                                </button>
                            )}

                        {/* RETRY / NEXT / MENU BUTTONS (Result State) */}

                        {/* Omega Result Actions */}
                        {(subMode === 'omega_quiz' || subMode === 'omega_unlimited') && (omegaState === 'set_clear' || omegaState === 'set_fail' || omegaState === 'unlimited_fail') && (
                            <>
                                <button onClick={subMode === 'omega_unlimited' ? startUnlimitedMode : startOmegaSet} className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl shadow-lg hover:scale-105">
                                    {omegaState === 'set_clear' || omegaState === 'unlimited_playing' ? 'NEXT' : 'RETRY'}
                                </button>
                                <button onClick={returnToMenu} className="px-4 py-3 bg-slate-800 text-white font-bold rounded-xl shadow-md">
                                    EXIT
                                </button>
                            </>
                        )}

                        {/* Arrow Result Actions */}
                        {subMode === 'arrow_quiz' && (arrowState.status === 'clear' || arrowState.status === 'fail') && (
                            <>
                                <button onClick={() => startArrowQuiz()} className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl shadow-lg hover:scale-105">
                                    RETRY
                                </button>
                                <button onClick={returnToMenu} className="px-4 py-3 bg-slate-800 text-white font-bold rounded-xl shadow-md">
                                    EXIT
                                </button>
                            </>
                        )}

                        {/* EXIT Button (Playing) */}
                        {((subMode === 'omega_quiz' && (omegaState === 'p1_playing' || omegaState === 'p2_playing')) ||
                            (subMode === 'omega_unlimited' && omegaState === 'unlimited_playing') ||
                            (subMode === 'arrow_quiz' && arrowState.status === 'playing')) && (
                                <button onClick={returnToMenu} className="px-4 py-3 bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold rounded-xl border border-slate-200 dark:border-slate-700">
                                    ✕
                                </button>
                            )}

                    </div>
                )
            }
        </div>
    )
}
